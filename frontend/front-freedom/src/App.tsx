import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoutes";
import LandingPage from "./components/LandingPage";
import HrRoutes from "./pages/hr/routes";
import AdminRoutes from "./pages/admin/routes";
import UserRoutes from "./pages/user/routes";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <LandingPage />
            </>
          }
        />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/hr/*"
          element={
            <ProtectedRoute element={<HrRoutes />} allowedRoles={["hr"]} />
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute
              element={<AdminRoutes />}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path="/user/*"
          element={
            <ProtectedRoute
              element={<UserRoutes />}
              allowedRoles={["user"]}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
