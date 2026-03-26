import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

const formSchema = z.object({
  username: z.string().min(2, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["evangelist", "pastor", "admin"]),
});

export default function SignUpPage() {
  const _auth = useAuth(); // signup not yet implemented — placeholder
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "evangelist",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    try {
      // signup not yet wired — admin creates users via the admin dashboard
      throw new Error("Self-registration disabled. Contact your admin.");
    } catch (err: any) {
      setError(err.message || "Sign up failed");
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      <div className="w-full flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-in slide-in-from-top-8 duration-700">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">Create Account</h1>
            <p className="text-muted-foreground">Sign up to start your outreach mission.</p>
          </div>
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="your username" className="h-11 bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" className="h-11 bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 bg-white">
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="evangelist">Evangelist</SelectItem>
                            <SelectItem value="pastor">Pastor / Leader</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                  <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                    Sign Up
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center text-sm">
                <Link href="/auth" className="text-primary hover:underline font-medium">
                  Already have an account? Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
