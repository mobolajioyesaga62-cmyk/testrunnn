import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Truck, Shield, RefreshCcw, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ProductCard from '../components/product/ProductCard';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, user } = useStore();

  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  useEffect(() => {
    if (selectedSize && selectedColor && variants.length > 0) {
      const variant = variants.find(
        v => v.size === selectedSize && v.color === selectedColor
      );
      setSelectedVariant(variant);
    }
  }, [selectedSize, selectedColor, variants]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('slug', slug)
        .maybeSingle();

      if (productError) throw productError;
      if (!productData) return;

      setProduct(productData);

      const { data: variantsData } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productData.id);

      if (variantsData) setVariants(variantsData);

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*, profiles(full_name)')
        .eq('product_id', productData.id)
        .order('created_at', { ascending: false });

      if (reviewsData) setReviews(reviewsData);

      if (productData.category_id) {
        const { data: related } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', productData.category_id)
          .neq('id', productData.id)
          .limit(4);

        if (related) setRelatedProducts(related);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert('Please select size and color');
      return;
    }

    addToCart({
      id: selectedVariant.id,
      product_id: product.id,
      variant_id: selectedVariant.id,
      product_name: product.name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      color_hex: selectedVariant.color_hex,
      price: product.sale_price || product.base_price,
      quantity: quantity,
      image: product.images[0],
      stock: selectedVariant.stock_quantity,
    });

    alert('Added to cart!');
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 animate-pulse rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 animate-pulse rounded" />
              <div className="h-6 bg-gray-200 animate-pulse rounded w-2/3" />
              <div className="h-32 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <Link to="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const price = product.sale_price || product.base_price;
  const discount = product.sale_price
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
    : 0;

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ChevronLeft size={20} />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="bg-white rounded-xl overflow-hidden mb-4">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? 'border-gray-900' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < averageRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ₦{price.toLocaleString()}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-2xl text-gray-500 line-through">
                      ₦{product.base_price.toLocaleString()}
                    </span>
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                      -{discount}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.available_sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                      selectedSize === size
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Select Color</h3>
              <div className="flex flex-wrap gap-3">
                {product.available_colors.map((colorObj: any) => (
                  <button
                    key={colorObj.name}
                    onClick={() => setSelectedColor(colorObj.name)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      selectedColor === colorObj.name
                        ? 'border-gray-900'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: colorObj.hex }}
                    />
                    <span className="font-medium">{colorObj.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedVariant && (
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Stock: <span className="font-semibold">{selectedVariant.stock_quantity} available</span>
                </p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-gray-400 font-bold"
                >
                  -
                </button>
                <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-gray-400 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <Button
                onClick={handleAddToCart}
                size="lg"
                fullWidth
                disabled={!selectedVariant}
              >
                <ShoppingCart size={20} />
                Add to Cart
              </Button>
              <Button
                onClick={handleWishlistToggle}
                variant={isInWishlist(product.id) ? 'secondary' : 'outline'}
                size="lg"
              >
                <Heart
                  size={20}
                  className={isInWishlist(product.id) ? 'fill-current' : ''}
                />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center">
                <Truck className="mx-auto mb-2 text-gray-600" size={24} />
                <p className="text-xs text-gray-600">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="mx-auto mb-2 text-gray-600" size={24} />
                <p className="text-xs text-gray-600">Secure Payment</p>
              </div>
              <div className="text-center">
                <RefreshCcw className="mx-auto mb-2 text-gray-600" size={24} />
                <p className="text-xs text-gray-600">Easy Returns</p>
              </div>
            </div>

            <Card>
              <h3 className="font-bold text-gray-900 mb-3">Product Details</h3>
              <p className="text-gray-700 mb-4">{product.description}</p>
              {product.material && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Material:</span> {product.material}
                </p>
              )}
              {product.care_instructions && (
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Care:</span> {product.care_instructions}
                </p>
              )}
            </Card>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review: any) => (
                <Card key={review.id}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {review.profiles?.full_name || 'Anonymous'}
                      </p>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.title && (
                    <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                  )}
                  <p className="text-gray-700">{review.comment}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
