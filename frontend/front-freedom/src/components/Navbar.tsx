import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav className="px-16 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-brightBlue text-xl font-bold hover:text-blue-100 transition-colors"
        >
          JobPortal
        </Link>
        <div className="flex items-center gap-4">
          <>
            <Link
              to="/signup"
              className="text-muteGray hover:text-black hover:border-b-2 border-brightBlue "
            >
              Регистрация
            </Link>
            <Link
              to="/login"
              className="text-muteGray hover:text-black hover:border-b-2 border-brightBlue"
            >
              Вход
            </Link>
          </>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
