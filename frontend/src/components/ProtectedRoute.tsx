import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4 text-red-600">Accès Refusé</h1>
        <p className="text-gray-600 mb-8">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <a href="/" className="text-primary-600 hover:text-primary-700 underline">
          Retour à l'accueil
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
