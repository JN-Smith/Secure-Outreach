import { Switch, Route } from "wouter";
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
import ContactsPage from "@/pages/contacts-page";
import ContactFormPage from "@/pages/contact-form-page";
import SettingsPage from "@/pages/settings-page";
import EvangelistDashboard from "@/pages/evangelist-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import PastorDashboard from "@/pages/pastor-dashboard";

function AuthenticatedApp() {
  const { user } = useAuth();

  const DashboardComponent =
    user?.role === "pastor" ? PastorDashboard :
    user?.role === "admin" ? AdminDashboard :
    EvangelistDashboard;

  return (
    <Layout>
      <Switch>
        <Route path="/" component={DashboardComponent} />
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

  if (!user) {
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
