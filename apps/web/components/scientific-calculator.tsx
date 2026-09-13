"use client";

import React, { useState } from "react";
import { Calculator, X } from "lucide-react";

interface ScientificCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScientificCalculator: React.FC<ScientificCalculatorProps> = ({
  isOpen,
  onClose,
}) => {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");

  if (!isOpen) return null;

  const appendChar = (char: string) => {
    setExpression((prev) => prev + char);
  };

  const clearAll = () => {
    setExpression("");
    setResult("");
  };

  const backspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const calculate = () => {
    try {
      // Safe math expression evaluator supporting trig, log, sqrt, pow
      let sanitized = expression
        .replace(/π/g, "Math.PI")
        .replace(/e/g, "Math.E")
        .replace(/sin\(/g, "Math.sin(")
        .replace(/cos\(/g, "Math.cos(")
        .replace(/tan\(/g, "Math.tan(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/\^/g, "**");

      // Only allow safe characters
      if (!/^[0-9+\-*/().\s,MathPIEsqrtlncosinta]+$/.test(sanitized)) {
        setResult("Error");
        return;
      }

      // eslint-disable-next-line no-eval
      const evalResult = Function(`"use strict"; return (${sanitized})`)();
      if (typeof evalResult === "number" && !isNaN(evalResult)) {
        setResult(String(Number(evalResult.toFixed(6))));
      } else {
        setResult("Error");
      }
    } catch {
      setResult("Error");
    }
  };

  const buttons = [
    { label: "sin", action: () => appendChar("sin(") },
    { label: "cos", action: () => appendChar("cos(") },
    { label: "tan", action: () => appendChar("tan(") },
    { label: "π", action: () => appendChar("π") },
    { label: "C", action: clearAll, className: "bg-red-100 text-red-700 hover:bg-red-200" },

    { label: "ln", action: () => appendChar("ln(") },
    { label: "log", action: () => appendChar("log(") },
    { label: "√", action: () => appendChar("sqrt(") },
    { label: "^", action: () => appendChar("^") },
    { label: "DEL", action: backspace, className: "bg-amber-100 text-amber-700 hover:bg-amber-200" },

    { label: "(", action: () => appendChar("(") },
    { label: ")", action: () => appendChar(")") },
    { label: "e", action: () => appendChar("e") },
    { label: "/", action: () => appendChar("/") },
    { label: "*", action: () => appendChar("*") },

    { label: "7", action: () => appendChar("7") },
    { label: "8", action: () => appendChar("8") },
    { label: "9", action: () => appendChar("9") },
    { label: "-", action: () => appendChar("-") },
    { label: "+", action: () => appendChar("+") },

    { label: "4", action: () => appendChar("4") },
    { label: "5", action: () => appendChar("5") },
    { label: "6", action: () => appendChar("6") },
    { label: "1", action: () => appendChar("1") },
    { label: "2", action: () => appendChar("2") },

    { label: "3", action: () => appendChar("3") },
    { label: "0", action: () => appendChar("0") },
    { label: ".", action: () => appendChar(".") },
    { label: "=", action: calculate, className: "col-span-2 bg-blue-600 text-white hover:bg-blue-700 font-bold" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-zinc-900/10">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2 text-zinc-900">
            <Calculator className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">অন-স্ক্রিন সায়েন্টিফিক ক্যালকুলেটর</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Display */}
        <div className="my-4 rounded-xl bg-zinc-900 p-3 text-right font-mono text-white">
          <div className="min-h-[24px] text-xs text-zinc-400 overflow-x-auto">
            {expression || "0"}
          </div>
          <div className="text-xl font-bold text-emerald-400 overflow-x-auto">
            {result || "0"}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-5 gap-1.5 text-xs font-semibold">
          {buttons.map((b, idx) => (
            <button
              key={idx}
              onClick={b.action}
              className={`rounded-lg p-2.5 transition active:scale-95 ${
                b.className || "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScientificCalculator;
