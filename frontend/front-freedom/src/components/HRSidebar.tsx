import { Briefcase, Settings, LayoutDashboard, Users } from "lucide-react";
import Sidebar from "./Sidebar";

interface HRSidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleLogout: () => void;
}

export default function HRSidebar(props: HRSidebarProps) {
  const navItems = [
    {
      path: "dashboard",
      label: "Главная",
      icon: <LayoutDashboard size={24} />,
    },
    { path: "vacancies", label: "Вакансии", icon: <Briefcase size={24} /> },
/*     { path: "candidates", label: "Кандидаты", icon: <Users size={24} /> },
 */    { path: "settings", label: "Настройки", icon: <Settings size={24} /> },
  ];

  return <Sidebar {...props} navItems={navItems} title="HR Portal" />;
}
