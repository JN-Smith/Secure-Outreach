import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Shield, User, Globe } from "lucide-react";
import { useAuth } from "@/lib/mock-auth";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-heading font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>Update your personal details and contact info.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" defaultValue={user?.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" defaultValue={user?.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Contact admin to change email.</p>
            </div>
            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Configure how you want to be alerted.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Contact Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when a new contact is assigned to you.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Follow-up Reminders</Label>
                <p className="text-sm text-muted-foreground">Daily reminders for pending follow-ups.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>Application Preferences</CardTitle>
            </div>
            <CardDescription>Customize your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes.</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Offline Mode</Label>
                <p className="text-sm text-muted-foreground">Cache data for offline access.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-destructive/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Security</CardTitle>
            </div>
            <CardDescription>Manage your password and session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30">
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
