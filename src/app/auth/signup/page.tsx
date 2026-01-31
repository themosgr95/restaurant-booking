"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Auto-login after registration
      await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        callbackUrl: "/staff/dashboard",
      });

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-gray-100">
        
        <div className="text-center mb-8">
           <div className="w-12 h-12 bg-black rounded-xl text-white flex items-center justify-center font-black italic text-2xl mx-auto mb-4">D!</div>
           <h1 className="text-2xl font-black text-gray-900">Create Account</h1>
           <p className="text-gray-500 text-sm mt-1">Join the team to manage reservations.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
           {/* Name */}
           <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                 <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                 <input 
                   type="text" 
                   required
                   value={formData.name}
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   className="w-full pl-10 p-3 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                   placeholder="John Doe"
                 />
              </div>
           </div>

           {/* Email */}
           <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                 <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                 <input 
                   type="email" 
                   required
                   value={formData.email}
                   onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                   value={formData.password}
                   onChange={(e) => setFormData({...formData, password: e.target.value})}
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

           <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-black text-white p-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
           >
             {loading ? "Creating..." : "Sign Up"} <ArrowRight className="w-4 h-4" />
           </button>
        </form>

        <div className="mt-6 text-center text-sm font-medium text-gray-500">
           Already have an account? <Link href="/auth/signin" className="text-black font-bold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}