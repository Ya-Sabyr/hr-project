import { useEffect, useState } from "react";
import { AdminService } from "../../services/admin.service";
import { AdminVacancy } from "../../types/vacancy";

const ReviewVacancies = () => {
  const [vacancies, setVacancies] = useState<AdminVacancy[]>([]);
  const [selectedVacancy, setSelectedVacancy] = useState<AdminVacancy | null>(null);

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      const response = await AdminService.getVacanciesUnderReview();
      setVacancies(response.data);
    } catch (error) {
      console.error("Ошибка загрузки вакансий:", error);
    }
  };

  const handleStatusChange = async (vacancyId: number, status: "Accepted" | "Rejected") => {
    try {
      await AdminService.changeVacancyStatus(vacancyId, status);
      setVacancies(vacancies.filter((vacancy) => vacancy.id !== vacancyId));
      setSelectedVacancy(null);
    } catch (error) {
      console.error("Ошибка при изменении статуса:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Вакансии на модерации</h2>
      {vacancies.length === 0 ? (
        <p>Нет вакансий на рассмотрении.</p>
      ) : (
        <ul className="space-y-4">
          {vacancies.map((vacancy) => (
            <li key={vacancy.id} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{vacancy.title}</h3>
                <p>{vacancy.position}</p>
              </div>
              <div className="space-x-2">
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded-md"
                  onClick={() => setSelectedVacancy(vacancy)}
                >
                  Подробнее
                </button>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-md"
                  onClick={() => handleStatusChange(vacancy.id, "Accepted")}
                >
                  Принять
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md"
                  onClick={() => handleStatusChange(vacancy.id, "Rejected")}
                >
                  Отклонить
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* modal about vacancy details */}
      {selectedVacancy && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h3 className="text-xl font-bold mb-4">{selectedVacancy.title}</h3>
            <p>
              <strong>Должность:</strong> {selectedVacancy.position}
            </p>
            <p>
              <strong>Описание:</strong> {selectedVacancy.description}
            </p>
            <p>
              <strong>Зарплата:</strong> {selectedVacancy.salary_min} - {selectedVacancy.salary_max} KZT
            </p>
            <p>
              <strong>Тип занятости:</strong> {selectedVacancy.employment_type}
            </p>
            <p>
              <strong>Опыт работы:</strong> {selectedVacancy.experience_time}
            </p>
            <p>
              <strong>Формат работы:</strong> {selectedVacancy.job_format}
            </p>
            <p>
              <strong>Навыки:</strong> {selectedVacancy.skills}
            </p>
            <p>
              <strong>Контакты:</strong>
              {selectedVacancy.telegram && <span> Telegram: {selectedVacancy.telegram} </span>}
              {selectedVacancy.whatsapp && <span> | WhatsApp: {selectedVacancy.whatsapp} </span>}
              {selectedVacancy.email && <span> | Email: {selectedVacancy.email} </span>}
            </p>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded-md"
                onClick={() => setSelectedVacancy(null)}
              >
                Закрыть
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md"
                onClick={() => handleStatusChange(selectedVacancy.id, "Accepted")}
              >
                Принять
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md"
                onClick={() => handleStatusChange(selectedVacancy.id, "Rejected")}
              >
                Отклонить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewVacancies;
