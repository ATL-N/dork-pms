'use client';

import { useState, useEffect } from 'react';
import Modal from '@/app/components/Modal';

export default function AddExpenseModal({ isOpen, onClose, onAddExpense, farmId }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    amount: '',
    vendor: '',
    description: '',
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!formData.category || !formData.amount || !formData.date) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      await onAddExpense({ ...formData, farmId });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Correctly use useEffect to reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: '',
        amount: '',
        vendor: '',
        description: '',
      });
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideDefaultButtons={true}>
      <h2 className="text-2xl font-bold mb-4">Add Expense</h2>
      {error && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g., Feed, Medication"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Vendor (Optional)</label>
            <input
              type="text"
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-gray-700">Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              rows="3"
            ></textarea>
          </div>
        </div>
        <div className="flex justify-end mt-6 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:bg-red-300"
          >
            {isSubmitting ? 'Adding...' : 'Add Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
