import { ReactNode, useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  LogOut,
  Menu,
  X,
  Settings,
  ChevronRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import Button from '../ui/Button';
import '../../styles/admin.css';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AdminLayout({ children, activeTab, onTabChange }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useStore();

  const handleLogout = async () => {
    const { supabase } = await import('../../lib/supabase');
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      description: 'Overview & Analytics'
    },
    { 
      id: 'products', 
      label: 'Products', 
      icon: Package,
      description: 'Manage Product Catalog'
    },
    { 
      id: 'inventory', 
      label: 'Inventory', 
      icon: ShoppingBag,
      description: 'Stock & Inventory Management'
    },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: Users,
      description: 'Order Processing & Tracking'
    },
    { 
      id: 'database', 
      label: 'Database', 
      icon: Settings,
      description: 'Database Diagnostics'
    },
  ];

  return (
    <div className="admin-dashboard">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn-primary-professional"
          size="sm"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar-professional fixed lg:static inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out lg:transform-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-full flex flex-col">
          {/* Brand */}
          <div className="sidebar-brand">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Afrique Style</h1>
                <p className="text-sm text-gray-300">Admin Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
                Main Menu
              </h3>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`nav-item-professional w-full flex items-center gap-3 px-4 py-3 text-left ${
                      activeTab === item.id ? 'active' : ''
                    }`}
                  >
                    <div className={`w-5 h-5 flex items-center justify-center ${
                      activeTab === item.id ? 'text-white' : 'text-gray-400'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        activeTab === item.id ? 'text-white' : 'text-gray-200'
                      }`}>
                        {item.label}
                      </div>
                      <div className={`text-xs ${
                        activeTab === item.id ? 'text-amber-200' : 'text-gray-400'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                    {activeTab === item.id && (
                      <ChevronRight size={16} className="text-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg mx-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-100 text-sm font-medium">Quick Stats</span>
                <DollarSign size={16} className="text-amber-200" />
              </div>
              <div className="text-2xl font-bold text-white">₦112,500</div>
              <div className="text-xs text-amber-200">Total Revenue</div>
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.email || 'Admin User'}
                </p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              className="w-full btn-secondary-professional"
              size="sm"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-heading text-primary">
                {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-secondary mt-1">
                {menuItems.find(item => item.id === activeTab)?.description}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-primary">Welcome back</p>
                <p className="text-xs text-muted">{new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="footer-professional">
          <div className="text-center">
            <p>&copy; 2024 Afrique Style. All rights reserved.</p>
            <p className="text-xs mt-1">Admin Dashboard v1.0</p>
          </div>
        </footer>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
