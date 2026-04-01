import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';

interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category: string;
  images: string[];
  variants: ProductVariant[];
  created_at: string;
}

interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  color_hex: string;
  price: number;
  stock: number;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    category: '',
    image_url: '',
    sizes: '',
    colors: '',
    stock: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_variants (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        setError('Database tables may not exist. Please run the database setup first.');
        setProducts([]);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products. Check console for details.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        base_price: parseFloat(formData.base_price),
        category: formData.category,
        images: [formData.image_url],
        featured: false,
        is_new: false,
        is_best_seller: false
      };

      let productId: string;
      
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        productId = editingProduct.id;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();
        
        if (error) throw error;
        productId = data.id;
      }

      // Handle variants
      const sizes = formData.sizes.split(',').map(s => s.trim()).filter(s => s);
      const colors = formData.colors.split(',').map(c => c.trim()).filter(c => c);
      const stock = parseInt(formData.stock);

      const variants = [];
      for (const size of sizes) {
        for (const color of colors) {
          variants.push({
            product_id: productId,
            size,
            color,
            color_hex: '#' + Math.floor(Math.random()*16777215).toString(16),
            price: parseFloat(formData.base_price),
            stock
          });
        }
      }

      if (editingProduct) {
        await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', productId);
      }

      if (variants.length > 0) {
        await supabase
          .from('product_variants')
          .insert(variants);
      }

      setShowModal(false);
      resetForm();
      loadProducts();
      alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', productId);

      await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      loadProducts();
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      base_price: product.base_price.toString(),
      category: product.category,
      image_url: product.images[0] || '',
      sizes: product.variants.map(v => v.size).join(', '),
      colors: product.variants.map(v => v.color).join(', '),
      stock: product.variants[0]?.stock.toString() || '0'
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      base_price: '',
      category: '',
      image_url: '',
      sizes: '',
      colors: '',
      stock: ''
    });
    setEditingProduct(null);
  };

  const getTotalStock = (product: Product) => {
    return product.variants.reduce((total, variant) => total + variant.stock, 0);
  };

  const getLowStockProducts = () => {
    return products.filter(product => getTotalStock(product) < 10);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Add Product
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <div>
              <p className="font-semibold text-red-900">Database Error</p>
              <p className="text-red-700">{error}</p>
              <p className="text-red-600 text-sm mt-2">
                The database tables may not exist yet. Please run the seed script or set up your database first.
              </p>
            </div>
          </div>
        </Card>
      )}

      {!error && getLowStockProducts().length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-amber-600" size={20} />
            <div>
              <p className="font-semibold text-amber-900">Low Stock Alert</p>
              <p className="text-amber-700">{getLowStockProducts().length} products have less than 10 items in stock</p>
            </div>
          </div>
        </Card>
      )}

      {!error && products.length === 0 && !loading && (
        <Card>
          <div className="text-center py-8">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-4">No products found</p>
            <p className="text-gray-500 text-sm">Click "Add Product" to create your first product</p>
          </div>
        </Card>
      )}

      {!error && products.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.images[0] || 'https://via.placeholder.com/50'}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₦{product.base_price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        getTotalStock(product) === 0 
                          ? 'bg-red-100 text-red-800'
                          : getTotalStock(product) < 10
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {getTotalStock(product)} items
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.variants.length} variants
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editProduct(product)}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => deleteProduct(product.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
              placeholder="Enter product description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Base Price (₦)"
              type="number"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
              required
            />
            <Input
              label="Image URL"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Sizes (comma-separated)"
              value={formData.sizes}
              onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
              placeholder="S, M, L, XL"
              required
            />
            <Input
              label="Colors (comma-separated)"
              value={formData.colors}
              onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
              placeholder="Red, Blue, Black"
              required
            />
            <Input
              label="Stock per variant"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit">
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
