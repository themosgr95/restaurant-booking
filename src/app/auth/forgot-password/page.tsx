"use client";

import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Back Button */}
        <Link href="/auth/signin" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        {submitted ? (
          <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
             <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <CheckCircle className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-black text-gray-900 mb-2">Check your inbox</h2>
             <p className="text-gray-500 text-sm">We've sent a password reset link to <br/><strong>{email}</strong></p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
               <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-bold mx-auto mb-4">
                 <Mail className="w-6 h-6" />
               </div>
               <h1 className="text-2xl font-black text-gray-900">Forgot Password?</h1>
               <p className="text-gray-500 text-sm mt-1">No worries! Enter your email and we'll send you reset instructions.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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

               <button 
                 type="submit" 
                 disabled={loading}
                 className="w-full bg-black text-white p-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
               >
                 {loading ? "Sending Link..." : "Send Reset Link"}
               </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}