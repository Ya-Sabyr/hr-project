import { useEffect, useState } from "react";
import { HrService } from "../../services/hr.service";
import { Hr } from "../../types/hr";
import { Mail, Phone } from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import waveImg from "../../../public/images/wave.svg";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Hr | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [contactInfo, setContactInfo] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await HrService.getHrProfile();
        setProfile(response.data);
        setFullName(response.data.full_name);
        setCompany(response.data.company);
        setContactInfo(response.data.contact_info || "");
      } catch (err) {
        setError("Ошибка загрузки профиля");
        console.error("Ошибка получения профиля HR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Update HR Profile
  const handleUpdateProfile = async () => {
    try {
      const updatedData = {
        full_name: fullName,
        company: company,
        contact_info: contactInfo,
      };

      await HrService.updateHrProfile(updatedData);
      Swal.fire({
        title: "Успех!",
        text: "Профиль успешно обновлён",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#3b82f6", // Синий цвет как в вашем дизайне
      });

      setProfile((prev) => (prev ? { ...prev, ...updatedData } : null));
    } catch (err: any) {
      alert("Ошибка: " + err.response?.data?.detail || "Неизвестная ошибка");
    }
  };

  // Delete HR Profile
  const handleDeleteProfile = async () => {
    const result = await Swal.fire({
      title: "Вы уверены?",
      text: "Вы не сможете восстановить профиль!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Да, удалить!",
      cancelButtonText: "Отмена",
    });

    if (!result.isConfirmed) return;

    try {
      await HrService.deleteHrProfile();
      Swal.fire("Удалено!", "Ваш профиль был удалён.", "success").then(() => {
        navigate("/");
      });
      setProfile(null);
    } catch (err) {
      Swal.fire("Ошибка!", "Не удалось удалить профиль", "error");
    }
    
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-6">Настройки профиля</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                {contactInfo || "Не указано"}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm p-6 flex justify-center">
          <img src={waveImg} alt="" className="w-40 h-40"/>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <label className="block mb-4">
          <span className="text-gray-700">Полное имя</span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="border p-2 w-full mt-1"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Компания</span>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="border p-2 w-full mt-1"
          />
        </label>

        <label className="block mb-6">
          <span className="text-gray-700">Контакты</span>
          <input
            type="text"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            className="border p-2 w-full mt-1"
          />
        </label>

        <div className="flex gap-4">
          <button
            onClick={handleUpdateProfile}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
          >
            Обновить профиль
          </button>

          <button
            onClick={handleDeleteProfile}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
          >
            Удалить профиль
          </button>
        </div>
      </div>
    </div>
  );
}
