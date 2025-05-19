import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import axiosInstance from "../data/axiosInstance";
import { AuthService } from "../services/auth.service";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/api/v1/auth/login", {
        email,
        password,
      });

      const { access_token, refresh_token, token_type } = response.data;

      //decode token
      const decodedToken: any = jwtDecode(access_token);
      const userType = decodedToken.type || "user";

      // Save tokens & user type
      AuthService.setTokens(
        { access_token, refresh_token, token_type },
        userType
      );

      // save user role
      // AuthService.setUserRole(user_type.role);

      // Redirect depending on the role
      if (userType === "admin") {
        navigate("/admin");
      } else if (userType === "hr") navigate("/hr");
      else navigate("/user/home")
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            "Неверный email или пароль. Попробуйте снова."
        );

        setPassword(""); // drop pasword
      } else {
        setError("Произошла ошибка. Попробуйте снова.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-full min-h-screen flex justify-center items-center bg-deepBlue"
    >
      <div className="w-full max-w-[90%] sm:max-w-[600px] bg-white p-6 sm:p-8 rounded-lg ">
        <nav className="text-right mb-4">
          <Link
            to="/"
            className="text-brightBlue text-xl font-bold hover:text-blue-100 transition-colors "
          >
            JobPortal
          </Link>
        </nav>

        <h1 className="text-3xl font-bold mb-6 text-center text-black">Вход</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block mb-1 text-sm font-medium text-black"
            >
              Email:
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-[50%] -translate-y-[50%] text-gray-400"
                size={18}
              />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
                placeholder="example@mail.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-1 text-sm font-medium text-black"
            >
              Пароль:
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-[50%] -translate-y-[50%] text-gray-400"
                size={18}
              />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите пароль"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            {/*           <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
              Запомнить меня
            </label>
          </div> */}

            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Забыли пароль?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? "Вход..." : "Войти"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-black">
          Нет аккаунта?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}