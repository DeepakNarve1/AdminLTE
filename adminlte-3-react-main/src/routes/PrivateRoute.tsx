import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@app/store/store";

const PrivateRoute = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const token = localStorage.getItem("token");

  // Check both Redux state and localStorage token
  return currentUser && token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
