"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);

    if (videoRef.current) {
      videoRef.current.playbackRate = 1.5;
      videoRef.current.play().catch(() => {
        // Fallback gracefully if browser policy blocks autoplay
      });
    }

    // Begin subtle fade-out at 2.2s
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2200);

    // Complete splash sequence and unmount at 2.5s
    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

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
      aria-label="Loading SatyaSetu"
      role="status"
    >
      <div
        className={`flex flex-col items-center justify-center text-center transition-all duration-300 ease-out transform ${
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* Animated Video Opener / Fallback Logo */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 mb-3 overflow-hidden rounded-2xl flex items-center justify-center">
          {!videoError ? (
            <video
              ref={videoRef}
              src="/satyaseetu_opener.mp4"
              autoPlay
              muted
              playsInline
              preload="auto"
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src="/satyaseetu-logo.png"
              alt="SatyaSetu Logo"
              fill
              sizes="176px"
              priority
              className="object-contain"
            />
          )}
        </div>

        {/* Brand Name */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-[#1e3a5f]">
          SatyaSetu
        </h1>

        {/* Tagline */}
        <p className="mt-1.5 text-xs sm:text-sm font-medium tracking-wide text-slate-500">
          AI-Powered Bid Compliance Verification
        </p>
      </div>
    </div>
  );
}

