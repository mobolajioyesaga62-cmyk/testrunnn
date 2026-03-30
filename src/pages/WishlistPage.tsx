import { Link } from 'react-router-dom';
import { Heart, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Heart size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Save items you love for later</p>
            <Link to="/shop">
              <Button size="lg">Start Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-8">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-2">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {wishlist.map((item) => {
            const price = item.sale_price || item.price;
            const discount = item.sale_price
              ? Math.round(((item.price - item.sale_price) / item.price) * 100)
              : 0;

            return (
              <Card key={item.product_id} padding="none" hover className="group relative">
                <button
                  onClick={() => removeFromWishlist(item.product_id)}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white shadow-md hover:bg-red-50 transition-colors"
                >
                  <X size={18} className="text-red-600" />
                </button>

                <Link to={`/product/${item.product_id}`}>
                  <div className="relative overflow-hidden bg-gray-100 aspect-[3/4]">
                    <img
                      src={item.image}
                      alt={item.product_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        -{discount}%
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors">
                      {item.product_name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        ₦{price.toLocaleString()}
                      </span>
                      {item.sale_price && (
                        <span className="text-sm text-gray-500 line-through">
                          ₦{item.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
