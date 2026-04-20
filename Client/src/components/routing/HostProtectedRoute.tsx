import ProtectedRoute from "./ProtectedRoute";

function HostProtectedRoute() {
  return <ProtectedRoute requiredAccess="host" />;
}

export default HostProtectedRoute;