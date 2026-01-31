import { useMe, useMyProfile } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { User, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';

export default function ProfilePage() {
  const { data: user, isLoading: userLoading } = useMe();
  const { data: profile, isLoading: profileLoading } = useMyProfile();

  if (userLoading || profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mon Profil</h1>
          <Link to="/settings">
            <Button>Modifier le profil</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Nom d'utilisateur</p>
                  <p className="font-medium">{user?.username}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>

              {user?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              )}

              {user?.date_of_birth && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Date de naissance</p>
                    <p className="font-medium">{user.date_of_birth}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Adresse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.address ? (
                <>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">{profile.address}</p>
                      <p className="text-sm text-gray-600">
                        {profile.postal_code} {profile.city}
                      </p>
                      <p className="text-sm text-gray-600">{profile.country}</p>
                    </div>
                  </div>
                  
                  {profile.bio && (
                    <div>
                      <p className="text-sm text-gray-600">Bio</p>
                      <p className="text-gray-800">{profile.bio}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Aucune adresse renseignée
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Orders Link */}
        <div className="mt-8">
          <Link to="/orders">
            <Button variant="outline" className="w-full">
              Voir mes commandes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
