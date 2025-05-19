import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SkillsInput from "./SkillsInput";
import { HrService } from "../services/hr.service";

interface JobOption {
  profession: string;
  grade: string;
}

const VacancyForm = ({ initialData, onSubmit }: any) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [jobOptions, setJobOptions] = useState<JobOption[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobOption | null>(null);
  const [isLoadingDescription, setIsLoadingDescription] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salaryError, setSalaryError] = useState<string | null>(null);

  const [formData, setFormData] = useState(() => ({
    ...initialData,
    skills:
      typeof initialData.skills === "string"
        ? initialData.skills.split(",").map((s: string) => s.trim())
        : initialData.skills || [],
  }));

  useEffect(() => {
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      skills: initialData.skills
        ? typeof initialData.skills === "string"
          ? initialData.skills.split(",").map((s: string) => s.trim())
          : initialData.skills
        : [],
    }));
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDescriptionSubmit = async () => {
    setIsLoadingDescription(true);
    try {
      const response = await HrService.classifyVacancy(formData.description);
      setJobOptions(response.data.professions);
      setStep(2);
    } catch (error: any) {
      console.error("Ошибка при получении должностей:", error.response?.data);
    } finally {
      setIsLoadingDescription(false);
    }
  };

  const handleJobSelect = (job: JobOption) => {
    setSelectedJob(job);
    setFormData({
      ...formData,
      title: job.profession,
      position: job.grade,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formattedData = {
      title: formData.title ? formData.title.trim() : "",
      position: formData.position ? formData.position.trim() : "",
      description: formData.description ? formData.description.trim() : "",
      salary_min: formData.salary_min
        ? Number(formData.salary_min.replace(/\s/g, ""))
        : 0,
      salary_max: formData.salary_max
        ? Number(formData.salary_max.replace(/\s/g, ""))
        : 0,
      location: formData.location,
      employment_type: formData.employment_type || "Full-time",
      experience_time: formData.experience_time || "No experience",
      job_format: formData.job_format || "Office",
      skills: formData.skills.join(", "),

      telegram: formData.telegram ? formData.telegram.trim() : "",
      whatsapp: formData.whatsapp ? formData.whatsapp.trim() : "",
      email: formData.email ? formData.email.trim() : "",
    };

    try {
      if (onSubmit) {
        await onSubmit(formattedData);
      } else {
        console.error("onSubmit НЕ передан!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSalary = (value: string) => {
    return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/\D/g, "");

    setFormData((prev: any) => {
      const newData = {
        ...prev,
        [name]: formatSalary(numericValue),
      };

      if (newData.salary_min && newData.salary_max) {
        const min = parseInt(newData.salary_min.replace(/\s/g, ""));
        const max = parseInt(newData.salary_max.replace(/\s/g, ""));

        if (min >= max) {
          setSalaryError(
            "Минимальная зарплата должна быть меньше максимальной"
          );
        } else {
          setSalaryError(null);
        }
      } else {
        setSalaryError(null);
      }

      return newData;
    });
  };

  return (
    <div>
      <button className="text-secondaryColor mb-2" onClick={() => navigate(-1)}>
        ← Назад
      </button>

      {step === 1 && (
        <div className="space-y-4 p-6 bg-white border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            Шаг 1: Описание вакансии
          </h2>
          <label className="block mb-2 font-medium">
            Опишите вакансию подробно <span className="text-red-500">*</span>
            <span className="block text-sm text-gray-500 mt-1">
              Чем подробнее описание, тем точнее система подберет профессии
            </span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            rows={10}
            placeholder="Пример: Требуется разработчик для создания веб-приложений на React. Обязанности: разработка интерфейсов, оптимизация производительности, работа в команде. Требования: опыт работы от 2 лет, знание TypeScript, Redux."
            required
          />

          <button
            onClick={handleDescriptionSubmit}
            disabled={isLoadingDescription }
            className={`mt-4 bg-deepBlue text-white px-6 py-3 rounded-lg font-medium transition ${
              isLoadingDescription
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-blue-600 hover:shadow-md"
            }`}
          >
            {isLoadingDescription ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">↻</span>
                Анализируем описание...
              </span>
            ) : (
              "Продолжить"
            )}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 p-6 bg-white border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Шаг 2: Выбор профессии</h2>
          {jobOptions.length > 0 ? (
            <>
              <p className="mb-4 text-gray-600">
                Система предложила следующие варианты. Выберите наиболее
                подходящий:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {jobOptions.map((job, index) => (
                  <button
                    key={index}
                    onClick={() => handleJobSelect(job)}
                    className={`p-4 border rounded-lg text-left transition ${
                      selectedJob?.profession === job.profession
                        ? "border-blue-500 bg-blue-50"
                        : "hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <h3 className="font-medium text-lg">{job.profession}</h3>
                    {job.grade && (
                      <p className="text-gray-600 mt-1">Уровень: {job.grade}</p>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(1)}
                className="mt-4 text-blue-600 hover:text-blue-800 transition"
              >
                ← Вернуться к редактированию описания
              </button>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Не удалось определить профессии по вашему описанию.
              </p>
              <button
                onClick={() => setStep(1)}
                className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition"
              >
                Попробовать снова
              </button>
            </div>
          )}
        </div>
      )}

      {selectedJob && (
        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          <nav className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">
              {initialData.id ? "Редактировать вакансию" : "Добавить вакансию"}
            </h2>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-deepBlue text-white px-5 py-3 rounded-md transition ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-500"
              }`}
            >
              {isSubmitting
                ? "Отправка..."
                : initialData.id
                ? "Сохранить изменения"
                : "Отправить на обработку"}
            </button>
          </nav>

          <div className="space-y-7 p-6 bg-white border-2 rounded-lg">
            {/* title, position, location */}
            <div className="flex justify-between gap-4 mb-8">
              <div className="w-1/3">
                <label className="mb-2 block">
                  Название вакансии <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="w-1/3">
                <label className="mb-2 block">Должность</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="w-1/3">
                <label className="mb-2 block">
                  Локация <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>

            {/* type, time, format, salary */}
            <div className="flex justify-between items-center gap-4 mb-8">
              <label className="w-1/4">
                Тип занятости <span className="text-red-500">*</span>
                <select
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="Full-time">Полная</option>
                  <option value="Part-time">Частичная</option>
                  <option value="Internship">Стажировка</option>
                </select>
              </label>

              <label className="w-1/4">
                Опыт работы <span className="text-red-500">*</span>
                <select
                  name="experience_time"
                  value={formData.experience_time}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="No experience">Без опыта</option>
                  <option value="1-3 years">1-3 года</option>
                  <option value="3-5 years">3-5 лет</option>
                  <option value="More than 5 years">Более 5 лет</option>
                </select>
              </label>

              <label className="w-1/4">
                Формат работы <span className="text-red-500">*</span>
                <select
                  name="job_format"
                  value={formData.job_format}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="Office">Офис</option>
                  <option value="Remote">Удалённо</option>
                  <option value="Hybrid">Гибрид</option>
                </select>
              </label>

              <label className="w-1/4">
                Зарплата <span className="text-red-500">*</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="salary_min"
                    placeholder="От"
                    value={formData.salary_min}
                    onChange={handleSalaryChange}
                    className={`w-1/2 p-2 border rounded ${
                      salaryError ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <input
                    type="text"
                    name="salary_max"
                    placeholder="До"
                    value={formData.salary_max}
                    onChange={handleSalaryChange}
                    className={`w-1/2 p-2 border rounded ${
                      salaryError ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {salaryError && (
                  <p className="text-red-500 text-sm mt-1">{salaryError}</p>
                )}
              </label>
            </div>

            {/* description 
          <div className="mb-8">
            <label className="mb-2 block">
              Описание вакансии <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>*/}

            {/* skills */}
            <SkillsInput
              value={formData.skills || []}
              onChange={(skills) => {
                setFormData((prev: any) => ({ ...prev, skills }));
              }}
            />

            {/* contacts */}
            <div className="flex gap-4 items-center">
              <label className="w-1/3">
                Telegram
                <input
                  type="text"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </label>
              <label className="w-1/3">
                WhatsApp
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </label>
              <label className="w-1/3">
                Email
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </label>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default VacancyForm;
