import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/mock-auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { HeartHandshake } from "lucide-react";
import generatedImage from '@assets/generated_images/abstract_community_connection_background.png';


const formSchema = z.object({
  username: z.string().min(2, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["evangelist", "pastor", "admin"]),
});


export default function AuthPage() {
  const { login, signup } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
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
    if (isSignUp) {
      try {
        await signup(values.username, values.password, values.role);
      } catch (err: any) {
        setError(err.message || "Sign up failed");
      }
    } else {
      try {
        await login(values.username, values.password);
      } catch (err: any) {
        setError(err.message || "Sign in failed");
      }
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-in slide-in-from-left-8 duration-700">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
                <HeartHandshake className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp ? "Sign up to start your outreach mission." : "Sign in to continue your outreach mission."}
            </p>
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
                    {isSignUp ? "Sign Up" : "Sign In"}
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center text-sm">
                <button
                  className="text-primary hover:underline font-medium"
                  onClick={() => { setIsSignUp((v) => !v); setError(null); }}
                >
                  {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                </button>
              </div>

              <div className="mt-6 text-center text-sm">
                <a href="#" className="text-primary hover:underline font-medium">
                  Forgot your password?
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Column - Image */}
      <div className="hidden lg:block w-1/2 relative bg-muted">
        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply z-10" />
        <img 
          src={generatedImage} 
          alt="Community Connection" 
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-12 z-20 bg-gradient-to-t from-black/60 to-transparent text-white">
          <blockquote className="space-y-2">
            <p className="text-2xl font-heading font-medium leading-relaxed">
              "Go therefore and make disciples of all nations..."
            </p>
            <footer className="text-white/80 font-medium">— Matthew 28:19</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
