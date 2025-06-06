import { Calculator, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const SCIENTIFIC_BUTTONS = [
  ["sin", "cos", "tan", "π"],
  ["ln", "log", "√", "e"],
  ["(", ")", "^", "%"],
  ["7", "8", "9", "/"],
  ["4", "5", "6", "*"],
  ["1", "2", "3", "-"],
  ["0", ".", "=", "+"],
];

const SCIENTIFIC_CONSTS = {
  π: Math.PI,
  e: Math.E,
};

function evalScientific(expr: string): string {
  try {
    const replaced = expr
      .replace(/π/g, `${Math.PI}`)
      .replace(/e/g, `${Math.E}`)
      .replace(/√([\d.]+)/g, (_, n) => `Math.sqrt(${n})`)
      .replace(/(\d+)\^([\d.]+)/g, (_, a, b) => `Math.pow(${a},${b})`)
      .replace(/sin\(([^)]+)\)/g, (_, n) => `Math.sin(${n})`)
      .replace(/cos\(([^)]+)\)/g, (_, n) => `Math.cos(${n})`)
      .replace(/tan\(([^)]+)\)/g, (_, n) => `Math.tan(${n})`)
      .replace(/log\(([^)]+)\)/g, (_, n) => `Math.log10(${n})`)
      .replace(/ln\(([^)]+)\)/g, (_, n) => `Math.log(${n})`)
      .replace(/%/g, "/100");
    // eslint-disable-next-line no-eval
    const result = eval(replaced);
    if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
      return result.toString();
    }
    return "Error";
  } catch {
    return "Error";
  }
}

export function FloatingCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");

  const handleMouseDown = (e: React.MouseEvent) => {
    if (calculatorRef.current) {
      const rect = calculatorRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && calculatorRef.current) {
      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;
      setPosition({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleButton = (btn: string) => {
    if (btn === "=") {
      const result = evalScientific(equation + display);
      setDisplay(result);
      setEquation("");
      return;
    }
    if (btn === "C") {
      setDisplay("0");
      setEquation("");
      return;
    }
    if (["sin", "cos", "tan", "log", "ln", "√"].includes(btn)) {
      setEquation(equation + btn + "(");
      setDisplay("");
      return;
    }
    if (btn === "^") {
      setEquation(equation + display + "^");
      setDisplay("");
      return;
    }
    if (btn === "%") {
      setEquation(equation + display + "%");
      setDisplay("");
      return;
    }
    if (["π", "e"].includes(btn)) {
      setDisplay((display === "0" ? "" : display) + btn);
      return;
    }
    if (btn === "(") {
      setEquation(equation + "(");
      return;
    }
    if (btn === ")") {
      setEquation(equation + display + ")");
      setDisplay("");
      return;
    }
    if (["+", "-", "*", "/"].includes(btn)) {
      setEquation(equation + display + btn);
      setDisplay("");
      return;
    }
    // Números e ponto
    setDisplay(display === "0" ? btn : display + btn);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg transition-colors"
        aria-label="Expand Calculator"
      >
        <Calculator className="w-6 h-6" />
        <span className="sr-only">Calculator</span>
      </button>
    );
  }

  return (
    <div
      ref={calculatorRef}
      className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-80 z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      <div
        className="flex items-center justify-between mb-4 cursor-grab"
        onMouseDown={handleMouseDown}
      >
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Calculadora Científica
        </h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <div className="text-right text-sm text-gray-500 dark:text-gray-400 h-4">
          {equation}
        </div>
        <div className="text-right text-2xl font-semibold text-gray-800 dark:text-gray-100 break-all">
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-2">
        <button
          onClick={() => handleButton("C")}
          type="button"
          className="col-span-4 p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors mb-2"
        >
          Limpar
        </button>
        {SCIENTIFIC_BUTTONS.flat().map((btn) => (
          <button
            key={btn}
            type="button"
            onClick={() => handleButton(btn)}
            className={`p-2 rounded-lg text-lg font-medium transition-colors
              ${
                btn === "="
                  ? "bg-teal-600 hover:bg-teal-700 text-white"
                  : [
                      "sin",
                      "cos",
                      "tan",
                      "log",
                      "ln",
                      "√",
                      "π",
                      "e",
                      "^",
                      "%",
                      "(",
                      ")",
                    ].includes(btn)
                  ? "bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/40 text-indigo-700 dark:text-indigo-200"
                  : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
              }`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}
