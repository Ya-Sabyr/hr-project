import { Check, EllipsisVertical } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HrService } from "../services/hr.service";
import { HRVacancy } from "../types/vacancy";

interface HRJobCardProps {
  vacancy: HRVacancy;
  onDelete: (id: number) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Under review":
      return "text-waitYellow font-semibold";
    case "Accepted":
      return "text-acceptGreen font-semibold";
    case "Rejected":
      return "text-rejectRed font-semibold";
    default:
      return "text-secondaryColor font-semibold";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "Under review":
      return "На рассмотрении";
    case "Accepted":
      return "Принято";
    case "Rejected":
      return "Отказ";
    default:
      return "Неизвестный статус";
  }
};

const HRJobCard: React.FC<HRJobCardProps> = ({ vacancy, onDelete }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  // redirect to upd vacancy page
  const handleEditClick = () => {
    navigate(`/hr/${vacancy.id}`);
    setIsMenuOpen(false);
  };

  const handleDeleteClick = () => {
    setIsModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleDeleteVacancy = async () => {
    try {
      await HrService.deleteVacancy(vacancy.id);
      setIsModalOpen(false);
      onDelete(vacancy.id);
    } catch (error) {
      console.error("Ошибка при удалении вакансии", error);
    }
  };

  const formatSalary = (salary: number) => {
    return Math.round(salary).toLocaleString("kz-KZ");
  };

  return (
    <div className="border-2 px-5 py-4 rounded-3xl relative">
      <div className="absolute top-2 right-2">
        <button
          onClick={toggleMenu}
          className="p-2 hover:bg-gray-200 rounded-full"
        >
          <EllipsisVertical size={20} />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg">
            {vacancy.status === "Under review" ||
            vacancy.status === "Rejected" ? (
              <>
                <button
                  onClick={handleEditClick}
                  className="block w-full px-4 py-2 text-left text-waitYellow hover:bg-gray-100"
                >
                  Обновление
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                >
                  Удалить
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center p-1">
                <Check color="green" size={20} className="mr-1" />
                <span className="text-green-600">Принято</span>
              </div>
            )}
          </div>
        )}
      </div>

      <h4 className="font-semibold text-base">{vacancy.title}</h4>
      <p className="text-muteGray text-sm mt-1 mb-3">{vacancy.position}</p>
      <p className="text-muteGray text-xs">{vacancy.location}</p>
      <p className="text-muteGray text-xs mt-1 mb-3">
        {vacancy.salary_min && vacancy.salary_max
          ? `${formatSalary(vacancy.salary_min)}₸ – ${formatSalary(
              vacancy.salary_max
            )}₸`
          : vacancy.salary_min
          ? `от ${formatSalary(vacancy.salary_min)}₸`
          : vacancy.salary_max
          ? `до ${formatSalary(vacancy.salary_max)}₸`
          : "ЗП не указана"}
      </p>

      <div className="flex justify-between items-center">
        <Link
          className="text-brightBlue"
          to={`/hr/vacancies/${vacancy.id}/candidates`}
        >
          Кандидаты
        </Link>
        <span className={`text-sm ${getStatusColor(vacancy.status)}`}>
          {getStatusText(vacancy.status)}
        </span>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="mb-4">Вы уверены, что хотите удалить вакансию?</p>
            <button
              onClick={handleDeleteVacancy}
              className="bg-red-600 text-white px-4 py-2 rounded-md mr-2"
            >
              Да, удалить
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-300 px-4 py-2 rounded-md"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default HRJobCard;