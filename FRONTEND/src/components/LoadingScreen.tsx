import React from "react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-300">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-primary-400 font-semibold text-lg tracking-wide">
        Loading content...
      </p>
      <p className="text-gray-400 text-sm mt-2">
        Please wait a moment
      </p>
    </div>
  );
};

export default LoadingScreen;
