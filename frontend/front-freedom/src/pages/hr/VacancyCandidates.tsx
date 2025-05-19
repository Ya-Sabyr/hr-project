import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HrService } from "../../services/hr.service";
import HRJobCard from "../../components/HRJobCard";

export const VacancyCandidates = () => {
  const navigate = useNavigate();
  const { vacancyId } = useParams<{ vacancyId: string }>();
  const [vacancy, setVacancy] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSummaries, setExpandedSummaries] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    if (!vacancyId) return;

    const fetchCandidates = async () => {
      try {
        const vacancyResponse = await HrService.getVacancyById(
          Number(vacancyId)
        );
        setVacancy(vacancyResponse.data);

        const candidatesResponse = await HrService.getCandidatesByVacancyId(
          Number(vacancyId)
        );

        setCandidates([...candidatesResponse.data]);
      } catch (err) {
        setError("Не удалось загрузить кандидатов");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [vacancyId]);

  const handleAccept = async (applicationId: number) => {
    try {
      await HrService.acceptCandidate(applicationId);
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.application_id === applicationId
            ? { ...candidate, status: "Accepted" }
            : candidate
        )
      );
    } catch (err) {
      alert("Ошибка при принятии кандидата");
    }
  };

  const handleReject = async (applicationId: number) => {
    try {
      await HrService.rejectCandidate(applicationId);
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.application_id === applicationId
            ? { ...candidate, status: "Rejected" }
            : candidate
        )
      );
    } catch (err) {
      alert("Ошибка при отклонении кандидата");
    }
  };

  const handleDeleteVacancy = async (id: number) => {
    try {
      await HrService.deleteVacancy(id);
      setVacancy(null);
    } catch (error) {
      console.error("Ошибка при удалении вакансии", error);
    }
  };

  const toggleSummary = (applicationId: number) => {
    setExpandedSummaries((prev) => ({
      ...prev,
      [applicationId]: !prev[applicationId],
    }));
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!vacancy) return <p>Вакансия удалена или не найдена.</p>;

  return (
    <div>
      <button className="text-secondaryColor mb-2" onClick={() => navigate(-1)}>
        ← Назад
      </button>
      <h2 className="text-xl font-bold mb-4">Текущий список кандидатов</h2>
      <HRJobCard vacancy={vacancy} onDelete={handleDeleteVacancy} />
      {candidates.length > 0 ? (
        <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {candidates.map((candidate) => {
            return (
              <li
                key={candidate.application_id}
                className="p-4 border border-brightBlue rounded-lg shadow-sm w-full"
              >
                <p className="font-bold text-lg">
                  {candidate.first_name && candidate.last_name
                    ? `${candidate.first_name} ${candidate.last_name}`
                    : "ФИО не указано"}
                </p>

                <p className="mt-1 text-md">
                  {candidate.profession || "Должность не указана"}
                </p>

                <div
                  className={`mt-2  px-3 py-1 rounded-md w-fit ${
                    candidate.matching_score > 50
                      ? "bg-acceptGreen/10 text-acceptGreen"
                      : "bg-rejectRed/10 text-rejectRed"
                  }`}
                >
                  {candidate.matching_score}% соответствия
                </div>

                <div className="flex items-center justify-between mt-2">
                  <p>
                    <a
                      href={candidate.resume_link}
                      className="text-brightBlue underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Резюме
                    </a>
                  </p>

                  <p>
                    <span className="mr-3">Статус:</span>
                    <span
                      className={
                        candidate.status === "Accepted"
                          ? "text-acceptGreen"
                          : candidate.status === "Rejected"
                          ? "text-rejectRed"
                          : "text-waitYellow"
                      }
                    >
                      {candidate.status === "Accepted"
                        ? "Принят"
                        : candidate.status === "Rejected"
                        ? "Отклонён"
                        : "В ожидании"}
                    </span>
                  </p>
                </div>

                {candidate.summary && (
                  <div className="mt-3">
                    <button
                      onClick={() => toggleSummary(candidate.application_id)}
                      className="text-blue-600 hover:text-blue-800 underline font-semibold"
                    >
                      {expandedSummaries[candidate.application_id]
                        ? "Скрыть итог"
                        : "Показать итог"}
                    </button>
                    {expandedSummaries[candidate.application_id] && (
                      <div className="mt-4 bg-gray-50 p-4 rounded-lg text-sm max-w-full space-y-3">
                        <p className="font-semibold text-gray-800">
                          🤖 Итог от ИИ:
                        </p>
                        <div className="space-y-2">
                          <p className="text-gray-700 leading-relaxed">
                            {candidate.summary}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {candidate.status === "Pending" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleReject(candidate.application_id)}
                      className="px-4 py-2 border-2 border-rejectRed text-rejectRed rounded-lg hover:bg-rejectRed hover:text-white  transition"
                    >
                      Отклонить
                    </button>
                    <button
                      onClick={() => handleAccept(candidate.application_id)}
                      className="px-4 py-2  bg-brightBlue text-white rounded-lg hover:bg-deepBlue transition"
                    >
                      Принять
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>Откликов пока нет.</p>
      )}
    </div>
  );
};
