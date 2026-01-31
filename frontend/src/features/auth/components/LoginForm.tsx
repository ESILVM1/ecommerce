import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const loginSchema = z.object({
  username: z.string().min(1, 'Nom d\'utilisateur requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
      navigate('/shop');
    } catch (error: any) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nom d'utilisateur"
        {...register('username')}
        error={errors.username?.message}
        placeholder="Entrez votre nom d'utilisateur"
      />

      <Input
        label="Mot de passe"
        type="password"
        {...register('password')}
        error={errors.password?.message}
        placeholder="Entrez votre mot de passe"
      />

      {loginMutation.isError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            Identifiants invalides. Veuillez réessayer.
          </p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        isLoading={loginMutation.isPending}
      >
        Se connecter
      </Button>
    </form>
  );
}
