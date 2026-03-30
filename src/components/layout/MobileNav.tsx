import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, User, Grid3x3 } from 'lucide-react';

export default function MobileNav() {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Grid3x3, label: 'Shop', path: '/shop' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist' },
    { icon: ShoppingBag, label: 'Cart', path: '/cart' },
    { icon: User, label: 'Account', path: '/account' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-amber-600' : 'text-gray-600'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
