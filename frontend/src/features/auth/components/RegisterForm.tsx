import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useRegister } from '../hooks/useAuth';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const registerSchema = z.object({
  username: z.string().min(3, 'Minimum 3 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
  confirm_password: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirm_password, ...registerData } = data;
      await registerMutation.mutateAsync(registerData);
      navigate('/shop');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Prénom"
          {...register('first_name')}
          error={errors.first_name?.message}
          placeholder="Prénom"
        />
        <Input
          label="Nom"
          {...register('last_name')}
          error={errors.last_name?.message}
          placeholder="Nom"
        />
      </div>

      <Input
        label="Nom d'utilisateur"
        {...register('username')}
        error={errors.username?.message}
        placeholder="Choisissez un nom d'utilisateur"
      />

      <Input
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        placeholder="votre@email.com"
      />

      <Input
        label="Mot de passe"
        type="password"
        {...register('password')}
        error={errors.password?.message}
        placeholder="Minimum 6 caractères"
      />

      <Input
        label="Confirmer le mot de passe"
        type="password"
        {...register('confirm_password')}
        error={errors.confirm_password?.message}
        placeholder="Confirmez votre mot de passe"
      />

      {registerMutation.isError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            Erreur lors de l'inscription. Vérifiez vos informations.
          </p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        isLoading={registerMutation.isPending}
      >
        S'inscrire
      </Button>
    </form>
  );
}
