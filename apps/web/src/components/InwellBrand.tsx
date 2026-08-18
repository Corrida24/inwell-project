import React from 'react';

interface InwellBrandProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const InwellBrand: React.FC<InwellBrandProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <span className={`tracking-tight ${sizes[size]} ${className}`}>
      <span className="font-bold">In</span>
      <span className="font-normal">well</span>
    </span>
  );
};
