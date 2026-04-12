import React from 'react';

export const PillBadge = ({ children, className = '' }) => (
  <span className={`pill-badge px-2.5 py-0.5 rounded-full text-[11px] ${className}`}>
    {children}
  </span>
);

export const TagBadge = ({ icon: Icon, children, variant = 'blue' }) => {
  const variants = {
    blue: 'text-blue-600 bg-blue-50',
    gray: 'text-gray-500 bg-gray-100'
  };

  return (
    <div className={`flex items-center gap-1 text-[11px] font-bold ${variants[variant]} px-2.5 py-1 rounded-lg`}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </div>
  );
};