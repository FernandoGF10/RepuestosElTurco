import { Navigate, useLocation } from "react-router-dom";
import { getSession } from "@/lib/adminStore";

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const session = getSession();
  const location = useLocation();
  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return children;
};

export default RequireAuth;
