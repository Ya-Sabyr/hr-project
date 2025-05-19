import { Users, BriefcaseBusiness, Loader, NotepadText } from "lucide-react";
import Sidebar from "./Sidebar";
import { AdminService } from "../services/admin.service";
import { useState, useEffect } from "react";

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleLogout: () => void;
}

export default function AdminSidebar(props: AdminSidebarProps) {
  const [pendingVacanciesCount, setPendingVacanciesCount] = useState<number>(0);
  const [pendingHrsCount, setPendingHrsCount] = useState<number>(0);

  const fetchPendingData = async () => {
    try {
      const vacanciesResponse = await AdminService.getVacanciesUnderReview();
      setPendingVacanciesCount(vacanciesResponse.data.length);

      const hrsResponse = await AdminService.getPendingHrs();
      setPendingHrsCount(hrsResponse.data.length);
    } catch (error) {
      console.error("Ошибка при получении списка", error);
    }
  };

  useEffect(() => {
    fetchPendingData();
  }, []);

  const navItems = [
    { path: "users", label: "Пользователи", icon: <Users size={24} /> },
    {
      path: "hrs",
      label: "HR-ы",
      icon: <BriefcaseBusiness size={24} />,
    },
    {
      path: "pending",
      label: (
        <span className="flex items-center gap-2">
          HR-ы ждут
          {pendingHrsCount > 0 && (
            <span className="bg-deepBlue text-white text-xs font-bold px-2 py-1 rounded-full">
              {pendingHrsCount}
            </span>
          )}
        </span>
      ),
      icon: <Loader size={24} />,
    },
    {
      path: "review-vacancies",
      label: (
        <span className="flex items-center gap-2">
          Вакансии{" "}
          {pendingVacanciesCount > 0 && (
            <span className="bg-deepBlue text-white text-xs font-bold px-2 py-1 rounded-full">
              {pendingVacanciesCount}
            </span>
          )}
        </span>
      ),
      icon: <NotepadText size={24} />,
    },
  ];

  return <Sidebar {...props} navItems={navItems} title="Admin Panel"  updateCounts={fetchPendingData}  />;
}