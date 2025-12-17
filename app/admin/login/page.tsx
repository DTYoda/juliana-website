"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        window.location.href = "/admin";
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data.error || "Invalid password");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-100 via-rose-50 to-cyan-50 flex items-center justify-center px-6 py-16">
      <div className="card-hover w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-cyan-100/50 p-8">
        <h1 className="text-3xl font-serif text-cyan-500 mb-6 text-center">
          Admin Access
        </h1>
        <p className="text-gray-600 text-sm mb-6 text-center">
          Enter the secret password to access the admin panel.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white/90"
              placeholder="Enter admin password"
              required
            />
          </div>
          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 text-white px-4 py-3 rounded-lg hover:bg-cyan-600 transition-colors font-medium disabled:opacity-60"
          >
            {loading ? "Checking..." : "Enter Admin Panel"}
          </button>
        </form>
        <div className="mt-6 text-xs text-gray-500 text-center">
          Only users with the secret password can proceed.
        </div>
      </div>
    </div>
  );
}

