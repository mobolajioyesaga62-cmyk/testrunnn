import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, AlertCircle, Search, Filter, Tag, TrendingUp, Archive, Percent, MoreHorizontal, ChevronDown, Copy, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import ImageUpload from './ImageUpload';
import Input from '../ui/Input';

// Enhanced interfaces for advanced features
interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  price: number;
  safety_threshold: number;
}

interface SEOData {
  meta_title: string;
  meta_description: string;
  keywords: string[];
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  category_id?: string;
  base_price?: number;
  sale_price?: number;
  sku?: string;
  images?: string[];
  available_sizes?: string[];
  available_colors?: Array<{ name: string; hex: string }>;
  care_instructions?: string;
  material?: string;
  featured?: boolean;
  is_new?: boolean;
  is_best_seller?: boolean;
  seo_data?: SEOData;
  collections?: string[];
  fabric_type?: string;
  occasion?: string;
  gender_age?: string;
  customization_status?: string;
  variants?: ProductVariant[];
  created_at?: string;
  updated_at?: string;
  category?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  parent_id?: string;
}

// Global variant system
interface GlobalVariant {
  id: string;
  name: string;
  type: 'size' | 'color';
  hex?: string; // For colors
  created_at: string;
}

// Constants for dropdowns (updated without fabric types)
const OCCASIONS = ['Casual', 'Wedding', 'Corporate', 'Religious', 'Party', 'Everyday', 'Festival'];
const GENDER_AGE = ['Men', 'Women', 'Kids', 'Unisex', 'Unisex Men', 'Unisex Women'];
const CUSTOMIZATION_STATUS = ['Ready-to-Wear', 'Bespoke/Custom', 'Made-to-Order', 'Pre-Order'];
const COLLECTIONS = ['Summer Drop', 'Gala Collection', 'Lagos Streetwear', 'Heritage Series', 'Modern Classic', 'Festival Special'];

// Default global variants
const DEFAULT_GLOBAL_VARIANTS: GlobalVariant[] = [
  // Sizes
  { id: 'size-xs', name: 'XS', type: 'size', created_at: new Date().toISOString() },
  { id: 'size-s', name: 'S', type: 'size', created_at: new Date().toISOString() },
  { id: 'size-m', name: 'M', type: 'size', created_at: new Date().toISOString() },
  { id: 'size-l', name: 'L', type: 'size', created_at: new Date().toISOString() },
  { id: 'size-xl', name: 'XL', type: 'size', created_at: new Date().toISOString() },
  { id: 'size-xxl', name: 'XXL', type: 'size', created_at: new Date().toISOString() },
  { id: 'size-3xl', name: '3XL', type: 'size', created_at: new Date().toISOString() },
  { id: 'size-4xl', name: '4XL', type: 'size', created_at: new Date().toISOString() },
  
  // Colors
  { id: 'color-black', name: 'Black', type: 'color', hex: '#000000', created_at: new Date().toISOString() },
  { id: 'color-white', name: 'White', type: 'color', hex: '#FFFFFF', created_at: new Date().toISOString() },
  { id: 'color-navy', name: 'Navy', type: 'color', hex: '#1e3a8a', created_at: new Date().toISOString() },
  { id: 'color-burgundy', name: 'Burgundy', type: 'color', hex: '#800020', created_at: new Date().toISOString() },
  { id: 'color-forest', name: 'Forest Green', type: 'color', hex: '#228b22', created_at: new Date().toISOString() },
  { id: 'color-royal', name: 'Royal Blue', type: 'color', hex: '#4169e1', created_at: new Date().toISOString() },
  { id: 'color-gold', name: 'Gold', type: 'color', hex: '#ffd700', created_at: new Date().toISOString() },
  { id: 'color-silver', name: 'Silver', type: 'color', hex: '#c0c0c0', created_at: new Date().toISOString() },
  { id: 'color-purple', name: 'Purple', type: 'color', hex: '#800080', created_at: new Date().toISOString() },
  { id: 'color-red', name: 'Red', type: 'color', hex: '#dc143c', created_at: new Date().toISOString() }
];

export default function ProductManagementCustom() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [globalVariants, setGlobalVariants] = useState<GlobalVariant[]>(DEFAULT_GLOBAL_VARIANTS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('all'); // all, categories, discounts, inventory
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    sale_price: '',
    sku: '',
    category_id: '',
    images: [] as string[],
    // Updated to use arrays instead of comma-separated strings
    selectedSizes: [] as string[],
    selectedColors: [] as string[],
    care_instructions: '',
    material: '',
    featured: false,
    is_new: false,
    is_best_seller: false,
    // Advanced fields
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    collections: [] as string[],
    occasion: '',
    gender_age: '',
    customization_status: '',
    safety_threshold: 5
  });

  const [variantData, setVariantData] = useState({
    size: '',
    color: '',
    stock: '',
    price: '',
    safety_threshold: 5
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }
      if (selectedCollection) {
        query = query.contains('collections', [selectedCollection]);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const generateSKU = (productName: string, fabric: string, color: string, size: string) => {
    const brandCode = 'AFQ';
    const productCode = productName.substring(0, 3).toUpperCase();
    const fabricCode = fabric.substring(0, 3).toUpperCase();
    const colorCode = color.substring(0, 3).toUpperCase();
    const sizeCode = size.toUpperCase();
    const randomCode = Math.random().toString(36).substring(2, 5).toUpperCase();
    
    return `${brandCode}-${productCode}-${fabricCode}-${colorCode}-${sizeCode}-${randomCode}`;
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert selected size/color IDs to names
      const selectedSizeNames = globalVariants
        .filter(v => v.type === 'size' && formData.selectedSizes.includes(v.id))
        .map(v => v.name);
      
      const selectedColorNames = globalVariants
        .filter(v => v.type === 'color' && formData.selectedColors.includes(v.id))
        .map(v => v.name);

      const productData = {
        name: formData.name,
        description: formData.description,
        base_price: parseFloat(formData.base_price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        sku: formData.sku || generateSKU(formData.name, 'ANKARA', selectedColorNames[0] || 'BLK', 'M'),
        category_id: formData.category_id,
        images: formData.images,
        featured: formData.featured,
        is_new: formData.is_new,
        is_best_seller: formData.is_best_seller,
        available_sizes: selectedSizeNames,
        available_colors: selectedColorNames.map(c => ({ 
          name: c, 
          hex: globalVariants.find(v => v.type === 'color' && v.name === c)?.hex || '#' + Math.floor(Math.random()*16777215).toString(16)
        })),
        care_instructions: formData.care_instructions,
        material: formData.material,
        slug: generateSlug(formData.name),
        updated_at: new Date().toISOString(),
        // Advanced fields
        seo_data: {
          meta_title: formData.meta_title || formData.name,
          meta_description: formData.meta_description || formData.description,
          keywords: formData.meta_keywords.split(',').map(k => k.trim()).filter(k => k),
          slug: generateSlug(formData.name)
        },
        collections: formData.collections,
        occasion: formData.occasion,
        gender_age: formData.gender_age,
        customization_status: formData.customization_status,
        safety_threshold: formData.safety_threshold
      };

      let result;
      if (editingProduct) {
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
      } else {
        result = await supabase
          .from('products')
          .insert({ ...productData, created_at: new Date().toISOString() });
      }

      if (result.error) throw result.error;

      setShowModal(false);
      resetForm();
      loadProducts();
      alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) {
      alert('Please select products first');
      return;
    }

    try {
      let updateData: any = {};
      
      switch (action) {
        case 'discount':
          const discountPercent = prompt('Enter discount percentage (e.g., 10 for 10%):');
          if (discountPercent) {
            updateData.sale_price = null; // Will be calculated as percentage off
            updateData.discount_percentage = parseFloat(discountPercent);
          }
          break;
        case 'archive':
          updateData.archived = true;
          break;
        case 'feature':
          updateData.featured = true;
          break;
        case 'unfeature':
          updateData.featured = false;
          break;
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('products')
          .update(updateData)
          .in('id', selectedProducts);

        if (error) throw error;
        
        loadProducts();
        setSelectedProducts([]);
        setShowBulkActions(false);
        alert(`Bulk ${action} completed successfully!`);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action');
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const editProduct = (product: Product) => {
    console.log('Editing product:', product); // Debug log
    setEditingProduct(product);
    
    // Convert existing sizes/colors back to checkbox IDs
    const selectedSizeIds = (product.available_sizes || [])
      .map(size => globalVariants.find(v => v.type === 'size' && v.name === size)?.id)
      .filter(Boolean) as string[];
    
    const selectedColorIds = (product.available_colors || [])
      .map(color => globalVariants.find(v => v.type === 'color' && v.name === color.name)?.id)
      .filter(Boolean) as string[];
    
    setFormData({
      name: product.name || '',
      description: product.description || '',
      base_price: product.base_price?.toString() || '',
      sale_price: product.sale_price?.toString() || '',
      sku: product.sku || '',
      category_id: product.category_id || '',
      images: product.images || [],
      // Updated to use arrays instead of comma-separated strings
      selectedSizes: selectedSizeIds,
      selectedColors: selectedColorIds,
      care_instructions: product.care_instructions || '',
      material: product.material || '',
      featured: product.featured || false,
      is_new: product.is_new || false,
      is_best_seller: product.is_best_seller || false,
      // Advanced fields with fallbacks
      meta_title: product.seo_data?.meta_title || '',
      meta_description: product.seo_data?.meta_description || '',
      meta_keywords: (product.seo_data?.keywords || []).join(', ') || '',
      collections: product.collections || [],
      occasion: product.occasion || '',
      gender_age: product.gender_age || '',
      customization_status: product.customization_status || '',
      safety_threshold: 5 // Default value
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      base_price: '',
      sale_price: '',
      sku: '',
      category_id: '',
      images: [],
      // Updated to use arrays instead of comma-separated strings
      selectedSizes: [],
      selectedColors: [],
      care_instructions: '',
      material: '',
      featured: false,
      is_new: false,
      is_best_seller: false,
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      collections: [],
      occasion: '',
      gender_age: '',
      customization_status: '',
      safety_threshold: 5
    });
    setEditingProduct(null);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      
      loadProducts();
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!selectedCategory || product.category_id === selectedCategory) &&
    (!selectedCollection || product.collections?.includes(selectedCollection))
  );

  const lowStockProducts = products.filter(product => 
    product.variants?.some(variant => variant.stock <= variant.safety_threshold)
  );

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <span className="ml-3">Loading products...</span>
      </div>
    );
  }

  if (activeTab !== 'all') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-heading text-primary">
            {activeTab === 'categories' ? 'Categories & Tags' : 
             activeTab === 'discounts' ? 'Discounts & Coupons' : 
             activeTab === 'inventory' ? 'Inventory Management' : ''}
          </h2>
          <button
            onClick={() => setActiveTab('all')}
            className="btn-secondary-professional"
          >
            Back to Products
          </button>
        </div>
        
        <Card className="card-professional">
          <div className="card-professional-body">
            <p className="text-muted text-center py-8">
              {activeTab === 'categories' && 'Category management coming soon...'}
              {activeTab === 'discounts' && 'Discount management coming soon...'}
              {activeTab === 'inventory' && 'Advanced inventory management coming soon...'}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-heading text-primary mb-2">Product Catalog</h2>
          <p className="text-secondary">Manage your African fashion inventory with advanced controls</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowModal(true)}
            className="btn-primary-professional"
          >
            <Plus size={20} className="mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stat-card-professional">
          <div className="flex items-center justify-between mb-4">
            <div className="stat-icon-professional bg-blue-100 text-blue-600">
              <Package size={20} />
            </div>
            <span className="text-xs text-muted">Total</span>
          </div>
          <div className="text-2xl font-bold text-primary">{products.length}</div>
          <div className="text-sm text-muted">Products</div>
        </div>

        <div className="stat-card-professional">
          <div className="flex items-center justify-between mb-4">
            <div className="stat-icon-professional bg-amber-100 text-amber-600">
              <AlertCircle size={20} />
            </div>
            <span className="text-xs text-muted">Alert</span>
          </div>
          <div className="text-2xl font-bold text-primary">{lowStockProducts.length}</div>
          <div className="text-sm text-muted">Low Stock</div>
        </div>

        <div className="stat-card-professional">
          <div className="flex items-center justify-between mb-4">
            <div className="stat-icon-professional bg-green-100 text-green-600">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs text-muted">Active</span>
          </div>
          <div className="text-2xl font-bold text-primary">{products.filter(p => p.featured).length}</div>
          <div className="text-sm text-muted">Featured</div>
        </div>

        <div className="stat-card-professional">
          <div className="flex items-center justify-between mb-4">
            <div className="stat-icon-professional bg-purple-100 text-purple-600">
              <Tag size={20} />
            </div>
            <span className="text-xs text-muted">Collections</span>
          </div>
          <div className="text-2xl font-bold text-primary">{COLLECTIONS.length}</div>
          <div className="text-sm text-muted">Available</div>
        </div>
      </div>

      {/* Sub-Navigation */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200">
        {[
          { id: 'all', label: 'All Items', icon: Package },
          { id: 'categories', label: 'Categories & Tags', icon: Tag },
          { id: 'discounts', label: 'Discounts & Coupons', icon: Percent },
          { id: 'inventory', label: 'Inventory', icon: AlertCircle }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="form-input-professional"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          value={selectedCollection}
          onChange={(e) => setSelectedCollection(e.target.value)}
          className="form-input-professional"
        >
          <option value="">All Collections</option>
          {COLLECTIONS.map((collection) => (
            <option key={collection} value={collection}>{collection}</option>
          ))}
        </select>

        <Button
          onClick={() => setShowBulkActions(!showBulkActions)}
          className="btn-secondary-professional"
          disabled={selectedProducts.length === 0}
        >
          <Filter size={16} className="mr-2" />
          Bulk Actions ({selectedProducts.length})
        </Button>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && selectedProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-amber-800">
                {selectedProducts.length} products selected
              </p>
              <p className="text-sm text-amber-600">
                Choose an action to apply to all selected products
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleBulkAction('discount')}
                className="btn-primary-professional"
                size="sm"
              >
                <Percent size={16} className="mr-2" />
                Apply Discount
              </Button>
              <Button
                onClick={() => handleBulkAction('feature')}
                className="btn-secondary-professional"
                size="sm"
              >
                <Eye size={16} className="mr-2" />
                Feature
              </Button>
              <Button
                onClick={() => handleBulkAction('archive')}
                className="btn-danger-professional"
                size="sm"
              >
                <Archive size={16} className="mr-2" />
                Archive
              </Button>
              <Button
                onClick={() => {
                  setSelectedProducts([]);
                  setShowBulkActions(false);
                }}
                className="btn-secondary-professional"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="table-professional">
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length}
                  onChange={toggleAllProducts}
                  className="rounded"
                />
              </th>
              <th className="px-6 py-3 text-left">Product</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-left">Price</th>
              <th className="px-6 py-3 text-left">Stock</th>
              <th className="px-6 py-3 text-left">Collections</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex -space-x-2">
                      {(product.images || []).slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={image || 'https://via.placeholder.com/50'}
                          alt={product.name || 'Product'}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        />
                      ))}
                      {(product.images?.length || 0) > 3 && (
                        <div className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex items-center justify-center bg-gray-100">
                          <span className="text-xs text-gray-500">+{(product.images?.length || 0) - 3}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-primary">{product.name || 'Unnamed Product'}</div>
                      <div className="text-sm text-muted">SKU: {product.sku || 'N/A'}</div>
                      <div className="text-xs text-muted">
                        {product.occasion || 'No occasion'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-primary">
                  {product.category?.name || 'No category'}
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-bold text-primary">₦{(product.base_price || 0).toLocaleString()}</div>
                    {product.sale_price && (
                      <div className="text-sm text-success">₦{product.sale_price.toLocaleString()}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">12</span>
                    {lowStockProducts.includes(product) && (
                      <span className="badge-professional badge-warning-professional">Low</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {(product.collections || []).slice(0, 2).map((collection) => (
                      <span key={collection} className="badge-professional badge-info-professional">
                        {collection}
                      </span>
                    ))}
                    {(product.collections?.length || 0) > 2 && (
                      <span className="text-xs text-muted">+{(product.collections?.length || 0) - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {product.featured && (
                      <span className="badge-professional badge-success-professional">Featured</span>
                    )}
                    {product.is_new && (
                      <span className="badge-professional badge-info-professional">New</span>
                    )}
                    {product.is_best_seller && (
                      <span className="badge-professional badge-warning-professional">Bestseller</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        console.log('Edit button clicked for product:', product.id);
                        editProduct(product);
                      }}
                      className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        console.log('Variants button clicked for product:', product.id);
                        setEditingProduct(product);
                        setShowVariantModal(true);
                      }}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Package size={14} />
                      Variants
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="xl">
        <div className="modal-professional">
          <div className="modal-professional-header">
            <h3 className="modal-professional-title">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
          </div>
          <div className="modal-professional-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-heading text-lg font-semibold text-primary mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label-professional">Product Name</label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Elegant Ankara Agbada"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label-professional">SKU (Auto-generated if empty)</label>
                    <Input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="AFQ-AGB-BLU-M-123"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="form-label-professional">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed product description..."
                    className="form-input-professional min-h-[100px]"
                    required
                  />
                </div>
              </div>

              {/* Categorization */}
              <div>
                <h4 className="font-heading text-lg font-semibold text-primary mb-4">Categorization</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label-professional">Category</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="form-input-professional"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label-professional">Occasion</label>
                    <select
                      value={formData.occasion}
                      onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                      className="form-input-professional"
                    >
                      <option value="">Select occasion</option>
                      {OCCASIONS.map((occasion) => (
                        <option key={occasion} value={occasion}>{occasion}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label-professional">Gender/Age</label>
                    <select
                      value={formData.gender_age}
                      onChange={(e) => setFormData({ ...formData, gender_age: e.target.value })}
                      className="form-input-professional"
                    >
                      <option value="">Select target</option>
                      {GENDER_AGE.map((target) => (
                        <option key={target} value={target}>{target}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="form-label-professional">Collections</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {COLLECTIONS.map((collection) => (
                        <label key={collection} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.collections.includes(collection)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, collections: [...formData.collections, collection] });
                              } else {
                                setFormData({ ...formData, collections: formData.collections.filter(c => c !== collection) });
                              }
                            }}
                            className="mr-2"
                          />
                          {collection}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label-professional">Customization Status</label>
                    <select
                      value={formData.customization_status}
                      onChange={(e) => setFormData({ ...formData, customization_status: e.target.value })}
                      className="form-input-professional"
                    >
                      <option value="">Select status</option>
                      {CUSTOMIZATION_STATUS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h4 className="font-heading text-lg font-semibold text-primary mb-4">Pricing</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label-professional">Base Price (₦)</label>
                    <Input
                      type="number"
                      value={formData.base_price}
                      onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                      placeholder="25000"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label-professional">Sale Price (₦) - Optional</label>
                    <Input
                      type="number"
                      value={formData.sale_price}
                      onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                      placeholder="20000"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div>
                <h4 className="font-heading text-lg font-semibold text-primary mb-4">Product Images</h4>
                <ImageUpload
                  label="Product Images"
                  value={formData.images.join(',')}
                  onChange={(urls) => setFormData({ ...formData, images: urls.split(',') })}
                  multiple={true}
                  maxFiles={5}
                />
              </div>

              {/* Variants */}
              <div>
                <h4 className="font-heading text-lg font-semibold text-primary mb-4">Product Variants</h4>
                
                {/* Sizes Selection */}
                <div className="mb-6">
                  <label className="form-label-professional">Available Sizes</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    {globalVariants
                      .filter(variant => variant.type === 'size')
                      .map((variant) => (
                        <label
                          key={variant.id}
                          className="flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all hover:border-amber-500 hover:bg-amber-50"
                        >
                          <input
                            type="checkbox"
                            checked={formData.selectedSizes.includes(variant.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ 
                                  ...formData, 
                                  selectedSizes: [...formData.selectedSizes, variant.id] 
                                });
                              } else {
                                setFormData({ 
                                  ...formData, 
                                  selectedSizes: formData.selectedSizes.filter(id => id !== variant.id) 
                                });
                              }
                            }}
                            className="sr-only"
                          />
                          <span className={`text-sm font-medium ${
                            formData.selectedSizes.includes(variant.id)
                              ? 'text-amber-600'
                              : 'text-gray-600'
                          }`}>
                            {variant.name}
                          </span>
                        </label>
                      ))}
                  </div>
                  <p className="text-xs text-muted mt-2">
                    Select all sizes that apply to this product
                  </p>
                </div>

                {/* Colors Selection */}
                <div>
                  <label className="form-label-professional">Available Colors</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {globalVariants
                      .filter(variant => variant.type === 'color')
                      .map((variant) => (
                        <label
                          key={variant.id}
                          className="flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:border-amber-500 hover:bg-amber-50"
                        >
                          <input
                            type="checkbox"
                            checked={formData.selectedColors.includes(variant.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ 
                                  ...formData, 
                                  selectedColors: [...formData.selectedColors, variant.id] 
                                });
                              } else {
                                setFormData({ 
                                  ...formData, 
                                  selectedColors: formData.selectedColors.filter(id => id !== variant.id) 
                                });
                              }
                            }}
                            className="sr-only"
                          />
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: variant.hex }}
                            />
                            <span className={`text-sm font-medium ${
                              formData.selectedColors.includes(variant.id)
                                ? 'text-amber-600'
                                : 'text-gray-600'
                            }`}>
                              {variant.name}
                            </span>
                          </div>
                        </label>
                      ))}
                  </div>
                  <p className="text-xs text-muted mt-2">
                    Select all colors that apply to this product
                  </p>
                </div>
              </div>

              {/* SEO Metadata */}
              <div>
                <h4 className="font-heading text-lg font-semibold text-primary mb-4">SEO & Marketing</h4>
                <div className="space-y-4">
                  <div>
                    <label className="form-label-professional">Meta Title</label>
                    <Input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder="Elegant Ankara Agbada - Afrique Style"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted mt-1">
                      {formData.meta_title.length}/60 characters
                    </p>
                  </div>
                  
                  <div>
                    <label className="form-label-professional">Meta Description</label>
                    <textarea
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      placeholder="Premium quality Ankara agbada perfect for weddings and special occasions..."
                      className="form-input-professional min-h-[80px]"
                      maxLength={160}
                    />
                    <p className="text-xs text-muted mt-1">
                      {formData.meta_description.length}/160 characters
                    </p>
                  </div>
                  
                  <div>
                    <label className="form-label-professional">Keywords (comma-separated)</label>
                    <Input
                      type="text"
                      value={formData.meta_keywords}
                      onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                      placeholder="ankara, agbada, nigerian, traditional, wedding"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <h4 className="font-heading text-lg font-semibold text-primary mb-4">Additional Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label-professional">Material</label>
                    <Input
                      type="text"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      placeholder="100% Premium Ankara Cotton"
                    />
                  </div>
                  <div>
                    <label className="form-label-professional">Care Instructions</label>
                    <Input
                      type="text"
                      value={formData.care_instructions}
                      onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
                      placeholder="Hand wash cold, dry clean recommended"
                    />
                  </div>
                </div>
              </div>

              {/* Status Flags */}
              <div>
                <h4 className="font-heading text-lg font-semibold text-primary mb-4">Product Status</h4>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="mr-2"
                    />
                    Featured Product
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_new}
                      onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                      className="mr-2"
                    />
                    New Arrival
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_best_seller}
                      onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
                      className="mr-2"
                    />
                    Bestseller
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  onClick={() => setShowModal(false)}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    {/* Variant Management Modal */}
      <Modal isOpen={showVariantModal} onClose={() => setShowVariantModal(false)} size="lg">
        <div className="modal-professional">
          <div className="modal-professional-header">
            <h3 className="modal-professional-title">
              Manage Variants - {editingProduct?.name}
            </h3>
          </div>
          <div className="modal-professional-body">
            <div className="mb-6">
              <h4 className="font-heading text-lg font-semibold text-primary mb-4">Current Variants</h4>
              <div className="space-y-3">
                {(editingProduct?.variants || []).map((variant, index) => (
                  <div key={variant.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-medium text-primary">SKU: {variant.sku}</div>
                        <div className="text-sm text-muted">
                          Size: {variant.size} • Color: {variant.color}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">₦{variant.price.toLocaleString()}</div>
                        <div className="text-sm text-muted">Stock: {variant.stock}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingVariant(variant);
                          setVariantData({
                            size: variant.size,
                            color: variant.color,
                            stock: variant.stock.toString(),
                            price: variant.price.toString(),
                            safety_threshold: variant.safety_threshold
                          });
                        }}
                        className="px-3 py-1 text-sm bg-amber-600 text-white rounded hover:bg-amber-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this variant?')) {
                            // Handle variant deletion
                            console.log('Delete variant:', variant.id);
                          }
                        }}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {(!editingProduct?.variants || editingProduct.variants.length === 0) && (
                  <div className="text-center py-8 text-muted">
                    No variants added yet. Add your first variant below.
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-heading text-lg font-semibold text-primary mb-4">
                {editingVariant ? 'Edit Variant' : 'Add New Variant'}
              </h4>
              <form onSubmit={(e) => {
                e.preventDefault();
                const newVariant = {
                  id: editingVariant?.id || Date.now().toString(),
                  sku: generateSKU(
                    editingProduct?.name || '',
                    editingProduct?.fabric_type || '',
                    variantData.color,
                    variantData.size
                  ),
                  size: variantData.size,
                  color: variantData.color,
                  stock: parseInt(variantData.stock) || 0,
                  price: parseFloat(variantData.price) || 0,
                  safety_threshold: variantData.safety_threshold
                };
                
                console.log('Variant data:', newVariant);
                
                // Reset form
                setVariantData({
                  size: '',
                  color: '',
                  stock: '',
                  price: '',
                  safety_threshold: 5
                });
                setEditingVariant(null);
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label-professional">Size</label>
                    <select
                      value={variantData.size}
                      onChange={(e) => setVariantData({ ...variantData, size: e.target.value })}
                      className="form-input-professional"
                      required
                    >
                      <option value="">Select size</option>
                      {globalVariants
                        .filter(v => v.type === 'size')
                        .map((variant) => (
                          <option key={variant.id} value={variant.name}>{variant.name}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label-professional">Color</label>
                    <select
                      value={variantData.color}
                      onChange={(e) => setVariantData({ ...variantData, color: e.target.value })}
                      className="form-input-professional"
                      required
                    >
                      <option value="">Select color</option>
                      {globalVariants
                        .filter(v => v.type === 'color')
                        .map((variant) => (
                          <option key={variant.id} value={variant.name}>{variant.name}</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label-professional">Price (₦)</label>
                    <Input
                      type="number"
                      value={variantData.price}
                      onChange={(e) => setVariantData({ ...variantData, price: e.target.value })}
                      placeholder="25000"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label-professional">Stock Quantity</label>
                    <Input
                      type="number"
                      value={variantData.stock}
                      onChange={(e) => setVariantData({ ...variantData, stock: e.target.value })}
                      placeholder="10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label-professional">Low Stock Threshold</label>
                  <Input
                    type="number"
                    value={variantData.safety_threshold}
                    onChange={(e) => setVariantData({ ...variantData, safety_threshold: parseInt(e.target.value) || 5 })}
                    placeholder="5"
                    min="1"
                  />
                  <p className="text-xs text-muted mt-1">
                    Alert when stock drops below this number
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setVariantData({
                        size: '',
                        color: '',
                        stock: '',
                        price: '',
                        safety_threshold: 5
                      });
                      setEditingVariant(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  >
                    {editingVariant ? 'Update Variant' : 'Add Variant'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
