import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500 focus:ring-offset-dark-300',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500 focus:ring-offset-dark-300',
    outline: 'bg-transparent border border-gray-600 hover:bg-gray-700/20 text-gray-200 focus:ring-gray-500 focus:ring-offset-dark-300',
    ghost: 'bg-transparent hover:bg-gray-700/20 text-gray-200 focus:ring-gray-500 focus:ring-offset-dark-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 focus:ring-offset-dark-300',
  };
  
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;