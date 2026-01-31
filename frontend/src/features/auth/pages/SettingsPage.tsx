import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMyProfile, useUpdateProfile, useChangePassword } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useState } from 'react';

const profileSchema = z.object({
  bio: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  gender: z.enum(['M', 'F', 'O']).optional(),
});

const passwordSchema = z.object({
  old_password: z.string().min(1, 'Requis'),
  new_password: z.string().min(6, 'Minimum 6 caractères'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { data: profile } = useMyProfile();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: profile || undefined,
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfileMutation.mutateAsync(data);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync(data);
      passwordForm.reset();
    } catch (error) {
      console.error('Password change failed:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Paramètres</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Profil
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'password'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mot de passe
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle>Modifier le profil</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                  <select
                    {...profileForm.register('gender')}
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                  >
                    <option value="">Non spécifié</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                    <option value="O">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    {...profileForm.register('bio')}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="Parlez-nous de vous..."
                  />
                </div>

                <Input
                  label="Adresse"
                  {...profileForm.register('address')}
                  placeholder="123 Rue Example"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Code postal"
                    {...profileForm.register('postal_code')}
                    placeholder="75001"
                  />
                  <Input
                    label="Ville"
                    {...profileForm.register('city')}
                    placeholder="Paris"
                  />
                </div>

                <Input
                  label="Pays"
                  {...profileForm.register('country')}
                  placeholder="France"
                />

                {updateProfileMutation.isSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-600">Profil mis à jour avec succès !</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={updateProfileMutation.isPending}
                >
                  Enregistrer les modifications
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <Card>
            <CardHeader>
              <CardTitle>Changer le mot de passe</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <Input
                  label="Mot de passe actuel"
                  type="password"
                  {...passwordForm.register('old_password')}
                  error={passwordForm.formState.errors.old_password?.message}
                />

                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  {...passwordForm.register('new_password')}
                  error={passwordForm.formState.errors.new_password?.message}
                />

                <Input
                  label="Confirmer le nouveau mot de passe"
                  type="password"
                  {...passwordForm.register('confirm_password')}
                  error={passwordForm.formState.errors.confirm_password?.message}
                />

                {changePasswordMutation.isSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-600">Mot de passe changé avec succès !</p>
                  </div>
                )}

                {changePasswordMutation.isError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">Erreur: Vérifiez votre mot de passe actuel</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={changePasswordMutation.isPending}
                >
                  Changer le mot de passe
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
