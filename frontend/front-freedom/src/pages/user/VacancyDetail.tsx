import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserService } from "../../services/user.service";
import { UserVacancy } from "../../types/vacancy";
import { Globe, Mail, Send } from "lucide-react";
import { DecodeUser } from "../../services/userId.decode";
import Swal from "sweetalert2";

const VacancyDetails: React.FC = () => {
  const { vacancyId } = useParams<{ vacancyId: string }>();
  const [vacancy, setVacancy] = useState<UserVacancy | null>(null);
  const [uploadedResumeId, setUploadedResumeId] = useState<number | null>(null);
  const [selectedResumeFile, setResume] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadResumeLoading, setIsUploadResumeLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  if (!vacancyId) {
    return <p className="text-center">Ошибка: ID вакансии не указан</p>;
  }

  useEffect(() => {
    const fetchVacancy = async () => {
      setIsLoading(true);
      try {
        const response = await UserService.getAcceptedVacancyById(vacancyId);
        setVacancy(response.data);
      } catch (err: any) {
        setError(
          err.response?.data?.detail || "Ошибка при загрузке вакансии 😢"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchVacancy();
  }, [vacancyId]);

  useEffect(() => {
    const checkApplied = async () => {
      try {
        const userId = await DecodeUser.getUserIdFromToken();
        if (!userId) return;
        const response = await UserService.getAppliedVacancies(userId);
        const appliedIds = response.data.map((id: any) => Number(id));
        setHasApplied(appliedIds.includes(Number(vacancyId)));
      } catch (error) {
        console.error("Ошибка при проверке отклика:", error);
      }
    };

    if (vacancyId) checkApplied();
  }, [vacancyId]);

  const handleUploadResume = async () => {
    if (!selectedResumeFile) {
      Swal.fire({
        icon: "warning",
        title: "Файл не выбран",
        text: "Пожалуйста, выберите резюме перед загрузкой.",
      });
      return;
    }
    setIsUploadResumeLoading(true);
    try {
      const response = await UserService.uploadResume(selectedResumeFile);
      const uploadedResumeId = response.resume_id;
      setUploadedResumeId(uploadedResumeId);
      Swal.fire({
        icon: "success",
        title: "Успешно! 🎉",
        text: "Резюме успешно загружено!",
        confirmButtonColor: "#0062FF",
      });
    } catch (error: any) {
      console.error("Ошибка при загрузке:", error.response?.data || error);
      Swal.fire({
        icon: "error",
        title: "Ошибка загрузки",
        text: error.response?.data?.detail || "Попробуйте позже.",
      });
    } finally {
      setIsUploadResumeLoading(false);
    }
  };

  const handleApply = async () => {
    if (!uploadedResumeId) return;

    setIsApplying(true);

    try {
      await UserService.createApplication(Number(vacancyId), uploadedResumeId);

      setHasApplied(true);

      Swal.fire({
        icon: "success",
        title: "Отклик отправлен! 📨",
        text: "Вы успешно откликнулись на вакансию.",
        confirmButtonColor: "#0062FF",
      });
    } catch (error: any) {
      console.error("Ошибка при отклике:", error.response?.data || error);
      Swal.fire({
        icon: "error",
        title: "Ошибка при отклике",
        text: "Пожалуйста, попробуйте позже.",
      });
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) return <p className="text-center">Загрузка...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;
  if (!vacancy) return <p className="text-center">Вакансия не найдена 😕</p>;

  const formatSalary = (salary: number) => {
    return Math.round(salary).toLocaleString("kz-KZ") + "₸";
  };

  return (
    <div className="container mx-auto my-8 px-4 max-w-3xl">
      <div className="bg-white shadow-2xl rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2 text-deepBlue text-center">
          {vacancy.title}
        </h1>
        <p className="text-lg text-secondaryColor">{vacancy.position}</p>

        <p className="mt-2 mb-2 text-blue-950 text-xl font-semibold">
          {vacancy.salary_min && vacancy.salary_max
            ? `${formatSalary(vacancy.salary_min)} – ${formatSalary(
                vacancy.salary_max
              )}`
            : vacancy.salary_min
            ? `от ${formatSalary(vacancy.salary_min)}₸`
            : vacancy.salary_max
            ? `до ${formatSalary(vacancy.salary_max)}₸`
            : "ЗП не указана"}
        </p>

        <div className="grid grid-cols-4 gap-4">
          <div className=" p-3 rounded-lg border border-muteGray">
            <h3 className="font-bold text-lg text-deepBlue">Опыт</h3>
            <p className="mt-1 text-gray-950">
              {vacancy.experience_time === "1-3 years"
                ? "1-3 года"
                : vacancy.experience_time === "3-5 years"
                ? "3-5 лет"
                : vacancy.experience_time === "More than 5 years"
                ? "Более 5 лет"
                : "Нет опыта работы"}
            </p>
          </div>
          <div className=" p-4 rounded-lg border border-muteGray">
            <h3 className="font-bold text-lg text-deepBlue">Локация</h3>
            <p className="mt-1 text-gray-950">{vacancy.location}</p>
          </div>

          <div className=" p-4 rounded-lg border border-muteGray">
            <h3 className="font-bold text-lg text-deepBlue">Формат работы</h3>

            <p className="mt-1 text-gray-950">
              {vacancy.job_format === "Remote"
                ? "Удалёнка"
                : vacancy.job_format === "Hybrid"
                ? "Гибрид"
                : "Офис"}
            </p>
          </div>

          <div className=" p-4 rounded-lg border border-muteGray">
            <h3 className="font-bold text-lg text-deepBlue">Тип занятости</h3>

            <p className="mt-1 text-gray-950">
              {vacancy.employment_type === "Full-time"
                ? "Полная занятость"
                : vacancy.employment_type === "Part-time"
                ? "Частичная"
                : "Стажировка"}
            </p>
          </div>
        </div>

        <div className=" p-3 rounded-lg mt-4 mb-5 border border-muteGray">
          <h3 className="font-bold text-lg text-deepBlue">Описание</h3>
          <p className="mt-1 text-gray-950">
            {vacancy.description || "Нет описания"}
          </p>
        </div>

        <div className="mt-4">
          <h3 className="font-bold text-lg text-deepBlue">Навыки</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {vacancy.skills ? (
              (Array.isArray(vacancy.skills)
                ? vacancy.skills
                : vacancy.skills.split(",")
              ).map((skill, index) => (
                <span
                  key={index}
                  className="bg-orange-300 text-sm px-2 py-2 rounded-lg"
                >
                  {skill.trim()}
                </span>
              ))
            ) : (
              <p className="text-gray-500">Не указаны</p>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg border border-muteGray">
          <h3 className="font-bold text-lg text-deepBlue mb-2"> Контакты:</h3>
          <div className="flex flex-col gap-2">
            {vacancy.telegram && (
              <a
                href={`https://t.me/${vacancy.telegram}`}
                target="_blank"
                className="flex items-center text-brightBlue hover:text-deepBlue transition"
              >
                <Send className="mr-2 text-xl" /> {vacancy.telegram}
              </a>
            )}

            {vacancy.whatsapp && (
              <a
                href={`https://wa.me/${vacancy.whatsapp}`}
                target="_blank"
                className="flex items-center text-green-600 hover:text-green-800 transition"
              >
                <Globe className="mr-2 text-xl" /> {vacancy.whatsapp}
              </a>
            )}

            {vacancy.email && (
              <a
                href={`mailto:${vacancy.email}`}
                className="flex items-center text-secondaryColor hover:text-gray-800 transition"
              >
                <Mail className="mr-2 text-xl" /> {vacancy.email}
              </a>
            )}
          </div>
        </div>

        {!hasApplied ? (
          <div className="mt-4">
            <h3 className="font-bold text-lg text-deepBlue mb-2">
              Загрузите резюме:
            </h3>
            <label
              htmlFor="resume-upload"
              className={`flex items-center justify-center border-2 border-dashed border-gray-400 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition ${
                isUploadResumeLoading || isApplying || Boolean(uploadedResumeId)
                  ? "opacity-50 pointer-events-none"
                  : ""
              }`}
            >
              {selectedResumeFile ? (
                <span className="text-gray-900">{selectedResumeFile.name}</span>
              ) : (
                <span className="text-gray-500">
                  Выберите файл или перетащите сюда
                </span>
              )}
            </label>
            <input
              id="resume-upload"
              type="file"
              accept=".pdf"
              className="hidden"
              disabled={isUploadResumeLoading || isApplying || Boolean(uploadedResumeId)}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setResume(e.target.files[0]);
                }
              }}
            />

            <button
              onClick={handleUploadResume}
              disabled={!selectedResumeFile || isUploadResumeLoading || Boolean(uploadedResumeId)}
              className={`mt-2 px-4 py-2 text-white rounded-lg transition w-full ${
                uploadedResumeId
                  ? "bg-gray-400 cursor-not-allowed"
                  : isUploadResumeLoading
                  ? "bg-[#0044bb]"
                  : selectedResumeFile && !isApplying
                  ? "bg-brightBlue hover:bg-deepBlue"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isUploadResumeLoading ? "Идёт загрузка..." : "Загрузить резюме"}
            </button>

            {uploadedResumeId && (
              <button
                onClick={handleApply}
                disabled={isApplying || isUploadResumeLoading}
                className={`mt-2 w-full py-2 rounded-lg text-white transition ${
                  isApplying
                    ? "bg-[#0044bb]"
                    : "bg-brightBlue hover:bg-deepBlue"
                }`}
              >
                {isApplying ? "Отправка..." : "Откликнуться"}
              </button>
            )}
          </div>
        ) : (
          <p className="mt-4 text-green-600">Вы успешно откликнулись! 🎉</p>
        )}
      </div>
    </div>
  );
};

export default VacancyDetails;
