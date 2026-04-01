import { useState } from 'react';
import { Plus, Package, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default function ProductManagementSimple() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Add Product
        </Button>
      </div>

      {/* Database Setup Notice */}
      <Card className="mb-6 border-amber-200 bg-amber-50">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-amber-600" size={20} />
          <div>
            <p className="font-semibold text-amber-900">Database Setup Required</p>
            <p className="text-amber-700">The product database tables need to be created first.</p>
            <p className="text-amber-600 text-sm mt-2">
              Please run the database setup script or create the tables manually.
            </p>
          </div>
        </div>
      </Card>

      {/* Sample Product Table */}
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
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Package className="text-gray-400 mr-3" size={40} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Sample Product</div>
                      <div className="text-sm text-gray-500">No database connection</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Sample Category
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₦0.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800">
                    0 items
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800">
                    Setup Required
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Setup Instructions */}
      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps:</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="font-bold text-amber-600">1.</span>
            <div>
              <p className="font-medium">Create Database Tables</p>
              <p className="text-gray-600">Run the SQL script to create products and product_variants tables</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-bold text-amber-600">2.</span>
            <div>
              <p className="font-medium">Seed Sample Data</p>
              <p className="text-gray-600">Add sample products to test the functionality</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-bold text-amber-600">3.</span>
            <div>
              <p className="font-medium">Test Full Features</p>
              <p className="text-gray-600">Add, edit, and delete products with full CRUD operations</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Simple Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Product</h3>
            <p className="text-gray-600 mb-4">
              Product management requires database setup. Please configure your database first.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
