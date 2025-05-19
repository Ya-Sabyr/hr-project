import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";
import { User } from "../../types/user";
import { Briefcase, FileText, Mail } from "lucide-react";

const UserAccount = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "vacancies" | "resumes" | "responses"
  >("vacancies");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const profileRes = await UserService.getProfile();
        setUser(profileRes.data);

        const vacanciesRes = await UserService.getAppliedVacancyDetails(
          profileRes.data.id
        );
        setVacancies(vacanciesRes.data);

        const resumesRes = await UserService.getResume();
        setResumes(resumesRes.data);

        const applicationsRes = await UserService.getApplications();
        setApplications(applicationsRes.data);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
        setError("Не удалось загрузить данные");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    AuthService.clearTokens();
    navigate("/login");
  };

  if (isLoading)
    return (
      <div className="text-center">
        Загрузка... <span className="spinner"></span>
      </div>
    );
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="container mx-auto px-4 sm:px-8 lg:px-16 py-8">
      <button className="text-secondaryColor mb-2" onClick={() => navigate(-1)}>
        ← Назад
      </button>

      <h1 className="text-2xl font-bold mb-4">Личный кабинет</h1>

      <div className="bg-white p-6 rounded-lg shadow-md border border-deepBlue">
        <p className="text-lg font-semibold text-deepBlue">{user?.full_name}</p>
        <p className="text-muteGray">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-rejectRed text-white rounded-lg hover:bg-opacity-80 transition"
        >
          Выйти
        </button>
      </div>

      <div className="flex border-b border-gray-200 mb-6 mt-4">
        <button
          className={`flex items-center py-2 px-4 font-medium ${
            activeTab === "vacancies"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("vacancies")}
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Ваши отклики
        </button>

        <button
          className={`flex items-center py-2 px-4 font-medium ${
            activeTab === "resumes"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("resumes")}
        >
          <FileText className="w-4 h-4 mr-2" />
          Мои резюме
        </button>

        <button
          className={`flex items-center py-2 px-4 font-medium ${
            activeTab === "responses"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("responses")}
        >
          <Mail className="w-4 h-4 mr-2" />
          Мои ответы
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {activeTab === "vacancies" && (
          <>
            <h2 className="text-xl font-semibold mb-4">Ваши отклики</h2>
            {vacancies.length > 0 ? (
              <ul className="space-y-4">
                {vacancies.map((vacancy) => (
                  <li
                    key={vacancy.id}
                    className="border p-4 rounded hover:shadow transition"
                  >
                    <p className="text-lg font-semibold">{vacancy.title}</p>
                    <button
                      className="text-brightBlue underline mt-1"
                      onClick={() => navigate(`/user/vacancies/${vacancy.id}`)}
                    >
                      Подробнее
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">У вас пока нет откликов</p>
            )}
          </>
        )}

        {activeTab === "resumes" && (
          <>
            <h2 className="text-xl font-semibold mb-4">Мои резюме</h2>
            {resumes.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="border p-4 rounded hover:shadow transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-deepBlue">
                          {resume.first_name} {resume.last_name}
                        </h3>
                        <p className="text-lg font-semibold mt-1">
                          {resume.profession} ({resume.grade})
                        </p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {resume.experience_time} года опыта
                      </span>
                    </div>
                    {resume.resume_link && (
                      <div className="mt-4">
                        <a
                          href={resume.resume_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-brightBlue hover:underline"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Скачать полное резюме (PDF)
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">У вас пока нет резюме</p>
              </div>
            )}
          </>
        )}

        {activeTab === "responses" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-deepBlue mb-6">
              Ответы работодателей
            </h2>

            {applications.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 text-lg">
                  У вас пока нет ответов от работодателей
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {applications.map((application) => {
                  const isLowMatch = application.matching_score < 50;

                  return (
                    <div
                      key={application.id}
                      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-deepBlue">
                          {application.vacancy_title}
                        </h3>

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            application.status === "Accepted"
                              ? "bg-green-100 text-green-800"
                              : application.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {application.status}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-4">
                          <div
                            className={`h-2.5 rounded-full ${
                              isLowMatch ? "bg-red-500" : "bg-brightBlue"
                            }`}
                            style={{ width: `${application.matching_score}%` }}
                          ></div>
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            isLowMatch ? "text-red-600" : "text-gray-700"
                          }`}
                        >
                          Совпадение: {application.matching_score}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAccount;
