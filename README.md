# Afrique Style - Nigerian E-Commerce Fashion Platform

A modern, full-featured e-commerce web application for a Nigerian clothing store, built with React, TypeScript, and Supabase.

## Features

### Customer Features
- **Product Browsing**: Browse products by category with advanced filtering
- **Product Search**: Search products by name with instant results
- **Product Details**: View detailed product information with multiple images, size/color variants
- **Shopping Cart**: Persistent cart with quantity management
- **Wishlist**: Save favorite products for later
- **User Authentication**: Secure email/password and Google OAuth login
- **Checkout Process**: Multi-step checkout with shipping and payment options
- **Order Management**: Track order status and view order history
- **Coupon System**: Apply discount codes at checkout
- **Reviews**: Rate and review purchased products

### Payment Options
- Paystack integration
- Flutterwave integration
- Bank transfer option

### Product Categories
- Female Outfits (Ankara dresses, Iro & Buba, Kaftans)
- Male Outfits (Agbada sets, Senator suits, Dashiki shirts)
- Uniforms
- Aprons
- Accessories
- Custom Clothing Sets

### Admin Features
- Dashboard with sales analytics
- Product management (add, edit, delete)
- Order management with status updates
- Customer list and statistics
- Inventory tracking with stock alerts
- Coupon management

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **State Management**: Zustand with persistence
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **Icons**: Lucide React
- **Build Tool**: Vite

## Database Schema

The application uses a comprehensive database schema including:
- Users and Profiles
- Products with Variants (size/color combinations)
- Categories
- Shopping Cart
- Wishlist
- Orders and Order Items
- Addresses
- Coupons
- Reviews
- Newsletter Subscribers

All tables have Row Level Security (RLS) enabled for data protection.

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

The database schema is already created via Supabase migrations. Sample data has been seeded including:
- 6 product categories
- 12 sample products
- Product variants with stock quantities
- 3 sample coupon codes

### 4. Create Admin User

To access the admin dashboard, create a user account and then update the database:

```sql
UPDATE profiles
SET is_admin = true
WHERE email = 'your-admin-email@example.com';
```

### 5. Run Development Server

```bash
npm run dev
```

### 6. Build for Production

```bash
npm run build
```

## Sample Coupon Codes

- `WELCOME20` - 20% off any purchase
- `SAVE5000` - ₦5,000 off on orders above ₦30,000
- `FIRSTBUY` - 15% off for first-time buyers

## Key Pages

- `/` - Homepage with featured products and categories
- `/shop` - Product catalog with filters
- `/product/:slug` - Product detail page
- `/cart` - Shopping cart
- `/wishlist` - Saved items
- `/checkout` - Checkout process
- `/account` - User account and order history
- `/admin` - Admin dashboard (requires admin privileges)
- `/contact` - Contact and about page

## Mobile Responsive

The application is fully responsive with:
- Mobile-first design approach
- Bottom navigation on mobile devices
- Optimized images and lazy loading
- Touch-friendly interface

## Security Features

- Row Level Security (RLS) on all database tables
- Secure authentication with Supabase Auth
- Protected admin routes
- Input validation and sanitization
- HTTPS-only communication

## Performance Optimizations

- Code splitting with React Router
- Lazy loading of images
- Optimized bundle size
- Efficient state management with Zustand
- Database indexes for fast queries

## Future Enhancements

Potential features for future development:
- WhatsApp order support integration
- Live chat customer support
- Abandoned cart recovery emails
- AI-powered product recommendations
- Delivery tracking integration
- Mobile app (React Native)
- Multiple language support
- Push notifications for order updates
- Advanced analytics dashboard
- Bulk order management for admin
- Product import/export functionality

## Support

For support, email info@afriquestyle.com or call +234 800 123 4567.

## License

This project is proprietary software for Afrique Style Nigeria.
