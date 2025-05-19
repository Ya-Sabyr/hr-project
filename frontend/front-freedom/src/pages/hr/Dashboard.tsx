import { useEffect, useState } from "react";
import { HrService } from "../../services/hr.service";
import { Hr } from "../../types/hr";
import {
  Briefcase,
  User,
  Building,
  Mail,
  Phone,
  Clock,
  Smile,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [profile, setProfile] = useState<Hr | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes] = await Promise.all([HrService.getHrProfile()]);
        setProfile(profileRes.data);
      } catch (err) {
        setError("Ошибка загрузки данных");
        console.error("Ошибка получения данных:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
          <div className="h-4 bg-blue-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-blue-200 rounded w-24"></div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <User className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Добро пожаловать, {profile?.full_name}!
              </h1>
              <p className="text-gray-600 flex items-center">
                <Building className="mr-1" size={16} /> {profile?.company}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
              <Clock className="mr-1" size={14} /> Последний вход: сегодня
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Ваши контакты
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <Mail className="text-gray-500 mr-2" size={18} />
              <span className="text-gray-700">
                {profile?.email || "Не указано"}
              </span>
            </div>
            <div className="flex items-center">
              <Phone className="text-gray-500 mr-2" size={18} />
              <span className="text-gray-700">
                {profile?.contact_info || "Не указано"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm p-6 flex flex-col items-center">
          <Smile width={70} height={70}/>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Отличного дня!
          </h3>
          <p className="text-gray-600 text-center text-sm">
            Сегодня вы можете найти идеального кандидата для своей команды!
          </p>
        </div>

        <div className=" bg-white rounded-xl shadow-sm p-6  flex flex-col items-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Быстрые действия
          </h2>
          <button
            className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-4 rounded-lg transition flex flex-col items-center"
            onClick={() => navigate("/hr/create-vacancy")}
          >
            <Briefcase className="mb-2" />
            <span>Новая вакансия</span>
          </button>
        </div>
      </div>
    </div>
  );
}
