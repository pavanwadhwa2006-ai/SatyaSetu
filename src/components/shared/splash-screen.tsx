"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Start entrance animation immediately upon mounting
    setMounted(true);

    // Begin subtle fade-out at 1.7s
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1700);

    // Complete splash sequence and unmount at 2.0s
    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!showSplash) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-300 ease-in-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-label="Loading Satyaseetu"
      role="status"
    >
      <div
        className={`flex flex-col items-center justify-center text-center transition-all duration-300 ease-out transform ${
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* Logo - Centered, pure white background, no drop shadow, no border */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-4">
          <Image
            src="/satyaseetu-logo.png"
            alt="Satyaseetu Logo"
            fill
            sizes="128px"
            priority
            className="object-contain"
          />
        </div>

        {/* Brand Name */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-[#1e3a5f]">
          SatyaSetu
        </h1>

        {/* Tagline */}
        <p className="mt-2 text-xs sm:text-sm font-medium tracking-wide text-slate-500">
          AI-Powered Bid Compliance Verification
        </p>
      </div>
    </div>
  );
}
