import { Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Inscription</CardTitle>
            <p className="text-center text-gray-600 mt-2">
              Créez votre compte gratuitement
            </p>
          </CardHeader>
          <CardContent>
            <RegisterForm />
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte ?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Connectez-vous
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
