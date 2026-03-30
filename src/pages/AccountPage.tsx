import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, User as UserIcon, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, setUser } = useStore();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [ordersData, profileData] = await Promise.all([
        supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(),
      ]);

      if (ordersData.data) setOrders(ordersData.data);
      if (profileData.data) setProfile(profileData.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-8">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Account</h1>
              <p className="text-gray-600 mt-2">{user.email}</p>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut size={18} />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card padding="none">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-amber-50 text-amber-600 border-l-4 border-amber-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <Package size={20} />
                <span className="font-medium">Orders</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-amber-50 text-amber-600 border-l-4 border-amber-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <UserIcon size={20} />
                <span className="font-medium">Profile</span>
              </button>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded mb-4" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                          <div>
                            <p className="font-bold text-gray-900 text-lg mb-1">
                              {order.order_number}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 mt-3 sm:mt-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                              {order.status.toUpperCase()}
                            </span>
                            <p className="font-bold text-gray-900">
                              ₦{order.total_amount.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          {order.order_items.slice(0, 2).map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">
                                {item.product_name} × {item.quantity}
                              </span>
                              <span className="font-semibold text-gray-900">
                                ₦{item.total_price.toLocaleString()}
                              </span>
                            </div>
                          ))}
                          {order.order_items.length > 2 && (
                            <p className="text-sm text-gray-600">
                              +{order.order_items.length - 2} more items
                            </p>
                          )}
                        </div>

                        {order.tracking_number && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-900">
                              <span className="font-semibold">Tracking Number:</span> {order.tracking_number}
                            </p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-12">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-xl text-gray-600 mb-4">No orders yet</p>
                    <Button onClick={() => navigate('/shop')}>
                      Start Shopping
                    </Button>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
                <Card>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <p className="text-lg text-gray-900">{profile?.full_name || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <p className="text-lg text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <p className="text-lg text-gray-900">{profile?.phone || 'Not set'}</p>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        Member since {new Date(profile?.created_at || '').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
