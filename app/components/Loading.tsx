import React, { useState, useEffect } from 'react';

const MulticolorSpinner = ({ 
  size = 80, 
  thickness = 6, 
  speed = 1 
}) => {
  const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'];
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
    }, 1000); // Change color every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div
        className="spinner"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: `${thickness}px solid ${colors[currentColorIndex]}30`,
          borderTop: `${thickness}px solid ${colors[currentColorIndex]}`,
          borderRadius: '50%',
          animation: `spin ${speed}s linear infinite`,
        }}
        aria-label="Loading"
      />

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MulticolorSpinner;