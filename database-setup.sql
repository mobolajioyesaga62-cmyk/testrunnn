-- ========================================
-- AFRIQUE STYLE DATABASE SETUP
-- ========================================
-- Run this in your Supabase SQL Editor
-- ========================================

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    sku TEXT,
    images TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    is_best_seller BOOLEAN DEFAULT FALSE,
    available_sizes TEXT[] DEFAULT '{}',
    available_colors JSONB DEFAULT '[]',
    material TEXT,
    care_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    sku TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    customer_name TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    shipping_address JSONB,
    billing_address JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    product_name TEXT NOT NULL,
    variant_id TEXT,
    size TEXT,
    color TEXT,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Profiles Table (for user roles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create Cart Table
CREATE TABLE IF NOT EXISTS cart (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, variant_id)
);

-- 8. Create Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- ========================================
-- INSERT SAMPLE DATA
-- ========================================

-- Insert Categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Female Outfits', 'female', 'Beautiful traditional and contemporary outfits for women', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'),
('Male Outfits', 'male', 'Stylish traditional wear for men', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'),
('Uniforms', 'uniforms', 'Professional and school uniforms', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'),
('Aprons', 'aprons', 'Stylish and functional aprons', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'),
('Accessories', 'accessories', 'Complete your look with our accessories', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'),
('Custom Sets', 'custom', 'Custom made clothing sets for special occasions', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg')
ON CONFLICT (slug) DO NOTHING;

-- Insert Sample Products
INSERT INTO products (name, slug, description, category, base_price, sku, images, featured, is_new, is_best_seller, available_sizes, available_colors, material, care_instructions) VALUES
('Elegant Ankara Maxi Dress', 'elegant-ankara-maxi-dress', 'Beautiful floor-length Ankara dress with vibrant African prints. Perfect for special occasions.', 'female', 25000.00, 'AFR-FEM-001', ARRAY['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'], true, true, true, ARRAY['S', 'M', 'L', 'XL'], '[{"name": "Multi", "hex": "#FF6B6B"}]', '100% Cotton Ankara', 'Hand wash cold, hang dry'),
('Traditional Agbada Set', 'traditional-agbada-set', 'Complete traditional Agbada set for men. Perfect for weddings and cultural events.', 'male', 55000.00, 'AFR-MAL-001', ARRAY['https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'], true, false, true, ARRAY['M', 'L', 'XL', 'XXL'], '[{"name": "Navy", "hex": "#000080"}, {"name": "Burgundy", "hex": "#800020"}]', 'Premium Damask', 'Dry clean only'),
('Dashiki Shirt', 'dashiki-shirt', 'Colorful dashiki shirt with traditional African patterns. Comfortable and stylish.', 'male', 18000.00, 'AFR-MAL-003', ARRAY['https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'], false, true, false, ARRAY['S', 'M', 'L', 'XL'], '[{"name": "Multi", "hex": "#FF6B6B"}]', '100% Cotton', 'Machine wash warm')
ON CONFLICT (slug) DO NOTHING;

-- Insert Product Variants
INSERT INTO product_variants (product_id, size, color, color_hex, price, stock, sku) 
SELECT 
    p.id,
    size,
    color,
    color_hex,
    p.base_price,
    50, -- stock
    p.sku || '-' || size || '-' || color
FROM products p, 
unnest(p.available_sizes) as size,
jsonb_array_elements(p.available_colors) as color_data
WHERE p.slug IN ('elegant-ankara-maxi-dress', 'traditional-agbada-set', 'dashiki-shirt')
AND color_data->>'name' IS NOT NULL
AND color_data->>'hex' IS NOT NULL
ON CONFLICT DO NOTHING;

-- Insert Sample Orders
INSERT INTO orders (order_number, customer_email, customer_phone, customer_name, total_amount, status, payment_method, shipping_address) VALUES
('ORD-2024-001', 'customer1@example.com', '+2348012345678', 'John Doe', 25000.00, 'pending', 'paystack', '{"address_line1": "123 Main St", "city": "Lagos", "state": "Lagos", "postal_code": "100001", "country": "Nigeria"}'),
('ORD-2024-002', 'customer2@example.com', '+2348023456789', 'Jane Smith', 55000.00, 'paid', 'bank_transfer', '{"address_line1": "456 Oak Ave", "city": "Abuja", "state": "Abuja", "postal_code": "900001", "country": "Nigeria"}'),
('ORD-2024-003', 'customer3@example.com', '+2348034567890', 'Mike Johnson', 18000.00, 'shipped', 'paystack', '{"address_line1": "789 Pine Rd", "city": "Port Harcourt", "state": "Rivers", "postal_code": "500001", "country": "Nigeria"}')
ON CONFLICT (order_number) DO NOTHING;

-- ========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_new ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON products(is_best_seller);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON product_variants(stock);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);

-- ========================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Cart RLS policies
CREATE POLICY "Users can view their own cart" ON cart FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own cart" ON cart FOR ALL USING (auth.uid() = user_id);

-- Wishlist RLS policies
CREATE POLICY "Users can view their own wishlist" ON wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- SETUP COMPLETE
-- ========================================

-- Verify setup
SELECT 'Products' as table_name, COUNT(*) as record_count FROM products
UNION ALL
SELECT 'Product Variants', COUNT(*) FROM product_variants  
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Profiles', COUNT(*) FROM profiles;
