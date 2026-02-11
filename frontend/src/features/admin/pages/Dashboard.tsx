import React from 'react';
import { ShoppingBag, Users, DollarSign, Package, TrendingUp } from 'lucide-react';

// 1. Définition de l'interface pour corriger l'erreur de type
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType; // Utilisation de ElementType pour les icônes Lucide
  color: string;
}

// 2. Le composant StatCard avec son typage
const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
    {/* Logique de couleur dynamique pour Tailwind */}
    <div className={`p-4 rounded-xl ${color.replace('text-', 'bg-').replace('600', '100')} ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500">Bienvenue, voici l'état de votre boutique aujourd'hui.</p>
      </div>

      {/* Grille de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Revenu Total" 
          value="128,430 €" 
          icon={DollarSign} 
          color="text-emerald-600" 
        />
        <StatCard 
          label="Commandes" 
          value="1,420" 
          icon={ShoppingBag} 
          color="text-blue-600" 
        />
        <StatCard 
          label="Clients" 
          value="8,902" 
          icon={Users} 
          color="text-purple-600" 
        />
        <StatCard 
          label="Stock" 
          value="44,201" 
          icon={Package} 
          color="text-orange-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placeholder graphique */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-64 flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="mx-auto text-gray-300 mb-2" size={48} />
            <p className="text-gray-400 font-medium">Graphique des ventes</p>
            <p className="text-xs text-gray-300 underline cursor-pointer hover:text-indigo-400">
              Configurer les données
            </p>
          </div>
        </div>
        
        {/* Liste d'activités */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold mb-4 text-gray-900">Activités récentes</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Nouvelle commande #TR-90{i}</span>
                  <span className="text-xs text-gray-400">Il y a {i * 5} minutes</span>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  Payé
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}