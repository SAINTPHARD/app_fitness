import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const isLoggedIn = Boolean(localStorage.getItem('token'));
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}
