// "use client";

// import React, { useState } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useTheme } from "next-themes";

// // Theme iconn   m nns
// function SunIcon({ className = "" }) {
//   return (
//     <svg
//       className={className}
//       fill="none"
//       viewBox="0 0 24 24"
//       stroke="orange"
//       width={24}
//       height={24}
//     >
//       <circle cx="12" cy="12" r="5" stroke="orange" strokeWidth="2" />
//       <path
//         stroke="orange"
//         strokeWidth="2"
//         strokeLinecap="round"
//         d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
//       />
//     </svg>
//   );
// }

// function MoonIcon({ className = "" }) {
//   return (
//     <svg
//       className={className}
//       fill="none"
//       viewBox="0 0 24 24"
//       stroke="currentColor"
//       width={24}
//       height={24}
//     >
//       <path
//         stroke="purple"
//         strokeWidth="2"
//         d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
//       />
//     </svg>
//   );
// }

// export default function LoginPage() {
//   const router = useRouter();
//   const { theme, setTheme } = useTheme();
//   const [role, setRole] = useState("HR");
//   const [name, setName] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     alert(`Logging in as ${role} with name ${name}`);

//     if (role === "HR") {
//       router.push("/dashboard");
//     } else if (role === "admin") {
//       router.push("/admin");
//     } else if (role === "staff") {
//       router.push("/staff");
//     } else if (role === "departmentHead") {
//       router.push("/departmentHead");
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-50 relative">
//       {/* Theme toggle button at top right */}
//       <div className="absolute top-4 right-4 z-10">
//         <button
//           onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
//           className="flex items-center px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//           aria-label="Toggle theme"
//         >
//           {theme === "dark" ? <SunIcon /> : <MoonIcon />}
//         </button>
//       </div>

//       {/* Left Side - Promo (desktop only) */}
//       <div
//         className="hidden md:flex w-1/2 relative text-black flex-col justify-center items-center p-8 bg-cover bg-center"
//         style={{ backgroundImage: "url('/banner.webp')" }}
//       >
//         {/* Blur overlay */}
//         <div
//           className="absolute inset-0 bg-cover bg-center blur-sm"
//           style={{ backgroundImage: "url('/banner.webp')" }}
//         ></div>

//         {/* Content stays sharp */}
//         <div className="relative z-10 flex flex-col items-center">
//           <Image
//             src="/assets/images/logo.jpg"
//             alt="Logo"
//             width={120}
//             height={120}
//             className="rounded-full"
//           />
//           <h1 className="text-3xl font-bold mt-6 text-center">
//             Welcome to SJC Summer Camp HRMS
//           </h1>
//           <p className="mt-4 text-lg max-w-md text-center">
//             Manage attendance, departments, and reports easily with our smart HR
//             management system.
//           </p>
//         </div>
//       </div>

//       {/* Right Side - Login Form */}
//       <div className="flex w-full md:w-1/2 justify-center items-center bg-white dark:bg-gray-900 p-6 md:p-12">
//         <div className="w-full max-w-md">
//           {/* Logo for mobile */}
//           <div className="flex flex-col items-center mb-8 md:hidden">
//             <Image
//               src="/assets/images/logo.png"
//               alt="Logo"
//               width={100}
//               height={100}
//               className="rounded-full"
//             />
//             <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mt-4">
//               SJC Summer Camp HRMS
//             </h1>
//           </div>

//           <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
//             Login
//           </h2>

//           {error && (
//             <div className="mb-4 text-red-600 dark:text-red-400 text-sm text-center">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-gray-700 dark:text-gray-300 mb-1">
//                 Username
//               </label>
//               <input
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
//                 placeholder="Enter your username"
//               />
//             </div>

//             <div>
//               <label className="block text-gray-700 dark:text-gray-300 mb-1">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
//                 placeholder="Enter your password"
//               />
//             </div>

//             <div>
//               <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
//                 Select Role
//               </label>
//               <select
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//                 className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
//               >
//                 <option value="HR">HR</option>
//                 <option value="admin">Admin</option>
//                 <option value="staff">Staff</option>
//                 <option value="departmentHead">Department Head</option>
//               </select>
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors"
//             >
//               Login
//             </button>
//           </form>

//           <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
//             © 2025 SJC Summer Camp HRMS
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////// THE NEW ONE //////////////////////////////////////////////////////////////////////////////////////

// // /loginpage/page.jsx

// "use client";

// import React, { useState } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useTheme } from "next-themes";

// // Theme icons
// function SunIcon({ className = "" }) {
//   return (
//     <svg
//       className={className}
//       fill="none"
//       viewBox="0 0 24 24"
//       stroke="orange"
//       width={24}
//       height={24}
//     >
//       <circle cx="12" cy="12" r="5" stroke="orange" strokeWidth="2" />
//       <path
//         stroke="orange"
//         strokeWidth="2"
//         strokeLinecap="round"
//         d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
//       />
//     </svg>
//   );
// }

// function MoonIcon({ className = "" }) {
//   return (
//     <svg
//       className={className}
//       fill="none"
//       viewBox="0 0 24 24"
//       stroke="currentColor"
//       width={24}
//       height={24}
//     >
//       <path
//         stroke="purple"
//         strokeWidth="2"
//         d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
//       />
//     </svg>
//   );
// }

// export default function LoginPage() {
//   const router = useRouter();
//   const { theme, setTheme } = useTheme();
//   const [role, setRole] = useState("HR");
//   const [name, setName] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     alert(`Logging in as ${role} with name ${name}`);

//     if (role === "HR") {
//       router.push("/dashboard");
//     } else if (role === "admin") {
//       router.push("/admin");
       } else if (role === "intern") {
//       router.push("/intern");
//     } else if (role === "staff") {
//       router.push("/staff");
//     } else if (role === "departmentHead") {
//       router.push("/departmentHead");
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-50 relative">
//       {/* Theme toggle button at top right */}
//       <div className="absolute top-4 right-4 z-10">
//         <button
//           onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
//           className="flex items-center px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//           aria-label="Toggle theme"
//         >
//           {theme === "dark" ? <SunIcon /> : <MoonIcon />}
//         </button>
//       </div>

//       {/* Left Side - Promo (desktop only) */}
//       <div
//         className="hidden md:flex w-1/2 relative text-black flex-col justify-center items-center p-8 bg-cover bg-center"
//         style={{ backgroundImage: "url('/banner.webp')" }}
//       >
//         {/* Blur overlay */}
//         <div
//           className="absolute inset-0 bg-cover bg-center blur-sm"
//           style={{ backgroundImage: "url('/banner.webp')" }}
//         ></div>

//         {/* Content stays sharp */}
//         <div className="relative z-10 flex flex-col items-center">
//           <Image
//             src="/assets/images/logo.jpg"
//             alt="Logo"
//             width={120}
//             height={120}
//             className="rounded-full"
//           />
//           <h1 className="text-3xl font-bold mt-6 text-center">
//             Welcome to SJC Summer Camp HRMS
//           </h1>
//           <p className="mt-4 text-lg max-w-md text-center">
//             Manage attendance, departments, and reports easily with our smart HR
//             management system.
//           </p>
//         </div>
//       </div>

//       {/* Right Side - Login Form */}
//       <div className="flex w-full md:w-1/2 justify-center items-center bg-white dark:bg-gray-900 p-6 md:p-12">
//         <div className="w-full max-w-md">
//           {/* Logo for mobile */}
//           <div className="flex flex-col items-center mb-8 md:hidden">
//             <Image
//               src="/assets/images/logo.png"
//               alt="Logo"
//               width={100}
//               height={100}
//               className="rounded-full"
//             />
//             <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mt-4">
//               SJC Summer Camp HRMS
//             </h1>
//           </div>

//           <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
//             Login
//           </h2>

//           {error && (
//             <div className="mb-4 text-red-600 dark:text-red-400 text-sm text-center">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-gray-700 dark:text-gray-300 mb-1">
//                 Username
//               </label>
//               <input
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
//                 placeholder="Enter your username"
//               />
//             </div>

//             <div>
//               <label className="block text-gray-700 dark:text-gray-300 mb-1">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
//                 placeholder="Enter your password"
//               />
//             </div>

//             <div>
//               <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
//                 Select Role
//               </label>
//               <select
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//                 className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
//               >
//                 <option value="HR">HR</option>
//                 <option value="admin">Admin</option>
                   <option value="intern">intern</option>
//                 <option value="staff">Staff</option>
//                 <option value="departmentHead">Department Head</option>
//               </select>
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors"
//             >
//               Login
//             </button>
//           </form>

//           <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
//             © 2025 SJC Summer Camp HRMS
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }


// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////// THE NEW ONE //////////////////////////////////////////////////////////////////////////////////////

// /loginpage/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { login } from "../../../lib/api"; // Adjust path if needed
import toast from "react-hot-toast";
import { Sun, Moon } from "lucide-react"; // Using a consistent icon library

// ==============================================================================
// MAIN LOGIN PAGE COMPONENT
// ==============================================================================
import { login } from "../../../lib/api"; // Adjust path if needed
import toast from "react-hot-toast";
import { Sun, Moon } from "lucide-react"; // Using a consistent icon library

// ==============================================================================
// MAIN LOGIN PAGE COMPONENT
// ==============================================================================
export default function LoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // State for the form inputs
  const [username, setUsername] = useState("");
  const [mounted, setMounted] = useState(false);

  // State for the form inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 1. Call the login API with the username and password
      const data = await login({ username, password });

      // 2. If successful, store the authentication token in localStorage
      // This makes it available for all subsequent API calls
      localStorage.setItem('authToken', data.token);

      toast.success(`Welcome back, ${data.user.username}! Redirecting...`);
      
      // 3. Perform automatic, role-based redirection
      // It checks the first role in the user's roles array.
      const userRole = data.user.roles[0];

      if (userRole === "HR") {
        router.push("/dashboard");
      } else if (userRole === "Department Head") {
        router.push("/departmentHead");
      } else if (userRole === "Staff") {
        router.push("/staff"); // Assuming you will create a /staff route
      } else if (userRole === "Super Admin") {
          router.push("/admin"); // Assuming you will create an /admin route
      } else {
        // Fallback for any other roles that don't have a dedicated dashboard
        toast.error("Your role does not have a dashboard assigned.");
        localStorage.removeItem('authToken'); // Clear the token if there's no valid role
      }

    } catch (error) {
      // The API function throws an error with the backend's message
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    // Render a blank page or a simple loader to avoid hydration mismatch
    return <div className="min-h-screen bg-gray-50 dark:bg-slate-900"></div>;
  }
    setIsLoading(true);
    
    try {
      // 1. Call the login API with the username and password
      const data = await login({ username, password });

      // 2. If successful, store the authentication token in localStorage
      // This makes it available for all subsequent API calls
      localStorage.setItem('authToken', data.token);

      toast.success(`Welcome back, ${data.user.username}! Redirecting...`);
      
      // 3. Perform automatic, role-based redirection
      // It checks the first role in the user's roles array.
      const userRole = data.user.roles[0];

      if (userRole === "HR") {
        router.push("/dashboard");
      } else if (userRole === "Department Head") {
        router.push("/departmentHead");
      } else if (userRole === "Staff") {
        router.push("/staff"); // Assuming you will create a /staff route
      } else if (userRole === "Super Admin") {
          router.push("/admin"); // Assuming you will create an /admin route
      } else {
        // Fallback for any other roles that don't have a dedicated dashboard
        toast.error("Your role does not have a dashboard assigned.");
        localStorage.removeItem('authToken'); // Clear the token if there's no valid role
      }

    } catch (error) {
      // The API function throws an error with the backend's message
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    // Render a blank page or a simple loader to avoid hydration mismatch
    return <div className="min-h-screen bg-gray-50 dark:bg-slate-900"></div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 relative">
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 relative">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-gray-800" />}
          {theme === "dark" ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-gray-800" />}
        </button>
      </div>

      {/* Left Side - Promotional Banner */}
{/* Left Side - Promo (desktop only) */}
      {/* Left Side - Promotional Banner */}
{/* Left Side - Promo (desktop only) */}
      <div
        className="hidden md:flex w-1/2 relative text-black flex-col justify-center items-center p-8 bg-cover bg-center"
        style={{ backgroundImage: "url('/banner.webp')" }}
      >
        {/* Blur overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm"
          style={{ backgroundImage: "url('/banner.webp')" }}
        ></div>

        {/* Content stays sharp */}
        <div className="relative z-10 flex flex-col items-center">
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
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-white dark:bg-gray-900 p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8 md:hidden">
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="rounded-full"
            />
            <h1 className="text-2xl font-bold text-green-700 dark:text-green-400 mt-4">
              SJC Summer Camp HRMS
            </h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
            Sign In
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Username</label>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter your username"
                required
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter your password"
                required
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
              disabled={isLoading}
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing In..." : "Sign In"}
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            © 2025 SJC Summer Camp HRMS
          </p>
        </div>
      </div>
    </div>
  );
}
