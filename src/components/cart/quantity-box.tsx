'use client';

import { useState, useEffect } from 'react';

interface QuantityBoxProps {
  value: number;
  min: number;
  max: number;
  onChange: (newValue: number) => void;
}

const QuantityBox = ({ value, min = 1, max, onChange }: QuantityBoxProps) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (delta: number) => {
    const newValue = localValue + delta;
    if (newValue >= min && newValue <= max) {
      setLocalValue(newValue);
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center border rounded-md overflow-hidden">
      <button
        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        onClick={() => handleChange(-1)}
        disabled={localValue <= min}
      >
        -
      </button>
      <span className="px-4 py-1 text-center min-w-[40px]">{localValue}</span>
      <button
        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        onClick={() => handleChange(1)}
        disabled={localValue >= max}
      >
        +
      </button>
    </div>
  );
};

export default QuantityBox;