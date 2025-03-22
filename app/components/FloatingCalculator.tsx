import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calculator } from 'lucide-react';

const FloatingCalculator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth < 640 ? (window.innerWidth - 240) / 2 : 100,
    y: window.innerHeight < 640 ? (window.innerHeight - 320) / 2 : 100
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentValue, setCurrentValue] = useState('0');
  const [equation, setEquation] = useState('');
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  
  const calculatorRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Function to update position based on screen size
  const updatePositionForScreenSize = useCallback(() => {
    const isSmallScreen = window.innerWidth < 640;
    if (isSmallScreen) {
      const newX = (window.innerWidth - 240) / 2; // Center for 240px width
      const newY = (window.innerHeight - 320) / 2; // Center for 320px height
      setPosition({ x: newX, y: newY });
    } else if (!isDragging) {
      // Only reset to default position if not dragging and was previously centered
      if (position.x === (window.innerWidth - 240) / 2) {
        setPosition({ x: 100, y: 100 });
      }
    }
  }, [isDragging, position.x]);

  // Handle resize events
  useEffect(() => {
    window.addEventListener('resize', updatePositionForScreenSize);
    return () => window.removeEventListener('resize', updatePositionForScreenSize);
  }, [updatePositionForScreenSize]);

  const toggleCalculator = () => setIsOpen(!isOpen);
  
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const updatePosition = () => {
      if (!calculatorRef.current) return;
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      const calcWidth = calculatorRef.current.offsetWidth;
      const calcHeight = calculatorRef.current.offsetHeight;
      const boundedX = Math.max(0, Math.min(newX, window.innerWidth - calcWidth));
      const boundedY = Math.max(0, Math.min(newY, window.innerHeight - calcHeight));
      setPosition({ x: boundedX, y: boundedY });
    };
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(updatePosition);
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    // Recenter on small screens after dragging ends
    if (window.innerWidth < 640) {
      updatePositionForScreenSize();
    }
  }, [updatePositionForScreenSize]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Calculator functions (unchanged)
  const clearAll = () => {
    setCurrentValue('0');
    setEquation('');
    setWaitingForOperand(false);
  };

  const inputDigit = (digit: number) => {
    if (waitingForOperand) {
      setCurrentValue(String(digit));
      setWaitingForOperand(false);
    } else {
      setCurrentValue(currentValue === '0' ? String(digit) : currentValue + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setCurrentValue('0.');
      setWaitingForOperand(false);
    } else if (currentValue.indexOf('.') === -1) {
      setCurrentValue(currentValue + '.');
    }
  };

  const performOperation = (nextOperator: string) => {
    if (equation === '') {
      setEquation(`${currentValue} ${nextOperator} `);
    } else if (waitingForOperand) {
      setEquation(equation.slice(0, -2) + `${nextOperator} `);
    } else {
      setEquation(`${equation}${currentValue} ${nextOperator} `);
    }
    setCurrentValue('0');
    setWaitingForOperand(true);
  };

  const handleEquals = () => {
    if (equation === '') return;
    const fullEquation = `${equation}${currentValue}`;
    try {
      let expressionToEvaluate = fullEquation
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**');
      const result = eval(expressionToEvaluate);
      setCurrentValue(String(result));
      setEquation(`${fullEquation} = `);
      setWaitingForOperand(true);
    } catch (error) {
      setCurrentValue('Error');
      setWaitingForOperand(true);
    }
  };

  const handleScientificFunction = (func: string) => {
    const value = parseFloat(currentValue);
    let result;
    try {
      switch (func) {
        case 'sin':
          result = Math.sin(value * Math.PI / 180);
          break;
        case 'cos':
          result = Math.cos(value * Math.PI / 180);
          break;
        case 'tan':
          result = Math.tan(value * Math.PI / 180);
          break;
        case 'sqrt':
          result = Math.sqrt(value);
          break;
        case 'log':
          result = Math.log10(value);
          break;
        default:
          return;
      }
      setCurrentValue(String(result));
      setEquation(`${func}(${currentValue}) = `);
      setWaitingForOperand(true);
    } catch (error) {
      setCurrentValue('Error');
      setWaitingForOperand(true);
    }
  };

  const handlePower = () => performOperation('^');
  const handlePercentage = () => setCurrentValue(String(parseFloat(currentValue) / 100));
  const toggleSign = () => setCurrentValue(String(-parseFloat(currentValue)));

  return (
    <>
      <button
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 1001
        }}
        onClick={toggleCalculator}
        className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-800 text-white p-2 mt-14 md:mt-40 lg:mt-40 rounded-full shadow-md flex items-center justify-center"
      >
        <Calculator size={30} />
      </button>
      
      {isOpen && (
        <div
          ref={calculatorRef}
          className="absolute bg-blue-100 rounded-lg shadow-xl w-60 sm:w-60 md:w-96 h-[320px] sm:h-[320px] md:h-[480px] cursor-move border border-blue-200 overflow-hidden sm:overflow-auto md:overflow-hidden"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 1000,
            userSelect: 'none',
            transition: isDragging ? 'none' : 'all 0.1s ease-out'
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="p-2 sm:p-2 md:p-4 min-h-full">
            <div className="bg-white p-2 sm:p-2 md:p-4 rounded mb-2 sm:mb-2 md:mb-4 border border-blue-200 cursor-default">
              <div className="text-right text-gray-500 text-xs sm:text-xs md:text-base h-6 sm:h-6 md:h-8 overflow-hidden">
                {equation}
              </div>
              <div className="text-right text-blue-800 text-xl sm:text-xl md:text-3xl font-medium overflow-hidden">
                {currentValue}
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-1 sm:gap-1 md:gap-2">
              <button onClick={() => handleScientificFunction('sin')} className="bg-blue-200 hover:bg-blue-300 text-blue-800 p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-sm cursor-pointer">sin</button>
              <button onClick={() => handleScientificFunction('cos')} className="bg-blue-200 hover:bg-blue-300 text-blue-800 p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-sm cursor-pointer">cos</button>
              <button onClick={() => handleScientificFunction('tan')} className="bg-blue-200 hover:bg-blue-300 text-blue-800 p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-sm cursor-pointer">tan</button>
              <button onClick={() => handleScientificFunction('sqrt')} className="bg-blue-200 hover:bg-blue-300 text-blue-800 p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-sm cursor-pointer">√</button>
              <button onClick={() => handleScientificFunction('log')} className="bg-blue-200 hover:bg-blue-300 text-blue-800 p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-sm cursor-pointer">log</button>

              <button onClick={clearAll} className="bg-blue-200 hover:bg-blue-300 text-blue-800 p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-base font-medium cursor-pointer">AC</button>
              <button onClick={toggleSign} className="bg-blue-200 hover:bg-blue-300 text-blue-800 p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-base font-medium cursor-pointer">+/-</button>
              <button onClick={handlePercentage} className="bg-blue-200 hover:bg-blue-300 text-blue-800 p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-base font-medium cursor-pointer">%</button>
              <button onClick={() => performOperation('÷')} className="bg-blue-500 hover:bg-blue-600 text-white p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-base font-medium cursor-pointer">÷</button>
              <button onClick={() => performOperation('^')} className="bg-blue-500 hover:bg-blue-600 text-white p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-base font-medium cursor-pointer">x^y</button>

              <button onClick={() => inputDigit(7)} className="bg-white hover:bg-blue-50 text-blue-800 p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-base border border-blue-200 cursor-pointer">7</button>
              <button onClick={() => inputDigit(8)} className="bg-white hover:bg-blue-50 text-blue-800 p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-base border border-blue-200 cursor-pointer">8</button>
              <button onClick={() => inputDigit(9)} className="bg-white hover:bg-blue-50 text-blue-800 p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-base border border-blue-200 cursor-pointer">9</button>
              <button onClick={() => performOperation('×')} className="bg-blue-500 hover:bg-blue-600 text-white p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-base font-medium cursor-pointer">×</button>
              <button onClick={() => performOperation('-')} className="bg-blue-500 hover:bg-blue-600 text-white p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-base font-medium cursor-pointer">-</button>

              <button onClick={() => inputDigit(4)} className="bg-white hover:bg-blue-50 text-blue-800 p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-base border border-blue-200 cursor-pointer">4</button>
              <button onClick={() => inputDigit(5)} className="bg-white hover:bg-blue-50 text-blue-800 p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-base border border-blue-200 cursor-pointer">5</button>
              <button onClick={() => inputDigit(6)} className="bg-white hover:bg-blue-50 text-blue-800 p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-base border border-blue-200 cursor-pointer">6</button>
              <button onClick={() => performOperation('+')} className="bg-blue-500 hover:bg-blue-600 text-white p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-base font-medium cursor-pointer">+</button>
              <button onClick={handleEquals} className="bg-blue-500 hover:bg-blue-600 text-white p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-base font-medium cursor-pointer">=</button>

              <button onClick={() => inputDigit(1)} className="bg-white hover:bg-blue-50 text-blue-800 p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-base border border-blue-200 cursor-pointer">1</button>
              <button onClick={() => inputDigit(2)} className="bg-white hover:bg-blue-50 text-blue-800 p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-base border border-blue-200 cursor-pointer">2</button>
              <button onClick={() => inputDigit(3)} className="bg-white hover:bg-blue-50 text-blue-800 p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-base border border-blue-200 cursor-pointer">3</button>
              <button onClick={() => inputDigit(0)} className="bg-white hover:bg-blue-50 text-blue-800 p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-base border border-blue-200 cursor-pointer">0</button>
              <button onClick={inputDecimal} className="bg-white hover:bg-blue-50 text-blue-800 p-1 sm:p-1 md:p-2 rounded text-xs sm:text-xs md:text-base border border-blue-200 cursor-pointer">.</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingCalculator;