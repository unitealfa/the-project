import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void | Promise<void>; // Add onClick prop
  style?: React.CSSProperties; // Add style prop
  variant?: 'ghost' | 'solid'; // Add variant prop
  size?: 'icon' | 'default'; // Add size prop
}

const Button: React.FC<ButtonProps> = ({ children, className, onClick, style, variant, size }) => {
  const variantClass = variant === 'ghost' ? 'button-ghost' : 'button-solid';
  const sizeClass = size === 'icon' ? 'button-icon' : 'button-default';

  return (
    <button
      className={`${className} ${variantClass} ${sizeClass}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
};

export default Button;
