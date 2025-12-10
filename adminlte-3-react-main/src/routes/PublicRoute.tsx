import { useAppSelector } from "@app/store/store";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const isLoggedIn = useAppSelector((state) => state.auth.currentUser);
  return isLoggedIn ? <Navigate to={`/dashboard`} /> : <Outlet />;
};

export default PublicRoute;
