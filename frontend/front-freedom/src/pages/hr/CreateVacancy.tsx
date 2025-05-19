import { useNavigate } from "react-router-dom";
import { HrService } from "../../services/hr.service";
import VacancyForm from "../../components/VacancyForm";

const CreateVacancy = () => {
  const navigate = useNavigate();

  const handleCreate = async (formData: any) => {
    try {
      await HrService.createVacancy(formData);
      navigate("/hr/vacancies");
    } catch (error: any) {
      console.error(
        "Ошибка при создании вакансии:",
        error.response?.data || error
      );
    }
  };

  return <VacancyForm initialData={{}} onSubmit={handleCreate} />;
};

export default CreateVacancy;