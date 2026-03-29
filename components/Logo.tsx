
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <div className={`relative flex items-center justify-center animate-float ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {/* Abstract Vote Shield */}
      <path 
        d="M50 5 L85 20 L85 55 C85 75 70 90 50 95 C30 90 15 75 15 55 L15 20 L50 5Z" 
        fill="url(#logoGrad)"
        stroke="white"
        strokeWidth="2"
      />
      {/* Stylized 'B' with India silhouette touch */}
      <path 
        d="M38 30 L55 30 C62 30 62 40 55 40 L38 40 L38 55 L58 55 C66 55 66 65 58 65 L38 65 L38 30Z" 
        fill="none" 
        stroke="white" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Modern Checkmark Point */}
      <circle cx="75" cy="25" r="10" fill="#10B981" />
      <path d="M70 25 L73 28 L80 21" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  </div>
);
