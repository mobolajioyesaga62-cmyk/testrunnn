import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, cart, clearCart, cartTotal } = useStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [shippingInfo, setShippingInfo] = useState({
    full_name: '',
    phone: '',
    email: user?.email || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: 'Nigeria',
  });

  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
    'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
  ];

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const subtotal = cartTotal();
  const shipping = subtotal > 50000 ? 0 : 2500;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal + shipping - discountAmount;

  const applyCoupon = async () => {
    if (!couponCode) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('active', true)
        .maybeSingle();

      if (error || !data) {
        alert('Invalid coupon code');
        return;
      }

      if (data.valid_until && new Date(data.valid_until) < new Date()) {
        alert('Coupon has expired');
        return;
      }

      if (data.max_uses && data.used_count >= data.max_uses) {
        alert('Coupon has reached maximum uses');
        return;
      }

      if (data.min_purchase && subtotal < data.min_purchase) {
        alert(`Minimum purchase of ₦${data.min_purchase.toLocaleString()} required`);
        return;
      }

      if (data.discount_type === 'percentage') {
        setDiscount(data.discount_value);
      } else {
        setDiscount((data.discount_value / subtotal) * 100);
      }

      setCouponApplied(true);
      alert('Coupon applied successfully!');
    } catch (error) {
      console.error('Error applying coupon:', error);
      alert('Failed to apply coupon');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    if (!user) {
      navigate('/login');
      return false;
    }

    try {
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            order_number: orderNumber,
            user_id: user.id,
            status: 'pending',
            payment_status: 'pending',
            payment_method: paymentMethod,
            subtotal: subtotal,
            discount_amount: discountAmount,
            shipping_fee: shipping,
            total_amount: total,
            coupon_code: couponApplied ? couponCode : null,
            shipping_address: shippingInfo,
            customer_email: shippingInfo.email,
            customer_phone: shippingInfo.phone,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map((item) => ({
        order_id: orderData.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.product_name,
        variant_details: {
          size: item.size,
          color: item.color,
          color_hex: item.color_hex,
        },
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      for (const item of cart) {
        const { data: variant } = await supabase
          .from('product_variants')
          .select('stock_quantity')
          .eq('id', item.variant_id)
          .single();

        if (variant) {
          await supabase
            .from('product_variants')
            .update({ stock_quantity: variant.stock_quantity - item.quantity })
            .eq('id', item.variant_id);
        }
      }

      return orderData;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const handlePaystackPayment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const orderData = await createOrder();

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/initialize_payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            order_id: orderData.id,
            amount: total,
            email: shippingInfo.email,
            phone: shippingInfo.phone,
            customer_name: shippingInfo.full_name,
            order_number: orderData.order_number,
          }),
        }
      );

      const paymentData = await response.json();

      if (!response.ok || !paymentData.authorization_url) {
        throw new Error(paymentData.error || 'Failed to initialize payment');
      }

      window.location.href = paymentData.authorization_url;
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'paystack') {
      await handlePaystackPayment();
    } else if (paymentMethod === 'bank_transfer') {
      setLoading(true);
      try {
        const orderData = await createOrder();
        clearCart();
        navigate(`/order-success/${orderData.order_number}`);
      } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place order. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      alert('Payment method not yet configured');
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-8">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Checkout</h1>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-amber-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-amber-600 text-white' : 'bg-gray-200'}`}>
                {step > 1 ? <Check size={16} /> : '1'}
              </div>
              <span className="font-medium hidden sm:inline">Shipping</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-300" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-amber-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-amber-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="font-medium hidden sm:inline">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="text-amber-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
                </div>

                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      value={shippingInfo.full_name}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, full_name: e.target.value })}
                      required
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      required
                    />
                  </div>

                  <Input
                    label="Email Address"
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                    required
                  />

                  <Input
                    label="Address Line 1"
                    value={shippingInfo.address_line1}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address_line1: e.target.value })}
                    required
                  />

                  <Input
                    label="Address Line 2 (Optional)"
                    value={shippingInfo.address_line2}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address_line2: e.target.value })}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="City"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        State
                      </label>
                      <select
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        required
                      >
                        <option value="">Select State</option>
                        {nigerianStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    size="lg"
                    fullWidth
                    disabled={!shippingInfo.full_name || !shippingInfo.phone || !shippingInfo.address_line1 || !shippingInfo.city || !shippingInfo.state}
                  >
                    Continue to Payment
                  </Button>
                </form>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="text-amber-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                </div>

                <div className="space-y-4 mb-6">
                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-amber-600 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="paystack"
                      checked={paymentMethod === 'paystack'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-amber-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Paystack</p>
                      <p className="text-sm text-gray-600">Pay with card, bank transfer, or USSD</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-amber-600 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="flutterwave"
                      checked={paymentMethod === 'flutterwave'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-amber-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Flutterwave</p>
                      <p className="text-sm text-gray-600">Secure payment with Flutterwave</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-amber-600 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-amber-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Bank Transfer</p>
                      <p className="text-sm text-gray-600">Transfer directly to our account</p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => setStep(1)} variant="outline" fullWidth>
                    Back
                  </Button>
                  <Button onClick={handlePlaceOrder} size="lg" fullWidth loading={loading}>
                    Place Order
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.variant_id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.product_name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {item.size} | {item.color} | Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={couponApplied}
                  />
                  <Button
                    onClick={applyCoupon}
                    variant="secondary"
                    disabled={couponApplied || !couponCode}
                    loading={loading}
                  >
                    Apply
                  </Button>
                </div>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">₦{subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}%)</span>
                    <span className="font-semibold">-₦{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? 'Free' : `₦${shipping.toLocaleString()}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <p>✓ Secure checkout</p>
                <p>✓ Free returns within 7 days</p>
                <p>✓ Fast delivery across Nigeria</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
