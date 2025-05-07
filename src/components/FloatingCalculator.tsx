import { useState } from 'react';
import { Calculator, X } from 'lucide-react';

export default function FloatingCalculator() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [position, setPosition] = useState({ x: 'right-4', y: 'bottom-32' });

  const handleNumberClick = (num: string) => {
    setDisplay((prev) => {
      if (prev === '0') return num;
      if (prev.length > 12) return prev; // Limit input length
      return prev + num;
    });
  };

  const handleOperatorClick = (operator: string) => {
    setEquation(`${display} ${operator}`);
    setDisplay('0');
  };

  const handleEquals = () => {
    try {
      const result = eval(`${equation.split(' ')[0]} ${equation.split(' ')[1]} ${display}`);
      setDisplay(Number(result.toFixed(4)).toString());
      setEquation('');
    } catch (error) {
      setDisplay('Error');
      setTimeout(() => setDisplay('0'), 1000);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleBackspace = () => {
    setDisplay((prev) => {
      if (prev.length === 1) return '0';
      return prev.slice(0, -1);
    });
  };

  return (
    <div className={`fixed ${position.y} ${position.x} z-50`}>
      {isExpanded ? (
        <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-64 transition-all duration-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calculator size={18} />
              <h3 className="font-medium">Calculator</h3>
            </div>
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Display */}
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3">
            {equation && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 h-5">
                {equation}
              </div>
            )}
            <div className="text-2xl font-bold text-right truncate">
              {display}
            </div>
          </div>
          
          {/* Keypad */}
          <div className="grid grid-cols-4 gap-2">
            {/* First row */}
            <button onClick={handleClear} className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40">
              C
            </button>
            <button onClick={handleBackspace} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              ←
            </button>
            <button onClick={() => handleOperatorClick('%')} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              %
            </button>
            <button onClick={() => handleOperatorClick('/')} className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/40">
              ÷
            </button>
            
            {/* Numbers and operators */}
            <button onClick={() => handleNumberClick('7')} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              7
            </button>
            <button onClick={() => handleNumberClick('8')} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              8
            </button>
            <button onClick={() => handleNumberClick('9')} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              9
            </button>
            <button onClick={() => handleOperatorClick('*')} className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/40">
              ×
            </button>
            
            <button onClick={() => handleNumberClick('4')} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              4
            </button>
            <button onClick={() => handleNumberClick('5')} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              5
            </button>
            <button onClick={() => handleNumberClick('6')} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              6
            </button>
            <button onClick={() => handleOperatorClick('-')} className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/40">
              -
            </button>
            
            <button onClick={() => handleNumberClick('1')} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              1
            </button>
            <button onClick={() => handleNumberClick('2')} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              2
            </button>
            <button onClick={() => handleNumberClick('3')} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              3
            </button>
            <button onClick={() => handleOperatorClick('+')} className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800/40">
              +
            </button>
            
            <button onClick={() => handleNumberClick('0')} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 col-span-2">
              0
            </button>
            <button onClick={() => handleNumberClick('.')} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              .
            </button>
            <button onClick={handleEquals} className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              =
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg transition-colors"
          aria-label="Expand Calculator"
        >
          <Calculator size={24} />
          <span className="sr-only">Calculator</span>
        </button>
      )}
    </div>
  );
}