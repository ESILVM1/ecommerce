import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';

// Pages
import HomePage from '../pages/HomePage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ProfilePage from '../features/auth/pages/ProfilePage';
import SettingsPage from '../features/auth/pages/SettingsPage';
import ShopPage from '../features/shop/pages/ShopPage';
import ProductPage from '../features/shop/pages/ProductPage';
import CartPage from '../features/cart/pages/CartPage';
import CheckoutPage from '../features/orders/pages/CheckoutPage';
import OrdersPage from '../features/orders/pages/OrdersPage';
import OrderDetailPage from '../features/orders/pages/OrderDetailPage';
import PaymentPage from '../features/payments/pages/PaymentPage';
import PaymentSuccessPage from '../features/payments/pages/PaymentSuccessPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'shop',
        element: <ShopPage />,
      },
      {
        path: 'shop/:id',
        element: <ProductPage />,
      },
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'payment',
        element: (
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'payment/success',
        element: (
          <ProtectedRoute>
            <PaymentSuccessPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: (
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">404 - Page non trouvée</h1>
            <p className="text-gray-600 mb-8">La page que vous recherchez n'existe pas.</p>
            <a href="/" className="text-primary-600 hover:text-primary-700">
              Retour à l'accueil
            </a>
          </div>
        ),
      },
    ],
  },
]);
