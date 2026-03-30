import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Button from '../ui/Button';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, cartCount } = useStore();
  const itemCount = cartCount();

  const categories = [
    { name: 'Female Outfits', href: '/shop?category=female' },
    { name: 'Male Outfits', href: '/shop?category=male' },
    { name: 'Uniforms', href: '/shop?category=uniforms' },
    { name: 'Aprons', href: '/shop?category=aprons' },
    { name: 'Accessories', href: '/shop?category=accessories' },
    { name: 'Custom Sets', href: '/shop?category=custom' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="bg-gray-900 text-white py-2 text-center text-sm">
        <p>Free shipping on orders above ₦50,000 | Shop Now!</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link to="/" className="text-2xl font-bold tracking-tight">
              AFRIQUE STYLE
            </Link>

            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/shop" className="text-sm font-medium hover:text-amber-600 transition-colors">
                All Products
              </Link>
              <Link to="/new" className="text-sm font-medium hover:text-amber-600 transition-colors">
                New Arrivals
              </Link>
              <Link to="/bestsellers" className="text-sm font-medium hover:text-amber-600 transition-colors">
                Best Sellers
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="hover:text-amber-600 transition-colors"
            >
              <Search size={20} />
            </button>

            <Link to="/wishlist" className="hover:text-amber-600 transition-colors hidden sm:block">
              <Heart size={20} />
            </Link>

            <Link to="/cart" className="hover:text-amber-600 transition-colors relative">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <Link to="/account">
                <Button size="sm" variant="ghost">
                  <User size={18} />
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="sm">Login</Button>
              </Link>
            )}
          </div>
        </div>

        {searchOpen && (
          <div className="py-4 border-t">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      <div className="hidden lg:block bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center gap-8 h-12">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className="text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="flex flex-col py-4">
            <Link to="/shop" className="px-4 py-3 text-sm font-medium hover:bg-gray-50">
              All Products
            </Link>
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className="px-4 py-3 text-sm hover:bg-gray-50"
              >
                {category.name}
              </Link>
            ))}
            <Link to="/new" className="px-4 py-3 text-sm font-medium hover:bg-gray-50">
              New Arrivals
            </Link>
            <Link to="/bestsellers" className="px-4 py-3 text-sm font-medium hover:bg-gray-50">
              Best Sellers
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
