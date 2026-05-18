import { Navigate } from 'react-router-dom';

// Reports root → redirect to overview sub-report
export default function Reports() {
  return <Navigate to="/reports/overview" replace />;
}