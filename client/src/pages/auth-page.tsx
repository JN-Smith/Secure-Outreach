import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/mock-auth";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Enter a valid work email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AuthPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    try {
      await login(values.email, values.password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-[#EDE8DF] py-10 px-4">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 mt-4">
        <div className="h-16 w-16 rounded-2xl bg-[#F5A623] flex items-center justify-center shadow-lg">
          <Sparkles className="h-8 w-8 text-black" />
        </div>
        <h1 className="text-3xl font-bold text-[#1C1C1C] tracking-tight">Manifest Kenya</h1>
        <p className="text-xs font-semibold tracking-[0.2em] text-[#6B6B6B] uppercase">
          Ecclesiastical Management
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm mt-8">
        <div className="h-1 w-full bg-[#F5A623] rounded-t-sm" />
        <div className="bg-white rounded-b-2xl shadow-md px-7 py-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#1C1C1C]">Secure Access</h2>
            <p className="text-sm text-[#6B6B6B] leading-relaxed">
              Please authenticate with your ministry credentials to continue your mission strategy.
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-[0.15em] text-[#4A4A4A] uppercase">
                Work Email
              </label>
              <div className="flex items-center gap-3 bg-[#F0EBE3] rounded-lg px-4 h-12">
                <Mail className="h-4 w-4 text-[#9B9B9B] shrink-0" />
                <input
                  type="email"
                  placeholder="evangelist@manifest.ke"
                  className="flex-1 bg-transparent text-sm text-[#1C1C1C] placeholder:text-[#ABABAB] outline-none"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold tracking-[0.15em] text-[#4A4A4A] uppercase">
                  Security Key
                </label>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#C47F17] tracking-wide uppercase hover:underline"
                >
                  Recover Access
                </button>
              </div>
              <div className="flex items-center gap-3 bg-[#F0EBE3] rounded-lg px-4 h-12">
                <Lock className="h-4 w-4 text-[#9B9B9B] shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••••"
                  className="flex-1 bg-transparent text-sm text-[#1C1C1C] placeholder:text-[#ABABAB] outline-none"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-[#9B9B9B] hover:text-[#4A4A4A]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>

            {error && (
              <p className="text-xs text-red-600 text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full h-13 bg-[#F5A623] hover:bg-[#E09415] active:bg-[#C47F17] text-black font-bold text-sm tracking-[0.12em] uppercase rounded-xl flex items-center justify-center gap-2 transition-colors py-4"
            >
              Log In <span className="text-base">→</span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E0DAD2]" />
            <span className="text-xs text-[#9B9B9B] tracking-wide uppercase">Or continue with</span>
            <div className="flex-1 h-px bg-[#E0DAD2]" />
          </div>

          {/* Google Workspace */}
          <button
            type="button"
            className="w-full h-12 border border-[#E0DAD2] rounded-xl flex items-center justify-center gap-3 bg-white hover:bg-[#F9F6F1] transition-colors text-sm font-medium text-[#1C1C1C]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2045C17.64 8.5664 17.5827 7.9527 17.4764 7.3636H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.2045Z" fill="#4285F4"/>
              <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
              <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.5932 3.68182 9C3.68182 8.4068 3.78409 7.83 3.96409 7.29V4.9582H0.957275C0.347727 6.1732 0 7.5477 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
              <path d="M9 3.5795C10.3214 3.5795 11.5077 4.0336 12.4405 4.9255L15.0218 2.3441C13.4632 0.8918 11.4259 0 9 0C5.48182 0 2.43818 2.0168 0.957275 4.9582L3.96409 7.29C4.67182 5.1627 6.65591 3.5795 9 3.5795Z" fill="#EA4335"/>
            </svg>
            Ministry Google Workspace
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-3 mt-8 mb-2">
        <p className="text-xs text-[#9B9B9B] text-center">
          © 2024 Manifest Kenya Outreach.<br />
          Protected by end-to-end ecclesiastical encryption.
        </p>
        <div className="flex gap-5 text-xs font-semibold tracking-wide text-[#7A7A7A] uppercase">
          <button type="button" className="hover:text-[#C47F17]">Privacy Pact</button>
          <button type="button" className="hover:text-[#C47F17]">System Terms</button>
          <button type="button" className="hover:text-[#C47F17]">Support</button>
        </div>
      </div>
    </div>
  );
}
