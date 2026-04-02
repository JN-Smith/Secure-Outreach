import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ContactsProvider } from "@/lib/contacts-context";

// Pages
import AuthPage from "@/pages/auth-page";
import AcceptInvitePage from "@/pages/accept-invite-page";
import ContactsPage from "@/pages/contacts-page";
import ContactFormPage from "@/pages/contact-form-page";
import FollowUpsPage from "@/pages/followups-page";
import SettingsPage from "@/pages/settings-page";
import EvangelistDashboard from "@/pages/evangelist-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import PastorDashboard from "@/pages/pastor-dashboard";
import EvangelistsPage from "@/pages/evangelists-page";
import AdminsPage from "@/pages/admins-page";
import AnalyticsPage from "@/pages/analytics-page";

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
        <Route path="/evangelists" component={EvangelistsPage} />
        <Route path="/admins" component={AdminsPage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/followups" component={FollowUpsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  // Public route — accessible without authentication
  if (location.startsWith("/accept-invite")) {
    return <AcceptInvitePage />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <ContactsProvider>
              <Toaster richColors position="top-right" />
              <Router />
            </ContactsProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
