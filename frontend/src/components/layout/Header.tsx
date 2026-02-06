import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Search } from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useCartStore } from '../../features/cart/store/cartStore';
import { useLogout } from '../../features/auth/hooks/useAuth';
import Button from '../ui/Button';

export default function Header() {
  const { isAuthenticated, user } = useAuthStore();
  const { getItemCount } = useCartStore();
  const itemCount = getItemCount();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary-600">
            Fashion Shop
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher des produits..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link to="/shop" className="text-gray-700 hover:text-primary-600 font-medium">
              Boutique
            </Link>

            {isAuthenticated && (
              <Link to="/orders" className="text-gray-700 hover:text-primary-600 font-medium">
                Mes Commandes
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-primary-600" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
                  <User className="h-5 w-5" />
                  <span className="font-medium">{user?.username}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  isLoading={logoutMutation.isPending}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Inscription
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
