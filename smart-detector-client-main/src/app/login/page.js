"use client";

import { useState } from "react";
import { useLoginMutation } from "@/store/api/authApi";
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "@/store/features/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    dispatch(loginStart());

    try {
      const result = await login({ email, password }).unwrap();
      
      if (!result.success) {
        throw new Error(result.message || "Login failed");
      }
      
      // Send the complete response to loginSuccess which will extract data
      dispatch(loginSuccess(result));
      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.data?.message || err.message || "Login failed. Please check your credentials.";
      dispatch(loginFailure(errorMessage));
      setError(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-2 sm:p-4 bg-background">
      <div className="w-full max-w-md rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black p-4 sm:p-6 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold text-center">Login</h1>
        
        {error && (
          <div className="mb-3 rounded bg-red-100 dark:bg-red-900/30 p-2 text-red-800 dark:text-red-200 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-black/30 dark:border-white/20 px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block mb-1 text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-black/30 dark:border-white/20 px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-foreground text-background py-2 font-medium transition-colors hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        <div className="mt-5 text-center text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
