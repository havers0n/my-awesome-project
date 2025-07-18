import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Filters, Supplier, Organization } from '../types';
import { useSearchParams } from 'react-router-dom';
import { ALL_OPTION_VALUE } from '../constants';
import SupplierFormModal from '../components/SupplierFormModal';

function SupplierListPage() {
  const { suppliers, organizations, deleteSupplier } = useData();
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: ALL_OPTION_VALUE,
    type: '',
    orgId: ALL_OPTION_VALUE,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFilters({
      search: params.get('search') || '',
      status: params.get('status') || ALL_OPTION_VALUE,
      type: params.get('type') || '',
      orgId: params.get('orgId') || ALL_OPTION_VALUE,
    });
  }, []);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.status !== ALL_OPTION_VALUE) params.status = filters.status;
    if (filters.orgId !== ALL_OPTION_VALUE) params.orgId = filters.orgId;

    const newUrl = `${window.location.pathname}?${new URLSearchParams(
      params
    ).toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  }, [filters]);

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDeleteSupplier = (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      deleteSupplier(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const getOrganizationName = (orgId: string): string => {
    const org = organizations.find((o: Organization) => o.id === orgId);
    return org ? org.name : 'Not specified';
  };

  const filteredSuppliers = suppliers.filter((supplier: Supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      (supplier.legal_name &&
        supplier.legal_name.toLowerCase().includes(filters.search.toLowerCase())) ||
      (supplier.inn_or_ogrn && supplier.inn_or_ogrn.includes(filters.search));

    const matchesOrg =
      filters.orgId === ALL_OPTION_VALUE || supplier.organizationId === filters.orgId;
    const matchesStatus =
      filters.status === ALL_OPTION_VALUE || supplier.status === filters.status;

    return matchesSearch && matchesOrg && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <button
          onClick={handleAddSupplier}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Supplier
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            placeholder="Name, TIN/PSRN"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization
          </label>
          <select
            value={filters.orgId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, orgId: e.target.value }))
            }
            className="w-full p-2 border rounded"
          >
            <option value={ALL_OPTION_VALUE}>All Organizations</option>
            {organizations.map((org: Organization) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="w-full p-2 border rounded"
          >
            <option value={ALL_OPTION_VALUE}>All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TIN/PSRN
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSuppliers.map((supplier: Supplier) => (
              <tr key={supplier.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {supplier.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {supplier.legal_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getOrganizationName(supplier.organizationId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      supplier.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {supplier.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {supplier.inn_or_ogrn}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditSupplier(supplier)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSupplier(supplier.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <SupplierFormModal
          supplier={editingSupplier}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default SupplierListPage;