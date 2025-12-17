import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";
import { AuthProvider, useAuth } from "@/lib/mock-auth";

// Pages
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ContactsPage from "@/pages/contacts-page";
import ContactFormPage from "@/pages/contact-form-page";

function AuthenticatedApp() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/contacts" component={ContactsPage} />
        <Route path="/contacts/new" component={ContactFormPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  const { user } = useAuth();
  const [location] = useLocation();

  // Simple protection check
  if (!user && location !== "/auth") {
    return <AuthPage />;
  }

  if (user && location === "/auth") {
    // If logged in and trying to access auth, redirect to dash
    // Note: In real wouter, might need useEffect for redirect, but rendering App is fine
    return <AuthenticatedApp />;
  }

  if (location === "/auth") {
    return <AuthPage />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
