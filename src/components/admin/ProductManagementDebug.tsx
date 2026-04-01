import { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';

export default function ProductManagementDebug() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableInfo, setTableInfo] = useState<any>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    debugDatabase();
  }, []);

  const debugDatabase = async () => {
    addLog('🔍 Starting database debug...');
    
    try {
      // Test 1: Check if products table exists
      addLog('📋 Testing products table...');
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('count', { count: 'exact', head: true });

      if (productsError) {
        addLog(`❌ Products table error: ${productsError.message}`);
        setTableInfo({ exists: false, error: productsError.message });
      } else {
        addLog(`✅ Products table exists with ${productsData || 0} records`);
        setTableInfo({ exists: true, count: productsData });
      }

      // Test 2: Try to fetch actual products with different column names
      addLog('🔍 Testing product columns...');
      
      const commonColumns = ['id', 'name', 'product_name', 'title', 'price', 'base_price', 'category', 'image', 'images'];
      
      for (const column of commonColumns) {
        try {
          const { data, error } = await supabase
            .from('products')
            .select(column)
            .limit(1);
          
          if (!error && data) {
            addLog(`✅ Found column: ${column}`);
          }
        } catch (e) {
          // Column doesn't exist, continue
        }
      }

      // Test 3: Try different query approaches
      addLog('🔍 Testing different query approaches...');

      // Approach 1: Simple select
      try {
        const { data: simpleData, error: simpleError } = await supabase
          .from('products')
          .select('*')
          .limit(5);

        if (simpleError) {
          addLog(`❌ Simple query failed: ${simpleError.message}`);
        } else {
          addLog(`✅ Simple query succeeded, found ${simpleData?.length || 0} products`);
          
          if (simpleData && simpleData.length > 0) {
            addLog(`📊 Sample product structure: ${JSON.stringify(Object.keys(simpleData[0]), null, 2)}`);
            addLog(`📊 Sample product data: ${JSON.stringify(simpleData[0], null, 2)}`);
          }
        }
      } catch (e) {
        addLog(`❌ Simple query exception: ${e}`);
      }

      // Test 4: Check for related tables
      addLog('🔍 Checking for related tables...');
      
      const relatedTables = ['product_variants', 'categories', 'inventory', 'stock'];
      
      for (const table of relatedTables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('count', { count: 'exact', head: true });
          
          if (!error) {
            addLog(`✅ Found related table: ${table} (${data || 0} records)`);
          } else {
            addLog(`❌ Related table not found: ${table}`);
          }
        } catch (e) {
          addLog(`❌ Related table error: ${table}`);
        }
      }

    } catch (error) {
      addLog(`💥 Critical error: ${error}`);
    } finally {
      setLoading(false);
      addLog('🏁 Debug complete');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <span className="ml-3">Debugging database connection...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Product Management Debug</h2>
        <button
          onClick={debugDatabase}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Re-run Debug
        </button>
      </div>

      {/* Summary Card */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Summary</h3>
        <div className="flex items-center gap-3">
          {tableInfo?.exists ? (
            <>
              <CheckCircle className="text-green-600" size={20} />
              <span className="text-green-700">Database connected successfully</span>
            </>
          ) : (
            <>
              <XCircle className="text-red-600" size={20} />
              <span className="text-red-700">Connection issues detected</span>
            </>
          )}
        </div>
      </Card>

      {/* Debug Logs */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Logs</h3>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))}
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800">
              <strong>💡 Based on the debug output above:</strong><br/>
              1. Check what columns your products table actually has<br/>
              2. Identify any missing related tables<br/>
              3. I can customize the ProductManagement component to match your schema
            </p>
          </div>
          
          <div className="p-3 bg-amber-50 border border-amber-200 rounded">
            <p className="text-amber-800">
              <strong>🔧 To fix the ProductManagement component:</strong><br/>
              Share the debug output and I'll create a version that works with your exact database structure.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
