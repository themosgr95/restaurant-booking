"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("credentials", { 
      email, 
      password, 
      callbackUrl: "/staff/dashboard" 
    });
    setLoading(false);
  };

  const handleSocialLogin = (provider: string) => {
    signIn(provider, { callbackUrl: "/staff/dashboard" });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
           <div className="w-12 h-12 bg-black rounded-xl text-white flex items-center justify-center font-black italic text-2xl mx-auto mb-4">D!</div>
           <h1 className="text-2xl font-black text-gray-900">Welcome Back</h1>
           <p className="text-gray-500 text-sm mt-1">Enter your credentials to access the dashboard.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
           
           {/* Email */}
           <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                 <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                 <input 
                   type="email" 
                   required
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full pl-10 p-3 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                   placeholder="name@restaurant.com"
                 />
              </div>
           </div>

           {/* Password */}
           <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                 <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                 <input 
                   type={showPassword ? "text" : "password"} 
                   required
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full pl-10 pr-10 p-3 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                   placeholder="••••••••"
                 />
                 <button 
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                   tabIndex={-1}
                 >
                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                 </button>
              </div>
           </div>

           {/* Forgot Password Link */}
           <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-xs font-bold text-gray-500 hover:text-black">
                Forgot password?
              </Link>
           </div>

           <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-black text-white p-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
           >
             {loading ? "Signing in..." : "Sign In"}
           </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
           <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
           <div className="relative flex justify-center text-xs uppercase font-bold text-gray-400">
              <span className="bg-white px-2">Or continue with</span>
           </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
           <button 
             onClick={() => handleSocialLogin("google")}
             className="flex items-center justify-center gap-2 p-3 border rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
           >
             <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"/></svg>
             Google
           </button>
           <button 
             onClick={() => handleSocialLogin("apple")}
             className="flex items-center justify-center gap-2 p-3 border rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
           >
             <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M14.25.18l-.9.2.73 2.63.52 2.2a3.5 3.5 0 0 0 1.97-3.05a2.48 2.48 0 0 0-.27-1.4a1.59 1.59 0 0 0-2.05-.58M12.03 5.43c-1.34-1.83-4.32-.88-5.32 1.39-2.36 5.56 1.76 11.23 4.54 11.23 1.12 0 1.9-.66 3.12-.66 1.25 0 2 .66 3.12.66 2.65 0 5.1-4.72 4.67-9.58-2.6-.97-3.65-4.59-1.39-6.73a4.78 4.78 0 0 0-3.69-2.81c-2.4-.23-3.65 1.78-5.05 1.78Z"/></svg>
             Apple
           </button>
        </div>

      </div>
    </div>
  );
}