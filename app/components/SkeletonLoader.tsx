import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  isDarkMode?: boolean;
}

const Skeleton = ({ className, isDarkMode = false }: SkeletonProps) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md",
        isDarkMode ? "bg-gray-700" : "bg-gray-200",
        className
      )}
    />
  );
};

const SkeletonLoader = ({ isDarkMode = false }: { isDarkMode?: boolean }) => {
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-[#191919] dark' : 'bg-gray-100'}`}>
      <div className="w-full max-w-6xl mx-auto">
        {/* Header Skeleton */}
        <div className={`${isDarkMode ? 'bg-[#191919]/80' : 'bg-gray-100/80'} rounded-lg p-6`}>
          <div className="mb-8">
            {/* Subject tabs */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-4 w-2/3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton 
                    key={i} 
                    className="h-8 w-24" 
                    isDarkMode={isDarkMode} 
                  />
                ))}
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-16" isDarkMode={isDarkMode} />
                <Skeleton className="h-10 w-24 rounded-lg" isDarkMode={isDarkMode} />
              </div>
            </div>
            <Skeleton className="h-0.5 w-full mb-8" isDarkMode={isDarkMode} />
          </div>

          {/* Question card */}
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-[#333333]' : 'bg-gray-100/80'} shadow-sm mb-8`}>
            {/* Instructions */}
            <Skeleton className="h-12 w-full mb-6 rounded-lg" isDarkMode={isDarkMode} />
            
            {/* Question number + text */}
            <div className="flex items-start mb-6">
              <Skeleton className="h-12 w-12 rounded-full flex-shrink-0 mr-4" isDarkMode={isDarkMode} />
              <div className="flex-1">
                <Skeleton className="h-6 w-full mb-2" isDarkMode={isDarkMode} />
                <Skeleton className="h-6 w-3/4" isDarkMode={isDarkMode} />
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton 
                  key={i} 
                  className="h-12 w-full rounded-lg" 
                  isDarkMode={isDarkMode} 
                />
              ))}
            </div>
          </div>

          {/* Bottom nav */}
          <div className="flex justify-between items-center mt-8">
            <div className="flex space-x-2 w-2/3 overflow-hidden">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton 
                  key={i} 
                  className="h-8 w-8 rounded-full flex-shrink-0" 
                  isDarkMode={isDarkMode} 
                />
              ))}
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-20 rounded-lg" isDarkMode={isDarkMode} />
              <Skeleton className="h-10 w-20 rounded-lg" isDarkMode={isDarkMode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
