import { Navigate, useLocation } from "react-router-dom";
import { api } from "@/lib/api";

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  if (!api.token.get()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return children;
};

export default RequireAuth;
