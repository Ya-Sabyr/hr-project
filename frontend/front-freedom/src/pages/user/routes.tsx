import Home from "./Home";
import { Routes, Route, Navigate } from "react-router-dom";
import Apply from "./Apply";
import VacancyDetails from "./VacancyDetail";
import UserAccount from "./UserAccount";

export default function UserRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/user/home" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/vacancies/:vacancyId" element={<VacancyDetails />} />
      <Route path="/apply/:id" element={<Apply />} />
      <Route path="/profile" element={<UserAccount />} />
    </Routes>
  );
}
