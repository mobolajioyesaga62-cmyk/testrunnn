import { useEffect, useState } from 'react';
import { ShoppingBag, TrendingUp, Package, Users, DollarSign, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Card from '../components/ui/Card';
import AdminLayout from '../components/admin/AdminLayout';
import ProductManagementCustom from '../components/admin/ProductManagementCustom';
import InventoryManagement from '../components/admin/InventoryManagement';
import DatabaseDiagnostic from '../components/admin/DatabaseDiagnostic';
import OrderManagement from '../components/admin/OrderManagement';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    lowStockItems: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersData, productsData, customersData, variantsData] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('products').select('*'),
        supabase.from('profiles').select('id'),
        supabase.from('product_variants').select('stock')
      ]);

      if (ordersData.data) {
        const revenue = ordersData.data.reduce((sum, order) => sum + order.total_amount, 0);
        const pending = ordersData.data.filter(order => order.status === 'pending').length;
        setStats(prev => ({ 
          ...prev, 
          totalOrders: ordersData.data.length, 
          totalRevenue: revenue,
          pendingOrders: pending
        }));
      }

      if (productsData.data) {
        setStats(prev => ({ ...prev, totalProducts: productsData.data.length }));
      }

      if (customersData.data) {
        setStats(prev => ({ ...prev, totalCustomers: customersData.data.length }));
      }

      if (variantsData.data) {
        const lowStock = variantsData.data.filter(variant => variant.stock < 10).length;
        setStats(prev => ({ ...prev, lowStockItems: lowStock }));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {loading ? (
        <div className="loading-professional">
          <div className="loading-spinner-professional"></div>
          <p className="ml-4">Loading admin dashboard...</p>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-heading text-primary mb-2">Dashboard Overview</h2>
                <p className="text-secondary">Monitor your store performance and manage operations</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                <div className="stat-card-professional">
                  <div className="flex items-center justify-between mb-4">
                    <div className="stat-icon-professional bg-blue-100 text-blue-600">
                      <ShoppingBag size={20} />
                    </div>
                    <span className="text-xs text-muted">+12%</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">{stats.totalOrders}</div>
                  <div className="text-sm text-muted">Total Orders</div>
                </div>

                <div className="stat-card-professional">
                  <div className="flex items-center justify-between mb-4">
                    <div className="stat-icon-professional bg-green-100 text-green-600">
                      <DollarSign size={20} />
                    </div>
                    <span className="text-xs text-muted">+8%</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">₦{stats.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-muted">Revenue</div>
                </div>

                <div className="stat-card-professional">
                  <div className="flex items-center justify-between mb-4">
                    <div className="stat-icon-professional bg-purple-100 text-purple-600">
                      <Package size={20} />
                    </div>
                    <span className="text-xs text-muted">+5%</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">{stats.totalProducts}</div>
                  <div className="text-sm text-muted">Products</div>
                </div>

                <div className="stat-card-professional">
                  <div className="flex items-center justify-between mb-4">
                    <div className="stat-icon-professional bg-amber-100 text-amber-600">
                      <Users size={20} />
                    </div>
                    <span className="text-xs text-muted">+15%</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">{stats.totalCustomers}</div>
                  <div className="text-sm text-muted">Customers</div>
                </div>

                <div className="stat-card-professional">
                  <div className="flex items-center justify-between mb-4">
                    <div className="stat-icon-professional bg-orange-100 text-orange-600">
                      <AlertCircle size={20} />
                    </div>
                    <span className="text-xs text-muted">Action</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">{stats.pendingOrders}</div>
                  <div className="text-sm text-muted">Pending</div>
                </div>

                <div className="stat-card-professional">
                  <div className="flex items-center justify-between mb-4">
                    <div className="stat-icon-professional bg-red-100 text-red-600">
                      <TrendingUp size={20} />
                    </div>
                    <span className="text-xs text-muted">Alert</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">{stats.lowStockItems}</div>
                  <div className="text-sm text-muted">Low Stock</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card-professional">
                  <div className="card-professional-header">
                    <h3 className="font-heading text-lg font-semibold text-primary">Recent Orders</h3>
                    <p className="text-sm text-muted">Latest customer orders</p>
                  </div>
                  <div className="card-professional-body">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <div className="font-medium text-primary">Order #1234</div>
                          <div className="text-sm text-muted">John Doe • 2 hours ago</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">₦25,000</div>
                          <span className="badge-professional badge-warning-professional">Pending</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <div className="font-medium text-primary">Order #1233</div>
                          <div className="text-sm text-muted">Jane Smith • 5 hours ago</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">₦55,000</div>
                          <span className="badge-professional badge-success-professional">Paid</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <div className="font-medium text-primary">Order #1232</div>
                          <div className="text-sm text-muted">Mike Johnson • 1 day ago</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">₦18,000</div>
                          <span className="badge-professional badge-info-professional">Shipped</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-professional">
                  <div className="card-professional-header">
                    <h3 className="font-heading text-lg font-semibold text-primary">Top Products</h3>
                    <p className="text-sm text-muted">Best performing items</p>
                  </div>
                  <div className="card-professional-body">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Package size={20} className="text-amber-600" />
                          </div>
                          <div>
                            <div className="font-medium text-primary">Elegant Ankara Dress</div>
                            <div className="text-sm text-muted">15 sold this week</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">₦25,000</div>
                          <div className="text-xs text-success">+23%</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-primary">Traditional Agbada</div>
                            <div className="text-sm text-muted">8 sold this week</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">₦55,000</div>
                          <div className="text-xs text-success">+15%</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Package size={20} className="text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium text-primary">Dashiki Shirt</div>
                            <div className="text-sm text-muted">12 sold this week</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">₦18,000</div>
                          <div className="text-xs text-success">+8%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="card-professional mt-8">
                <div className="card-professional-header">
                  <h3 className="font-heading text-lg font-semibold text-primary">Performance Metrics</h3>
                  <p className="text-sm text-muted">Key performance indicators</p>
                </div>
                <div className="card-professional-body">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">94.2%</div>
                      <div className="text-sm text-muted mb-2">Customer Satisfaction</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">2.4 days</div>
                      <div className="text-sm text-muted mb-2">Avg. Delivery Time</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">87%</div>
                      <div className="text-sm text-muted mb-2">Stock Accuracy</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && <ProductManagementCustom />}
          {activeTab === 'inventory' && <InventoryManagement />}
          {activeTab === 'database' && <DatabaseDiagnostic />}
          {activeTab === 'orders' && <OrderManagement />}
        </>
      )}
    </AdminLayout>
  );
}
