import { useState } from "react";
import { AuthService } from "../../services/auth.service";
import { Navigate, Route, Routes, } from "react-router-dom";
import SettingsPage from "./SettingsPage";
import ListOfVacancy from "./ListOfVacancy";
import Sidebar from "../../components/HRSidebar";
import Dashboard from "./Dashboard";
import ContentWrapper from "../../components/ContentWrapper";
import CreateVacancy from "./CreateVacancy";
import EditVacancy from "./EditVacancy";
import { VacancyCandidates } from "./VacancyCandidates";

export default function HrRoutes() {
  const [isOpen, setIsOpen] = useState(true);
  const handleLogout = () => {
    AuthService.clearTokens();
    window.location.href = "/";
  };

  return (
    <div className="flex bg-white min-h-screen w-full">
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        handleLogout={handleLogout}
      />

      <ContentWrapper isOpen={isOpen} className="flex-1">
        <div className="flex-1 p-6 w-full">
          <Routes>
            <Route path="/" element={<Navigate to="/hr/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vacancies" element={<ListOfVacancy />} />
            <Route
              path="/vacancies/:vacancyId/candidates"
              element={<VacancyCandidates />}
            />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/create-vacancy" element={<CreateVacancy />} />
            <Route path="/:vacancyId" element={<EditVacancy />} />
          </Routes>
        </div>
      </ContentWrapper>
    </div>
  );
}
