import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/useStore';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, cartTotal } = useStore();

  const subtotal = cartTotal();
  const shipping = subtotal > 50000 ? 0 : 2500;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
            <Link to="/shop">
              <Button size="lg">Continue Shopping</Button>
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.variant_id} padding="md">
                <div className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.product_name}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {item.product_name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Size: {item.size} | Color: {item.color}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          ₦{item.price.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.variant_id)}
                        className="text-red-600 hover:text-red-700 transition-colors h-fit"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateCartQuantity(item.variant_id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.variant_id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <span className="text-sm text-gray-600">
                        {item.stock} in stock
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? 'Free' : `₦${shipping.toLocaleString()}`}
                  </span>
                </div>
                {subtotal < 50000 && (
                  <p className="text-sm text-amber-600">
                    Add ₦{(50000 - subtotal).toLocaleString()} more for free shipping!
                  </p>
                )}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>₦{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Link to="/checkout">
                <Button size="lg" fullWidth>
                  Proceed to Checkout
                </Button>
              </Link>

              <Link to="/shop">
                <Button size="md" fullWidth variant="ghost" className="mt-4">
                  Continue Shopping
                </Button>
              </Link>

              <div className="mt-6 pt-6 border-t text-sm text-gray-600">
                <p className="font-semibold mb-2">We Accept:</p>
                <div className="flex gap-2">
                  <div className="px-3 py-2 border rounded bg-white text-xs font-semibold">Paystack</div>
                  <div className="px-3 py-2 border rounded bg-white text-xs font-semibold">Flutterwave</div>
                  <div className="px-3 py-2 border rounded bg-white text-xs font-semibold">Bank Transfer</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
