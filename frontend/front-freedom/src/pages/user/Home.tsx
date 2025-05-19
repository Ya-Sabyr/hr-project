import React, { useState, useEffect, useCallback } from "react";
import { Loader2, MapPin, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserService } from "../../services/user.service";
import { UserVacancy } from "../../types/vacancy";
import { DecodeUser } from "../../services/userId.decode";

const Home: React.FC = () => {
  const [vacancies, setVacancies] = useState<UserVacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appliedVacancies, setAppliedVacancies] = useState<string[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userId = await DecodeUser.getUserIdFromToken();
      const [vacanciesData, appliedData] = await Promise.all([
        UserService.getAcceptedVacancies(),
        userId
          ? UserService.getAppliedVacancies(userId)
          : Promise.resolve({ data: [] }),
      ]);

      setVacancies(vacanciesData.data);

      const appliedIds = appliedData.data.map((item: any) =>
        String(item.vacancy?.id || item.id || item)
      );
      setAppliedVacancies(appliedIds);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ошибка при загрузке вакансий 😭");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchData]);

  const formatSalary = useCallback((salary: number) => {
    return Math.round(salary).toLocaleString("kz-KZ") + "₸";
  }, []);

  const getJobFormatInfo = useCallback((format: string) => {
    switch (format) {
      case "Remote":
        return { text: "Удалёнка", color: "#c8b6ff" };
      case "Hybrid":
        return { text: "Гибрид", color: "#ffd6ff" };
      default:
        return { text: "Офис", color: "#bbd0ff" };
    }
  }, []);

  const getExperienceText = useCallback((experience: string) => {
    switch (experience) {
      case "1-3 years":
        return "1-3 года";
      case "3-5 years":
        return "3-5 лет";
      case "More than 5 years":
        return "Более 5 лет";
      default:
        return "Нет опыта работы";
    }
  }, []);

  const renderSalary = useCallback(
    (vacancy: UserVacancy) => {
      if (vacancy.salary_min && vacancy.salary_max) {
        return `${formatSalary(vacancy.salary_min)} – ${formatSalary(
          vacancy.salary_max
        )}`;
      }
      if (vacancy.salary_min) return `от ${formatSalary(vacancy.salary_min)}`;
      if (vacancy.salary_max) return `до ${formatSalary(vacancy.salary_max)}`;
      return "ЗП не указана";
    },
    [formatSalary]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-160px)]">
        <Loader2 className="animate-spin text-brightBlue" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-160px)]">
        <p className="text-center text-rejectRed text-lg font-medium">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 lg:px-16 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-deepBlue">
          🚀 Найдите свою мечту!
        </h1>
        <button
          onClick={() => navigate("/user/profile")}
          className="bg-brightBlue text-white px-4 py-2 rounded-lg shadow-md hover:bg-deepBlue transition whitespace-nowrap"
        >
          Личный кабинет
        </button>
      </div>

      {vacancies.length === 0 && !isLoading && !error ? (
        <div className="flex justify-center items-center h-[calc(100vh-260px)]">
          <p className="text-center text-secondaryColor text-lg">
            Нет доступных вакансий
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vacancies.map((vacancy) => {
            const isApplied = appliedVacancies.includes(String(vacancy.id));
            const jobFormat = getJobFormatInfo(vacancy.job_format);

            return (
              <div
                key={vacancy.id}
                className={`bg-white shadow-md rounded-lg p-4 border cursor-pointer ${
                  isApplied ? "border-muteGray opacity-70" : "border-muteGray"
                } transition-all duration-300 ${
                  hoveredCard === vacancy.id
                    ? "ring-2 ring-brightBlue scale-[1.02]"
                    : ""
                }`}
                onMouseEnter={() => setHoveredCard(vacancy.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => navigate(`/user/vacancies/${vacancy.id}`)}
              >
                <h2 className="text-xl font-semibold text-deepBlue mb-1 line-clamp-1">
                  {vacancy.title}
                </h2>
                <p className="text-secondaryColor text-base mb-1 line-clamp-1">
                  {vacancy.position}
                </p>

                <div className="flex items-center text-muteGray text-sm mb-1">
                  <MapPin size={18} className="mr-1 flex-shrink-0" />
                  <span className="line-clamp-1">{vacancy.location}</span>
                </div>

                <div className="flex items-center text-muteGray text-sm mb-1">
                  <Briefcase size={18} className="mr-1 flex-shrink-0" />
                  <span>{getExperienceText(vacancy.experience_time)}</span>
                </div>

                <div className="mt-2">
                  <span
                    className="text-xs font-medium text-blue-950 px-2 py-1 rounded-full"
                    style={{ backgroundColor: jobFormat.color }}
                  >
                    {jobFormat.text}
                  </span>
                </div>

                <p className="text-blue-950 font-bold text-lg mt-2">
                  {renderSalary(vacancy)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
