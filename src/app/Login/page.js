"use client"; 

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; 

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false); 
  const [formErrors, setFormErrors] = useState({}); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setFormErrors({});
    setLoading(true);

    const currentFormErrors = {};
    if (!email) {
      currentFormErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      currentFormErrors.email = "Please enter a valid email address.";
    }
    if (!password) {
      currentFormErrors.password = "Password is required.";
    }

    if (Object.keys(currentFormErrors).length > 0) {
      setFormErrors(currentFormErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/Login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "Login successful!");
        setEmail("");
        setPassword("");

        setTimeout(() => {
          router.push("/dashboard"); 
        }, 1500); 
      } else {
        if (data.errors) {
          setFormErrors(data.errors);
        }
        setError(data.message || "Login failed.");
      }
    } catch (err) {
      console.error("Network error or unexpected issue:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6 sm:p-0 font-sans antialiased">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
          Welcome Back!
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Sign in to continue to your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
            )}
          </div>

          {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          {success && (
            <p className="text-green-500 text-center text-sm">{success}</p>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {" "}
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
