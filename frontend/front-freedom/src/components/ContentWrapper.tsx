import React from "react";

interface ContentWrapperProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function ContentWrapper({
  isOpen,
  children,
  className = "",
}: ContentWrapperProps) {
  return (
    <div
      className={`transition-all duration-300 ${
        isOpen ? "ml-64" : "ml-20"
      } ${className}`}
    >
      {children}
    </div>
  );
}
