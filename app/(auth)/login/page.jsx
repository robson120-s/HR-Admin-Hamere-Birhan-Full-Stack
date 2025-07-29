"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }

    // Mock login logic
    if (username.toLowerCase().includes("hr")) {
      router.push("/HR"); // HR dashboard
    } else {
      router.push("/staff"); // Staff dashboard
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Side - Promo (desktop only) */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-b from-green-600 to-red-500 text-white flex-col justify-center items-center p-8">
        <Image
          src="/assets/images/logo.jpg"
          alt="Logo"
          width={120}
          height={120}
          className="rounded-full"
        />
        <h1 className="text-3xl font-bold mt-6 text-center">
          Welcome to SJC Summer Camp HRMS
        </h1>
        <p className="mt-4 text-lg max-w-md text-center">
          Manage attendance, departments, and reports easily with our smart HR
          management system.
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-white p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="flex flex-col items-center mb-8 md:hidden">
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="rounded-full"
            />
            <h1 className="text-2xl font-bold text-green-700 mt-4">
              SJC Summer Camp HRMS
            </h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Login
          </h2>

          {error && (
            <div className="mb-4 text-red-600 text-sm text-center">{error}</div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Login
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            © 2025 SJC Summer Camp HRMS
          </p>
        </div>
      </div>
    </div>
  );
}
