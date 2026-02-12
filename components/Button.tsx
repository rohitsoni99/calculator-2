
import React from 'react';

interface ButtonProps {
  label: string | React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'operator' | 'action' | 'scientific' | 'ghost';
  className?: string;
  span?: number;
}

const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'default', 
  className = '',
  span = 1 
}) => {
  const baseStyles = "h-14 md:h-16 rounded-2xl flex items-center justify-center text-lg font-medium transition-all duration-200 active:scale-95 select-none";
  
  const variants = {
    default: "bg-white text-slate-700 hover:bg-slate-50 shadow-sm",
    operator: "bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-200",
    action: "bg-slate-200 text-slate-800 hover:bg-slate-300",
    scientific: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm md:text-base",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100"
  };

  const colSpan = span > 1 ? `col-span-${span}` : '';

  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${colSpan} ${className}`}
    >
      {label}
    </button>
  );
};

export default Button;
