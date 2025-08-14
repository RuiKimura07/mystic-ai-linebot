'use client';

interface LineButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'line';
  className?: string;
  disabled?: boolean;
}

export default function LineButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false 
}: LineButtonProps) {
  const baseClasses = "w-full py-3 px-4 rounded-lg font-bold text-center transition-colors";
  
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    line: "bg-[#00B900] text-white hover:bg-[#00A000]"
  };

  const classes = `${baseClasses} ${variants[variant]} ${className} ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  }`;

  return (
    <button 
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}