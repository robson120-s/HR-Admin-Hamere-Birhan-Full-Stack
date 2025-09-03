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
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center text-center px-4"
      style={{ backgroundImage: "url('/banner.webp')" }}
    >
      {/* Optional: overlay for readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <Image
          src="/assets/images/logo.png"
          alt="Logo"
          width={300}
          height={300}
          className="rounded-full mb-6 transform transition duration-300 hover:scale-110"
        />

        <h2 className="text-2xl font-semibold mb-6 text-white">
          እንኳን ወደ ቅዱስ ዮሐንስ አፈወርቅ ልዩ የዘመነ ክረምት የሕጻናት ት/ት መርሐግብር በደኅና መጡ
        </h2>

        <button
          onClick={handleClick}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 hover:scale-105 transform transition duration-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}
