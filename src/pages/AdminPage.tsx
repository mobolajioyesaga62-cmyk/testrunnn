import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, Users, TrendingUp, Plus, CreditCard as Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

export default function AdminPage() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !data?.is_admin) {
        navigate('/');
        return;
      }

      setIsAdmin(true);
      loadDashboardData();
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/');
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersData, productsData, customersData] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('products').select('*'),
        supabase.from('profiles').select('id'),
      ]);

      if (ordersData.data) {
        setOrders(ordersData.data);
        const revenue = ordersData.data.reduce((sum, order) => sum + order.total_amount, 0);
        setStats(prev => ({ ...prev, totalOrders: ordersData.data.length, totalRevenue: revenue }));
      }

      if (productsData.data) {
        setProducts(productsData.data);
        setStats(prev => ({ ...prev, totalProducts: productsData.data.length }));
      }

      if (customersData.data) {
        setStats(prev => ({ ...prev, totalCustomers: customersData.data.length }));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      loadDashboardData();
      alert('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      loadDashboardData();
      alert('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-8">
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-300 mt-2">Manage your store</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'products'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Products
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="text-blue-600" size={24} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.totalOrders}
                </p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-green-600" size={24} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  ₦{stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="text-purple-600" size={24} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.totalProducts}
                </p>
                <p className="text-sm text-gray-600">Total Products</p>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Users className="text-amber-600" size={24} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.totalCustomers}
                </p>
                <p className="text-sm text-gray-600">Total Customers</p>
              </Card>
            </div>

            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Order Number
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.slice(0, 10).map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {order.order_number}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {order.customer_email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                          ₦{order.total_amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Manage Orders</h2>
            </div>
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg mb-2">
                        {order.order_number}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-gray-600">
                          <span className="font-semibold">Customer:</span> {order.customer_email}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-semibold">Phone:</span> {order.customer_phone}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-semibold">Amount:</span> ₦{order.total_amount.toLocaleString()}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-semibold">Date:</span> {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Manage Products</h2>
              <Button onClick={() => setShowProductModal(true)}>
                <Plus size={18} />
                Add Product
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} padding="none">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full aspect-square object-cover rounded-t-xl"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <p className="text-lg font-bold text-gray-900 mb-4">
                      ₦{product.base_price.toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        fullWidth
                        onClick={() => {
                          setEditingProduct(product);
                          setShowProductModal(true);
                        }}
                      >
                        <Edit2 size={16} />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <p className="text-gray-600 mb-4">
          Product management interface would go here. For a full implementation, this would include
          forms for adding/editing products with image uploads, variants, and inventory management.
        </p>
        <Button onClick={() => {
          setShowProductModal(false);
          setEditingProduct(null);
        }}>
          Close
        </Button>
      </Modal>
    </div>
  );
}
