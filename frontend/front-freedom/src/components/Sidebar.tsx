import { LogOut, Menu, X } from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleLogout: () => void;
  navItems: { path: string; label: string | JSX.Element; icon: JSX.Element }[]; // Добавляем JSX.Element
  title: string;
  updateCounts?: () => Promise<void>; 
}

export default function Sidebar({
  isOpen,
  setIsOpen,
  handleLogout,
  navItems,
  title,
}: SidebarProps) {
  return (
    <div
      className={`h-screen bg-white shadow-lg transition-all duration-300 flex flex-col p-4 fixed top-0 left-0  ${
        isOpen ? "w-64" : "w-20"
      } md:h-full`}
    >
      <div className="flex items-center justify-between mb-10">
        <button className="ml-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        {isOpen && (
          <h1 className="text-2xl font-bold text-brightBlue">{title}</h1>
        )}
      </div>

      <nav className="space-y-4 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 w-full p-3 rounded-md ${
                isActive ? "bg-blue-100 text-brightBlue" : "hover:bg-gray-100"
              }`
            }
          >
            {item.icon}
            {isOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 w-full p-2 rounded-md text-red-600 hover:bg-red-100"
      >
        <LogOut size={24} />
        {isOpen && <span>Выйти</span>}
      </button>
    </div>
  );
}