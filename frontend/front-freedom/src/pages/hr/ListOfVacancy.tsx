import HRJobCard from "../../components/HRJobCard";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HrService } from "../../services/hr.service";
import { HRVacancy } from "../../types/vacancy";

function ListOfVacancy() {
  const [vacancies, setVacancies] = useState<HRVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleDeleteVacancy = (id: number) => {
    setVacancies((prev) => prev.filter((vacancy) => vacancy.id !== id));
  };

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        const response = await HrService.getAllVacancies();
        setVacancies(response.data || []);
      } catch (error) {
        console.error("Ошибка загрузки вакансий:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVacancies();
  }, []);

  return (
    <div className="m-6">
      <h3 className="text-xl font-bold mb-9">Текущий список вакансий</h3>
      <nav className="flex justify-between mb-5">
        {/* <div className="border-2 border-deepBlue py-3 px-4 rounded-lg">
          <SearchBar placeholder="Поиск вакансий..." onSearch={handleSearch} />
        </div> */}

        <button
          className="bg-deepBlue px-4 py-3 rounded-lg text-white text-sm"
          onClick={() => navigate("/hr/create-vacancy")}
        >
          + Добавить новую вакансию
        </button>
      </nav>
      {loading ? (
        <p className="text-center text-gray-500">Загрузка...</p>
      ) : vacancies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vacancies.map((vacancy) => (
            <HRJobCard
              key={vacancy.id}
              vacancy={vacancy}
              onDelete={handleDeleteVacancy}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">Вакансий пока нет</p>
      )}
    </div>
  );
}
export default ListOfVacancy;
