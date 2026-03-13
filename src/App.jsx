import { Navigate, Route, Routes } from "react-router-dom";
import BicycleIntroAnimation from "./components/BicycleIntroAnimation";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BicycleIntroAnimation />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
