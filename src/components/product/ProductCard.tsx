import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import Card from '../ui/Card';

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  sale_price?: number;
  images: string[];
  is_new?: boolean;
  is_best_seller?: boolean;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useStore();
  const [imageLoaded, setImageLoaded] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const price = product.sale_price || product.base_price;
  const discount = product.sale_price
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
    : 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        product_id: product.id,
        product_name: product.name,
        price: product.base_price,
        sale_price: product.sale_price,
        image: product.images[0],
      });
    }
  };

  return (
    <Card padding="none" hover className="group overflow-hidden">
      <Link to={`/product/${product.slug}`}>
        <div className="relative overflow-hidden bg-gray-100 aspect-[3/4]">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <img
            src={product.images[0]}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {product.is_new && (
            <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              NEW
            </span>
          )}

          {product.is_best_seller && (
            <span className="absolute top-3 left-3 bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              BEST SELLER
            </span>
          )}

          {discount > 0 && (
            <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              -{discount}%
            </span>
          )}

          <button
            onClick={handleWishlistToggle}
            className={`absolute top-3 right-3 p-2 rounded-full bg-white shadow-md transition-all duration-200 hover:scale-110 ${
              discount > 0 ? 'top-14' : ''
            }`}
          >
            <Heart
              size={18}
              className={inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-700'}
            />
          </button>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="w-full bg-white text-gray-900 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
              <ShoppingCart size={18} />
              Quick Add
            </button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              ₦{price.toLocaleString()}
            </span>
            {product.sale_price && (
              <span className="text-sm text-gray-500 line-through">
                ₦{product.base_price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}
