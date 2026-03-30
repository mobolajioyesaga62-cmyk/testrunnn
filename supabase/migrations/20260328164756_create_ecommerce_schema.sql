/*
  # E-Commerce Platform Database Schema
  
  ## Overview
  Complete database schema for Nigerian fashion e-commerce platform with inventory management,
  orders, payments, and customer features.
  
  ## New Tables
  
  ### 1. profiles
  - `id` (uuid, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `phone` (text)
  - `avatar_url` (text)
  - `is_admin` (boolean, default false)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 2. categories
  - `id` (uuid, primary key)
  - `name` (text) - e.g., "Female Outfits", "Male Outfits", "Uniforms"
  - `slug` (text, unique)
  - `description` (text)
  - `image_url` (text)
  - `created_at` (timestamptz)
  
  ### 3. products
  - `id` (uuid, primary key)
  - `name` (text)
  - `slug` (text, unique)
  - `description` (text)
  - `category_id` (uuid, references categories)
  - `base_price` (decimal)
  - `sale_price` (decimal, nullable)
  - `sku` (text, unique)
  - `images` (jsonb array)
  - `featured` (boolean)
  - `is_new` (boolean)
  - `is_best_seller` (boolean)
  - `available_sizes` (text array)
  - `available_colors` (jsonb array)
  - `care_instructions` (text)
  - `material` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 4. product_variants
  - `id` (uuid, primary key)
  - `product_id` (uuid, references products)
  - `size` (text)
  - `color` (text)
  - `color_hex` (text)
  - `stock_quantity` (integer)
  - `sku` (text, unique)
  - `price_adjustment` (decimal, default 0)
  - `created_at` (timestamptz)
  
  ### 5. cart_items
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `product_id` (uuid, references products)
  - `variant_id` (uuid, references product_variants)
  - `quantity` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 6. wishlist_items
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `product_id` (uuid, references products)
  - `created_at` (timestamptz)
  
  ### 7. addresses
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `full_name` (text)
  - `phone` (text)
  - `address_line1` (text)
  - `address_line2` (text)
  - `city` (text)
  - `state` (text)
  - `country` (text, default 'Nigeria')
  - `is_default` (boolean)
  - `created_at` (timestamptz)
  
  ### 8. coupons
  - `id` (uuid, primary key)
  - `code` (text, unique)
  - `discount_type` (text) - 'percentage' or 'fixed'
  - `discount_value` (decimal)
  - `min_purchase` (decimal)
  - `max_uses` (integer)
  - `used_count` (integer, default 0)
  - `valid_from` (timestamptz)
  - `valid_until` (timestamptz)
  - `active` (boolean)
  - `created_at` (timestamptz)
  
  ### 9. orders
  - `id` (uuid, primary key)
  - `order_number` (text, unique)
  - `user_id` (uuid, references auth.users)
  - `status` (text) - 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'
  - `payment_status` (text) - 'pending', 'paid', 'failed', 'refunded'
  - `payment_method` (text) - 'paystack', 'flutterwave', 'bank_transfer'
  - `payment_reference` (text)
  - `subtotal` (decimal)
  - `discount_amount` (decimal, default 0)
  - `shipping_fee` (decimal)
  - `total_amount` (decimal)
  - `coupon_code` (text)
  - `shipping_address` (jsonb)
  - `customer_email` (text)
  - `customer_phone` (text)
  - `notes` (text)
  - `tracking_number` (text)
  - `paid_at` (timestamptz)
  - `shipped_at` (timestamptz)
  - `delivered_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 10. order_items
  - `id` (uuid, primary key)
  - `order_id` (uuid, references orders)
  - `product_id` (uuid, references products)
  - `variant_id` (uuid, references product_variants)
  - `product_name` (text)
  - `variant_details` (jsonb)
  - `quantity` (integer)
  - `unit_price` (decimal)
  - `total_price` (decimal)
  - `created_at` (timestamptz)
  
  ### 11. reviews
  - `id` (uuid, primary key)
  - `product_id` (uuid, references products)
  - `user_id` (uuid, references auth.users)
  - `rating` (integer) - 1 to 5
  - `title` (text)
  - `comment` (text)
  - `verified_purchase` (boolean)
  - `helpful_count` (integer, default 0)
  - `created_at` (timestamptz)
  
  ### 12. newsletter_subscribers
  - `id` (uuid, primary key)
  - `email` (text, unique)
  - `subscribed_at` (timestamptz)
  
  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users to manage their own data
  - Admin-only policies for products, categories, and order management
  - Public read access for products and categories
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  avatar_url text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  base_price decimal(10,2) NOT NULL,
  sale_price decimal(10,2),
  sku text UNIQUE NOT NULL,
  images jsonb DEFAULT '[]'::jsonb,
  featured boolean DEFAULT false,
  is_new boolean DEFAULT false,
  is_best_seller boolean DEFAULT false,
  available_sizes text[] DEFAULT '{}',
  available_colors jsonb DEFAULT '[]'::jsonb,
  care_instructions text,
  material text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  size text NOT NULL,
  color text NOT NULL,
  color_hex text NOT NULL,
  stock_quantity integer DEFAULT 0,
  sku text UNIQUE NOT NULL,
  price_adjustment decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product variants"
  ON product_variants FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage product variants"
  ON product_variants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, variant_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist"
  ON wishlist_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items"
  ON wishlist_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items"
  ON wishlist_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  country text DEFAULT 'Nigeria',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value decimal(10,2) NOT NULL,
  min_purchase decimal(10,2) DEFAULT 0,
  max_uses integer,
  used_count integer DEFAULT 0,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons"
  ON coupons FOR SELECT
  TO public
  USING (active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Admins can manage coupons"
  ON coupons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method text CHECK (payment_method IN ('paystack', 'flutterwave', 'bank_transfer')),
  payment_reference text,
  subtotal decimal(10,2) NOT NULL,
  discount_amount decimal(10,2) DEFAULT 0,
  shipping_fee decimal(10,2) NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  coupon_code text,
  shipping_address jsonb NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  notes text,
  tracking_number text,
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  variant_details jsonb NOT NULL,
  quantity integer NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  verified_purchase boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view subscribers"
  ON newsletter_subscribers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON products(is_best_seller) WHERE is_best_seller = true;
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id);

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_number text;
BEGIN
  new_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || 
                LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();