'use client'
import React, { useState } from 'react';
import Form from '@/app/global-components/AuthForm';

interface ConnectButtonProps {
  className?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ 
  className = "",
  children = "Connect",
  size = "md" 
}) => {
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  // Size variants
  const sizeClasses = {
    sm: "px-4 py-1 text-sm",
    md: "px-6 py-1.5 text-base", 
    lg: "px-8 py-2 text-lg"
  };

  return (
    <>
      <button 
        onClick={handleOpenForm}
        className={`border cursor-pointer border-[#9C9C9C] rounded-full text-black font-medium font-roboto bg-[linear-gradient(90deg,_#8B5CF6,_#6366F1,_#3B82F6,_#10B981,_#FACC15,_#F97316,_#EF4444)] hover:opacity-90 transition ${sizeClasses[size]} ${className}`}
      >
        {children}
      </button>

      <Form 
        isOpen={isFormOpen} 
        onClose={handleCloseForm}
        buttonLabel="Submit"
      />
    </>
  );
};

export default ConnectButton;
