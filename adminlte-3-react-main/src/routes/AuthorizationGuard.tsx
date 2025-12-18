import { useAuthorization } from "@app/hooks/useAuthorization";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useEffect, useRef } from "react";

const AuthorizationGuard = () => {
  const { checkAccess } = useAuthorization();
  const location = useLocation();
  const toastId = useRef<any>(null);

  let isAllowed = true;
  try {
      isAllowed = checkAccess(location.pathname);
  } catch (error) {
      console.error("Authorization check failed", error);
      // Fallback to allow or deny? For security, deny. But for debugging, allow?
      // Let's deny but show error.
      isAllowed = false;
  }

  useEffect(() => {
    if (!isAllowed) {
      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.error("You do not have permission to access this page.");
      }
    }
  }, [isAllowed]);

  if (!isAllowed) {
    if (location.pathname !== "/dashboard" && location.pathname !== "/") {
        return <Navigate to="/dashboard" replace />;
    }
    return <div className="p-4"><h1>Unauthorized Access</h1></div>;
  }

  return <Outlet />;
};

export default AuthorizationGuard;
