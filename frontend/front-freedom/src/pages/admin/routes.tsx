import { useState } from "react";
import {Routes, Route } from "react-router-dom";
import ContentWrapper from "../../components/ContentWrapper";
import { AuthService } from "../../services/auth.service";
import Sidebar from "../../components/AdminSidebar";
import Users from "./Users";
import PendingHrs from "./PendingHrs";
import AllHrs from "./AllHrs";
import ReviewVacancies from "./ReviewVacancies";

export default function AdminRoutes() {
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
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/users" element={<Users />} />
            <Route path="/hrs" element={<AllHrs />} />
            <Route path="/pending" element={<PendingHrs />} />
            <Route path="/review-vacancies" element={<ReviewVacancies />} />
          </Routes>
        </div>
      </ContentWrapper>
    </div>
  );
}
