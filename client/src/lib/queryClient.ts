import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function getAuthHeaders(hasBody: boolean): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function tryRefreshToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    localStorage.setItem("access_token", data.access_token);
    return data.access_token;
  } catch {
    return null;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  let res = await fetch(url, {
    method,
    headers: getAuthHeaders(!!data),
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // On 401, try once to refresh then retry
  if (res.status === 401) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      res = await fetch(url, {
        method,
        headers: getAuthHeaders(!!data),
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
    } else {
      localStorage.removeItem("access_token");
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    let res = await fetch(url, {
      credentials: "include",
      headers: getAuthHeaders(false),
    });

    if (res.status === 401) {
      const newToken = await tryRefreshToken();
      if (newToken) {
        res = await fetch(url, {
          credentials: "include",
          headers: getAuthHeaders(false),
        });
      } else {
        localStorage.removeItem("access_token");
        if (unauthorizedBehavior === "returnNull") return null;
        throw new Error("401: Unauthorized");
      }
    }

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
