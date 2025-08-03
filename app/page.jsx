<<<<<<< HEAD
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push("/login");
  }, [router]);
   return null;
}
=======
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function WelcomeSection() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/loginpage');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-4">
      <Image
        src="/logo.png"
        alt="Logo"
        width={200}
        height={200}
        className="rounded-full mb-6 transform transition duration-300 hover:scale-110"
      />

      <h2 className="text-xl font-semibold mb-6">
        እንኳን ወደ ቅዱስ ዮሐንስ አፈወርቅ ልዩ የዘመነ ክረምት የሕጻናት ት/ት መርሐግብር በደኅና መጡ
      </h2>

      <button
        onClick={handleClick}
        className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 hover:scale-105 transform transition duration-300"
      >
        Next
      </button>
    </div>
  );
}
>>>>>>> f56ba71d0f9bfb56a6ab31379b42b3a5ae495595
