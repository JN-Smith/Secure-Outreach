import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";
import { AuthProvider, useAuth } from "@/lib/mock-auth";
import { ContactsProvider } from "@/lib/contacts-context";

// Pages
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ContactsPage from "@/pages/contacts-page";
import ContactFormPage from "@/pages/contact-form-page";
import SettingsPage from "@/pages/settings-page";

function AuthenticatedApp() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/contacts" component={ContactsPage} />
        <Route path="/contacts/new" component={ContactFormPage} />
        <Route path="/settings" component={SettingsPage} />
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
          <ContactsProvider>
            <Toaster />
            <Router />
          </ContactsProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
