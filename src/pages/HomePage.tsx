import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, TrendingUp, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/product/ProductCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const [featured, newItems, bestsellers] = await Promise.all([
        supabase.from('products').select('*').eq('featured', true).limit(4),
        supabase.from('products').select('*').eq('is_new', true).limit(8),
        supabase.from('products').select('*').eq('is_best_seller', true).limit(8),
      ]);

      if (featured.data) setFeaturedProducts(featured.data);
      if (newItems.data) setNewArrivals(newItems.data);
      if (bestsellers.data) setBestSellers(bestsellers.data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const testimonials = [
    {
      name: 'Aisha Mohammed',
      location: 'Lagos',
      rating: 5,
      text: 'Beautiful quality fabrics and excellent craftsmanship. The custom aso-ebi I ordered was perfect for my wedding!',
    },
    {
      name: 'Chioma Okafor',
      location: 'Abuja',
      rating: 5,
      text: 'Fast delivery and amazing customer service. The ankara dress fits perfectly and the colors are vibrant!',
    },
    {
      name: 'Ibrahim Yusuf',
      location: 'Port Harcourt',
      rating: 5,
      text: 'Great selection of traditional wear. Ordered matching outfits for my family and everyone loved them!',
    },
  ];

  return (
    <div className="pb-16 lg:pb-0">
      <section className="relative h-[600px] bg-gradient-to-br from-gray-900 via-gray-800 to-amber-900">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Authentic African Fashion
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Discover premium quality traditional and contemporary clothing made with love in Nigeria
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop">
                <Button size="lg" variant="secondary">
                  Shop Now
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <Link to="/new">
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-gray-900">
                  New Arrivals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-amber-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
              <p className="text-gray-600">Handpicked fabrics and expert craftsmanship in every piece</p>
            </Card>
            <Card className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Custom Tailoring</h3>
              <p className="text-gray-600">Made to measure services for the perfect fit</p>
            </Card>
            <Card className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick shipping across Nigeria with tracking</p>
            </Card>
          </div>
        </div>
      </section>

      {bestSellers.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Best Sellers</h2>
                <p className="text-gray-600">Most loved by our customers</p>
              </div>
              <Link to="/bestsellers">
                <Button variant="ghost">
                  View All
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {bestSellers.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">New Arrivals</h2>
                <p className="text-gray-600">Fresh styles just for you</p>
              </div>
              <Link to="/new">
                <Button variant="ghost">
                  View All
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-gradient-to-r from-amber-600 to-amber-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Limited Time Offer</h2>
          <p className="text-xl mb-8 text-amber-100">Get 20% off on all custom clothing sets this month!</p>
          <Link to="/shop?category=custom">
            <Button size="lg" className="bg-white text-amber-700 hover:bg-gray-100">
              Shop Custom Sets
              <ArrowRight size={20} />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              { name: 'Female Outfits', href: '/shop?category=female', img: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg' },
              { name: 'Male Outfits', href: '/shop?category=male', img: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg' },
              { name: 'Uniforms', href: '/shop?category=uniforms', img: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg' },
              { name: 'Aprons', href: '/shop?category=aprons', img: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg' },
              { name: 'Accessories', href: '/shop?category=accessories', img: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg' },
              { name: 'Custom Sets', href: '/shop?category=custom', img: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg' },
            ].map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className="group text-center"
              >
                <div className="w-full aspect-square rounded-full overflow-hidden mb-3 border-4 border-gray-100 group-hover:border-amber-400 transition-all duration-300">
                  <img
                    src={category.img}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <p className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
