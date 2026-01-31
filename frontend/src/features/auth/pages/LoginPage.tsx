import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Connexion</CardTitle>
            <p className="text-center text-gray-600 mt-2">
              Connectez-vous à votre compte
            </p>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                  Inscrivez-vous
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
