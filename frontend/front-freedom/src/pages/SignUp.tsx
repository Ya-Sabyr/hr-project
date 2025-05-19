import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Building2, User, Phone } from "lucide-react";
import axiosInstance from "../data/axiosInstance";
import { AuthService } from "../services/auth.service";
import { jwtDecode } from "jwt-decode";

export default function SignUp() {
  const [role, setRole] = useState("hr");

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact_info, setcontact_info] = useState("");
  const [company, setCompany] = useState("");
  const [full_name, setfull_name] = useState("");

  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setNameError("");
    setEmailError("");
    setPasswordError("");

    let isValid = true;

    if (!/^[A-Za-zА-Яа-яЁё\s]+$/.test(full_name)) {
      setNameError("Имя должно содержать только буквы");
      isValid = false;
    }

    if (!email.includes("@")) {
      setEmailError("Некорректный email");
      isValid = false;
    }

    if (password.length < 6) {
      setPasswordError("Пароль должен содержать минимум 6 символов");
      isValid = false;
    }

    if (!isValid) {
      setIsLoading(false);
      return;
    }

    try {
      const endpoint =
        role === "hr"
          ? "/api/v1/auth/register/hr"
          : "/api/v1/auth/register/user";

      const data =
        role === "hr"
          ? { email, password, full_name, contact_info, company }
          : { email, password, full_name };

      const response = await axiosInstance.post(endpoint, data);

      if (role === "user") {
        // User получает токены и входит в систему
        const { access_token, refresh_token, token_type } = response.data || {};

        if (!access_token || !refresh_token) {
          setError("Ошибка регистрации. Попробуйте позже.");
          return;
        }

        const decodedToken: any = jwtDecode(access_token);
        const userType = decodedToken.type || "user";

        AuthService.setTokens(
          { access_token, refresh_token, token_type },
          userType
        );

        // Save tokens
        //AuthService.setTokens({ access_token, refresh_token, token_type }, "user");

        // Redirect to home page
        navigate("/user/home");
      } else {
        // hr waiting approved
        setError("");
        alert(
          "Заявка на регистрацию отправлена. Ожидайте одобрения администратора."
        );
        navigate("/login"); // Redirect to login
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Произошла ошибка при регистрации. Пожалуйста, попробуйте снова."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-deepBlue">

      <div className="w-full max-w-[90%] sm:max-w-[600px] bg-white p-6 sm:p-8 rounded-lg ">
        <nav className="text-right mb-4">
          <Link
            to="/"
            className="text-brightBlue text-xl font-bold hover:text-blue-100 transition-colors "
          >
            JobPortal
          </Link>
        </nav>

        <h1 className="text-3xl font-bold mb-6 text-center text-black">
          Регистрация
        </h1>

        <form
          onSubmit={handleSubmit}
          /*           className="space-y-4 bg-white p-8 rounded-lg border-2 border-deepBlue"
           */ className="space-y-4 "
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block mb-1 text-sm font-medium text-black">
              Выберите роль:
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border p-2 rounded-md w-full"
            >
              <option value="hr">HR</option>
              <option value="user">Пользователь</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="full_name"
              className="block mb-1 text-sm font-medium text-black"
            >
              Фамилия и Имя
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-[50%] -translate-y-[50%] text-gray-400"
                size={18}
              />
              <input
                type="text"
                id="full_name"
                value={full_name}
                onChange={(e) => setfull_name(e.target.value)}
                required
                className="w-full pl-10 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Иван Иванов"
              />
            </div>
            {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
          </div>

          {role === "hr" && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="w-full sm:w-[50%]">
                <label
                  htmlFor="company"
                  className="block mb-1 text-sm font-medium text-black"
                >
                  Название компании:
                </label>
                <div className="relative">
                  <Building2
                    className="absolute left-3 top-[50%] -translate-y-[50%] text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    className="w-full pl-10 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
                    placeholder="ex. SkillPro"
                  />
                </div>
              </div>

              <div className="w-full sm:w-[50%]">
                <label
                  htmlFor="contact_info"
                  className="block mb-1 text-sm font-medium text-black"
                >
                  Телефон:
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-[50%] -translate-y-[50%] text-gray-400"
                    size={18}
                  />

                  <input
                    type="tel"
                    id="contact_info"
                    value={contact_info}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length > 15) value = value.slice(0, 15);
                      setcontact_info(value);
                    }}
                    required
                    className="w-full pl-10 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="8 (777) 777 77 77"
                  />
                </div>
              </div>
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
            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
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
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-black">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}