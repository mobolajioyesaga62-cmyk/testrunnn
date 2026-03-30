import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Package, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function OrderSuccessPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      loadOrder();
    }
  }, [orderNumber]);

  const loadOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('order_number', orderNumber)
        .maybeSingle();

      if (error) throw error;
      if (data) setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <Link to="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <CheckCircle2 size={64} className="mx-auto text-green-600 mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
        </div>

        <Card className="mb-8">
          <div className="flex items-center justify-between mb-6 pb-6 border-b">
            <div>
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-xl font-bold text-gray-900">{order.order_number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{order.total_amount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Package size={18} />
                Shipping Address
              </h3>
              <p className="text-sm text-gray-700">
                {order.shipping_address.full_name}<br />
                {order.shipping_address.address_line1}<br />
                {order.shipping_address.address_line2 && (
                  <>{order.shipping_address.address_line2}<br /></>
                )}
                {order.shipping_address.city}, {order.shipping_address.state}<br />
                {order.shipping_address.country}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Mail size={18} />
                Contact Information
              </h3>
              <p className="text-sm text-gray-700">
                {order.customer_email}<br />
                {order.customer_phone}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.order_items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-sm text-gray-600">
                      {item.variant_details.size} | {item.variant_details.color} | Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900">
                    ₦{item.total_price.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ You'll receive an order confirmation email shortly</li>
            <li>✓ We'll send you tracking information once your order ships</li>
            <li>✓ Expected delivery: 3-7 business days</li>
            <li>✓ You can track your order in your account dashboard</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/account/orders" className="flex-1">
            <Button fullWidth variant="outline">
              View Order History
            </Button>
          </Link>
          <Link to="/shop" className="flex-1">
            <Button fullWidth>
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
