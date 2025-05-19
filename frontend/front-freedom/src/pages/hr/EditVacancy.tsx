import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HrService } from "../../services/hr.service";
import VacancyForm from "../../components/VacancyForm";

const EditVacancy = () => {
  const { vacancyId } = useParams<{ vacancyId: string }>();
  const navigate = useNavigate();
  const [vacancyData, setVacancyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vacancyId) return;

    const fetchVacancy = async () => {
      try {
        setLoading(true);
        const response = await HrService.getVacancyById(Number(vacancyId));
        setVacancyData(response.data);
      } catch (error: any) {
        console.error(
          "Ошибка при загрузке вакансии:",
          error.response?.data || error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVacancy();
  }, [vacancyId]);

  const handleUpdate = async (formData: any) => {
    try {
      await HrService.updateVacancy(
        Number(vacancyId),
        formData
      );
      navigate("/hr/vacancies");
    } catch (error: any) {
      console.error(
        "Ошибка при обновлении вакансии:",
        error.response?.data || error
      );
    }
  };

  if (loading) {
    return <p>Загрузка данных...</p>;
  }

  return (
    <VacancyForm
      initialData={{ ...vacancyData, skills: vacancyData?.skills || [] }}
      onSubmit={handleUpdate}
    />
  );
};

export default EditVacancy;