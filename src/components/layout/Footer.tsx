import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);

      if (error) throw error;

      setMessage('Successfully subscribed!');
      setEmail('');
    } catch (error: any) {
      setMessage(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-4">AFRIQUE STYLE</h3>
            <p className="text-sm mb-4">
              Your premier destination for authentic African fashion. We bring you the finest collection of traditional and contemporary clothing.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-amber-600 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-amber-600 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-amber-600 transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop?category=female" className="hover:text-amber-600 transition-colors">Female Outfits</Link></li>
              <li><Link to="/shop?category=male" className="hover:text-amber-600 transition-colors">Male Outfits</Link></li>
              <li><Link to="/shop?category=uniforms" className="hover:text-amber-600 transition-colors">Uniforms</Link></li>
              <li><Link to="/shop?category=aprons" className="hover:text-amber-600 transition-colors">Aprons</Link></li>
              <li><Link to="/shop?category=accessories" className="hover:text-amber-600 transition-colors">Accessories</Link></li>
              <li><Link to="/new" className="hover:text-amber-600 transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-amber-600 transition-colors">Contact Us</Link></li>
              <li><Link to="/track-order" className="hover:text-amber-600 transition-colors">Track Order</Link></li>
              <li><Link to="/about" className="hover:text-amber-600 transition-colors">About Us</Link></li>
              <li><Link to="/shipping" className="hover:text-amber-600 transition-colors">Shipping Info</Link></li>
              <li><Link to="/returns" className="hover:text-amber-600 transition-colors">Returns</Link></li>
              <li><Link to="/faq" className="hover:text-amber-600 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Newsletter</h4>
            <p className="text-sm mb-4">Subscribe to get special offers and updates!</p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-amber-600 focus:border-transparent text-white"
                required
              />
              <Button type="submit" fullWidth variant="secondary" loading={loading}>
                Subscribe
              </Button>
              {message && (
                <p className={`text-sm ${message.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>+234 800 123 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>info@afriquestyle.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
            <p className="text-sm">© 2024 Afrique Style. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
