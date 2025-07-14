/**
 * Demo file showing how to use the new entities
 * This demonstrates the new entities architecture
 */

import React, { useState, useEffect } from "react";
import { 
  User, 
  Product, 
  Order, 
  Organization, 
  Location,
  userApi,
  productApi,
  orderApi,
  organizationApi,
  locationApi,
  UserAvatar,
  ProductCard
} from "./index";

export const EntitiesDemo: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // These would be real API calls in production
      console.log('Loading entities data...');
      
      // Mock data for demo
      const mockUser: User = {
        id: '1',
        email: 'john@example.com',
        full_name: 'John Doe',
        is_active: true,
        created_at: new Date().toISOString(),
        last_sign_in: new Date().toISOString(),
        organizationId: '1',
        locationId: '1'
      };

      const mockProduct: Product = {
        id: '1',
        name: 'Sample Product',
        description: 'This is a sample product',
        price: 29.99,
        quantity: 100,
        status: 'active' as any,
        category: 'Electronics',
        sku: 'SP001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setUsers([mockUser]);
      setProducts([mockProduct]);
      setOrders([]);
      setOrganizations([]);
      setLocations([]);
    } catch (error) {
      console.error('Error loading entities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    console.log('Selected product:', product);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading entities...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Entities Layer Demo
        </h2>
        
        <div className="prose text-gray-600 mb-6">
          <p>
            This demo shows the new entities architecture with business logic,
            API methods, and UI components organized by domain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Entity Demo */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-3">User Entity</h3>
            <div className="space-y-3">
              {users.map(user => (
                <div key={user.id} className="flex items-center space-x-3">
                  <UserAvatar user={user} size="md" showTooltip />
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-blue-600">
              <p>✓ UserAvatar component</p>
              <p>✓ User types & utilities</p>
              <p>✓ User API methods</p>
            </div>
          </div>

          {/* Product Entity Demo */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-3">Product Entity</h3>
            <div className="space-y-3">
              {products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  onSelect={handleProductSelect}
                  showStock={true}
                  showPrice={true}
                  className="text-sm"
                />
              ))}
            </div>
            <div className="mt-4 text-sm text-green-600">
              <p>✓ ProductCard component</p>
              <p>✓ Product types & utilities</p>
              <p>✓ Product API methods</p>
            </div>
          </div>

          {/* Order Entity Demo */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-800 mb-3">Order Entity</h3>
            <div className="space-y-3">
              {orders.length > 0 ? (
                orders.map(order => (
                  <div key={order.id} className="bg-white p-3 rounded border">
                    <p className="font-medium">Order #{order.order_number}</p>
                    <p className="text-sm text-gray-600">
                      Status: {order.status}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No orders to display</p>
              )}
            </div>
            <div className="mt-4 text-sm text-purple-600">
              <p>✓ Order types & utilities</p>
              <p>✓ Order API methods</p>
              <p>⏳ Order UI components</p>
            </div>
          </div>

          {/* Organization Entity Demo */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-3">Organization Entity</h3>
            <div className="space-y-3">
              {organizations.length > 0 ? (
                organizations.map(org => (
                  <div key={org.id} className="bg-white p-3 rounded border">
                    <p className="font-medium">{org.name}</p>
                    <p className="text-sm text-gray-600">
                      Status: {org.status}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No organizations to display</p>
              )}
            </div>
            <div className="mt-4 text-sm text-orange-600">
              <p>✓ Organization types & utilities</p>
              <p>✓ Organization API methods</p>
              <p>⏳ Organization UI components</p>
            </div>
          </div>

          {/* Location Entity Demo */}
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-3">Location Entity</h3>
            <div className="space-y-3">
              {locations.length > 0 ? (
                locations.map(location => (
                  <div key={location.id} className="bg-white p-3 rounded border">
                    <p className="font-medium">{location.name}</p>
                    <p className="text-sm text-gray-600">
                      Type: {location.type}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No locations to display</p>
              )}
            </div>
            <div className="mt-4 text-sm text-red-600">
              <p>✓ Location types & utilities</p>
              <p>✓ Location API methods</p>
              <p>⏳ Location UI components</p>
            </div>
          </div>

          {/* Architecture Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Architecture</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Model Layer:</strong> Types & business logic</p>
              <p><strong>API Layer:</strong> HTTP requests & data fetching</p>
              <p><strong>UI Layer:</strong> React components</p>
              <p><strong>Benefits:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Clear separation of concerns</li>
                <li>Reusable components</li>
                <li>Type safety</li>
                <li>Easy testing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntitiesDemo;
