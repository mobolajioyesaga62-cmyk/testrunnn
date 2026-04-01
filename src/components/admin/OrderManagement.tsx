import { useState, useEffect } from 'react';
import { Package, User, Phone, Mail, Calendar, DollarSign, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  customer_phone: string;
  customer_name: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: any;
  payment_method: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

interface OrderItem {
  id: string;
  product_name: string;
  variant_id: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: status as Order['status'] }
            : order
        )
      );

      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { color: 'amber', icon: Clock, label: 'Pending' },
      paid: { color: 'blue', icon: DollarSign, label: 'Paid' },
      processing: { color: 'purple', icon: Package, label: 'Processing' },
      shipped: { color: 'indigo', icon: Truck, label: 'Shipped' },
      delivered: { color: 'green', icon: CheckCircle, label: 'Delivered' },
      cancelled: { color: 'red', icon: XCircle, label: 'Cancelled' }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const paid = orders.filter(o => o.status === 'paid').length;
    const processing = orders.filter(o => o.status === 'processing').length;
    const shipped = orders.filter(o => o.status === 'shipped').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const revenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total_amount, 0);

    return { total, pending, paid, processing, shipped, delivered, cancelled, revenue };
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
        <Button onClick={loadOrders}>
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <Card>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Orders</p>
        </Card>

        <Card>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-sm text-gray-600">Pending</p>
        </Card>

        <Card>
          <p className="text-2xl font-bold text-blue-600">{stats.paid}</p>
          <p className="text-sm text-gray-600">Paid</p>
        </Card>

        <Card>
          <p className="text-2xl font-bold text-purple-600">{stats.processing}</p>
          <p className="text-sm text-gray-600">Processing</p>
        </Card>

        <Card>
          <p className="text-2xl font-bold text-indigo-600">{stats.shipped}</p>
          <p className="text-sm text-gray-600">Shipped</p>
        </Card>

        <Card>
          <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
          <p className="text-sm text-gray-600">Delivered</p>
        </Card>

        <Card>
          <p className="text-2xl font-bold text-green-600">₦{stats.revenue.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </Card>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={filter === status ? 'default' : 'outline'}
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status === 'all' ? 'All Orders' : status}
            </Button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          const StatusIcon = statusConfig.icon;
          const isExpanded = expandedOrder === order.id;

          return (
            <Card key={order.id} className="overflow-hidden">
              <div className="p-6">
                {/* Order Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{order.order_number}</h3>
                      <span className={`px-2 py-1 text-xs font-bold rounded-full bg-${statusConfig.color}-100 text-${statusConfig.color}-800`}>
                        <StatusIcon size={12} className="inline mr-1" />
                        {statusConfig.label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span className="text-gray-600">
                          {order.customer_name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span className="text-gray-600">{order.customer_email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-gray-600">{order.customer_phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">₦{order.total_amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    {isExpanded ? 'Hide Details' : 'Show Details'}
                  </Button>
                </div>

                {/* Expanded Order Details */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Shipping Address */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Shipping Address</h4>
                        {order.shipping_address ? (
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>{order.shipping_address.address_line1}</p>
                            {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                            <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                            <p>{order.shipping_address.postal_code}</p>
                            <p>{order.shipping_address.country}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No shipping address provided</p>
                        )}
                      </div>

                      {/* Payment Info */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Payment Information</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><span className="font-medium">Method:</span> {order.payment_method}</p>
                          <p><span className="font-medium">Total:</span> ₦{order.total_amount.toLocaleString()}</p>
                          <p><span className="font-medium">Order Date:</span> {new Date(order.created_at).toLocaleDateString()}</p>
                          <p><span className="font-medium">Last Updated:</span> {new Date(order.updated_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variant</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {order.order_items.map((item) => (
                              <tr key={item.id}>
                                <td className="px-4 py-2 text-sm text-gray-900">{item.product_name}</td>
                                <td className="px-4 py-2 text-sm text-gray-600">{item.color} ({item.size})</td>
                                <td className="px-4 py-2 text-sm text-gray-900">₦{item.price.toLocaleString()}</td>
                                <td className="px-4 py-2 text-sm text-gray-600">{item.quantity}</td>
                                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                  ₦{(item.price * item.quantity).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        {filteredOrders.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No orders found</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
