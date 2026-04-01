import { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';

export default function DatabaseDiagnostic() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check common tables that might exist
      const tableChecks = [
        { name: 'products', description: 'Product catalog' },
        { name: 'orders', description: 'Customer orders' },
        { name: 'categories', description: 'Product categories' },
        { name: 'profiles', description: 'User profiles and roles' },
        { name: 'product_variants', description: 'Product size/color variants' },
        { name: 'order_items', description: 'Order line items' },
        { name: 'cart', description: 'Shopping cart' },
        {name: 'wishlist', description: 'Customer wishlist' }
      ];

      const results = [];

      for (const table of tableChecks) {
        try {
          const { data, error, count } = await supabase
            .from(table.name)
            .select('*', { count: 'exact', head: true });

          results.push({
            name: table.name,
            description: table.description,
            exists: !error,
            count: count || 0,
            error: error?.message
          });
        } catch (err) {
          results.push({
            name: table.name,
            description: table.description,
            exists: false,
            count: 0,
            error: 'Connection failed'
          });
        }
      }

      setTables(results);
    } catch (err) {
      setError('Failed to check database connection');
      console.error('Database diagnostic error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTableStatus = (table: any) => {
    if (table.exists) {
      return {
        icon: CheckCircle,
        color: 'green',
        text: `✓ Exists (${table.count} records)`
      };
    } else {
      return {
        icon: XCircle,
        color: 'red',
        text: `✗ Missing ${table.error ? `- ${table.error}` : ''}`
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <span className="ml-3">Checking database connection...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Database Connection Status</h2>
        <button
          onClick={checkDatabase}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <div>
              <p className="font-semibold text-red-900">Connection Error</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tables.map((table) => {
          const status = getTableStatus(table);
          const StatusIcon = status.icon;

          return (
            <Card key={table.name}>
              <div className="flex items-start gap-3">
                <div className={`mt-1`}>
                  <StatusIcon size={20} className={`text-${status.color}-600`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{table.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{table.description}</p>
                  <p className={`text-sm font-medium text-${status.color}-600`}>
                    {status.text}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps:</h3>
        <div className="space-y-2 text-sm">
          {tables.filter(t => t.exists).length > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800">
                <strong>✅ Good news!</strong> Found {tables.filter(t => t.exists).length} existing tables.
                The admin dashboard should work with your current database.
              </p>
            </div>
          )}
          
          {tables.filter(t => !t.exists).length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded">
              <p className="text-amber-800">
                <strong>⚠️ Missing tables:</strong> {tables.filter(t => !t.exists).map(t => t.name).join(', ')}
                {tables.filter(t => !t.exists).length > 3 && (
                  <span> - Consider running the setup script or updating the admin components to match your schema.
                </span>
              )}
              </p>
            </div>
          )}

          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800">
              <strong>💡 Tip:</strong> If your table names are different, I can customize the admin components to match your schema.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
