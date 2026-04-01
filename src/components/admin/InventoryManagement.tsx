import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

interface ProductVariant {
  id: string;
  product_id: string;
  product: {
    name: string;
    category: string;
  };
  size: string;
  color: string;
  color_hex: string;
  price: number;
  stock: number;
}

export default function InventoryManagement() {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [tempStock, setTempStock] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select(`
          *,
          product:products(name, category)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVariants(data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (variantId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('product_variants')
        .update({ stock: newStock })
        .eq('id', variantId);

      if (error) throw error;

      setVariants(prev => 
        prev.map(variant => 
          variant.id === variantId 
            ? { ...variant, stock: newStock }
            : variant
        )
      );

      setEditingVariant(null);
      alert('Stock updated successfully!');
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'red', icon: AlertTriangle };
    if (stock < 5) return { label: 'Low Stock', color: 'amber', icon: AlertTriangle };
    if (stock < 20) return { label: 'Low Stock', color: 'amber', icon: TrendingDown };
    return { label: 'In Stock', color: 'green', icon: TrendingUp };
  };

  const getStats = () => {
    const totalProducts = new Set(variants.map(v => v.product_id)).size;
    const totalVariants = variants.length;
    const outOfStock = variants.filter(v => v.stock === 0).length;
    const lowStock = variants.filter(v => v.stock > 0 && v.stock < 10).length;
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

    return { totalProducts, totalVariants, outOfStock, lowStock, totalStock };
  };

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
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
        <Button onClick={loadInventory}>
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <Package className="text-blue-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
          <p className="text-sm text-gray-600">Total Products</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <Package className="text-purple-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalVariants}</p>
          <p className="text-sm text-gray-600">Total Variants</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-green-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalStock}</p>
          <p className="text-sm text-gray-600">Total Stock</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="text-amber-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
          <p className="text-sm text-gray-600">Low Stock</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="text-red-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.outOfStock}</p>
          <p className="text-sm text-gray-600">Out of Stock</p>
        </Card>
      </div>

      {/* Alerts */}
      {(stats.outOfStock > 0 || stats.lowStock > 0) && (
        <div className="space-y-3 mb-6">
          {stats.outOfStock > 0 && (
            <Card className="border-red-200 bg-red-50">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-600" size={20} />
                <div>
                  <p className="font-semibold text-red-900">Out of Stock Items</p>
                  <p className="text-red-700">{stats.outOfStock} variants are out of stock and need immediate attention</p>
                </div>
              </div>
            </Card>
          )}
          
          {stats.lowStock > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-amber-600" size={20} />
                <div>
                  <p className="font-semibold text-amber-900">Low Stock Warning</p>
                  <p className="text-amber-700">{stats.lowStock} variants have less than 10 items in stock</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Inventory Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {variants.map((variant) => {
                const status = getStockStatus(variant.stock);
                const StatusIcon = status.icon;
                
                return (
                  <tr key={variant.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{variant.product.name}</div>
                        <div className="text-sm text-gray-500">{variant.product.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: variant.color_hex }}
                        />
                        <span className="text-sm text-gray-900">{variant.color}</span>
                        <span className="text-sm text-gray-500">({variant.size})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₦{variant.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingVariant === variant.id ? (
                        <Input
                          type="number"
                          value={tempStock[variant.id] || variant.stock}
                          onChange={(e) => setTempStock({ ...tempStock, [variant.id]: e.target.value })}
                          className="w-20"
                          min="0"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{variant.stock}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full bg-${status.color}-100 text-${status.color}-800`}>
                        <StatusIcon size={12} className="inline mr-1" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingVariant === variant.id ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateStock(variant.id, parseInt(tempStock[variant.id] || variant.stock))}
                          >
                            <Save size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingVariant(null);
                              delete tempStock[variant.id];
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingVariant(variant.id)}
                        >
                          Edit Stock
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
