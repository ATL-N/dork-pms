'use client';

import { useState, useEffect } from 'react';
import Modal from '@/app/components/Modal';

export default function AddInventoryItemModal({ isOpen, onClose, onSave, itemToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    currentStock: '',
    unit: '',
    minThreshold: '',
    supplier: '',
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(itemToEdit);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setFormData({
          name: itemToEdit.name,
          category: itemToEdit.category,
          currentStock: itemToEdit.currentStock.toString(),
          unit: itemToEdit.unit,
          minThreshold: itemToEdit.minThreshold?.toString() || '',
          supplier: itemToEdit.supplier || '',
        });
      } else {
        setFormData({
          name: '',
          category: 'Medication',
          currentStock: '',
          unit: 'bottles',
          minThreshold: '',
          supplier: '',
        });
      }
      setError(null);
    }
  }, [isOpen, itemToEdit, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!formData.name || !formData.category || !formData.currentStock || !formData.unit) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideDefaultButtons={true}>
      <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Edit' : 'Add'} Inventory Item</h2>
      {error && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-[color:var(--muted-foreground)]">Item Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="input w-full" required />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-[color:var(--muted-foreground)]">Category</label>
            <select id="category" name="category" value={formData.category} onChange={handleChange} className="input w-full" required>
              <option value="Medication">Medication</option>
              <option value="Supplies">Supplies</option>
              <option value="Equipment">Equipment</option>
            </select>
          </div>
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-[color:var(--muted-foreground)]">Unit</label>
            <select id="unit" name="unit" value={formData.unit} onChange={handleChange} className="input w-full" required>
              <option value="kg">kg</option>
              <option value="liters">liters</option>
              <option value="bottles">bottles</option>
              <option value="boxes">boxes</option>
              <option value="units">units</option>
            </select>
          </div>
          <div>
            <label htmlFor="currentStock" className="block text-sm font-medium text-[color:var(--muted-foreground)]">Quantity on Hand</label>
            <input type="number" id="currentStock" name="currentStock" value={formData.currentStock} onChange={handleChange} className="input w-full" required />
          </div>
          <div>
            <label htmlFor="minThreshold" className="block text-sm font-medium text-[color:var(--muted-foreground)]">Minimum Threshold (Optional)</label>
            <input type="number" id="minThreshold" name="minThreshold" value={formData.minThreshold} onChange={handleChange} className="input w-full" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="supplier" className="block text-sm font-medium text-[color:var(--muted-foreground)]">Supplier (Optional)</label>
            <input type="text" id="supplier" name="supplier" value={formData.supplier} onChange={handleChange} className="input w-full" />
          </div>
        </div>
        <div className="flex justify-end mt-6 gap-3">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving...' : 'Save Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
}


