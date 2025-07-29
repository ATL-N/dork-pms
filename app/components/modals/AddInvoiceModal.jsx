'use client';

import { useState, useEffect } from 'react';
import Modal from '@/app/components/Modal';
import { InvoiceType, InvoiceStatus } from '@prisma/client';

export default function AddInvoiceModal({ isOpen, onClose, onAddInvoice }) {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    type: InvoiceType.SALES,
    status: InvoiceStatus.PENDING,
    amount: '',
    customer: '',
    vendor: '',
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

    if (!formData.invoiceNumber || !formData.date || !formData.type || !formData.status || !formData.amount) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      await onAddInvoice(formData);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        type: InvoiceType.SALES,
        status: InvoiceStatus.PENDING,
        amount: '',
        customer: '',
        vendor: '',
      });
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideDefaultButtons={true}>
      <h2 className="text-2xl font-bold mb-4">Create Invoice</h2>
      {error && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Invoice #</label>
            <input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} className="input w-full" required />
          </div>
          <div>
            <label className="block text-gray-700">Amount</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="input w-full" placeholder="0.00" required />
          </div>
          <div>
            <label className="block text-gray-700">Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="input w-full" required />
          </div>
          <div>
            <label className="block text-gray-700">Due Date (Optional)</label>
            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="input w-full" />
          </div>
          <div>
            <label className="block text-gray-700">Type</label>
            <select name="type" value={formData.type} onChange={handleChange} className="input w-full">
              {Object.values(InvoiceType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="input w-full">
              {Object.values(InvoiceStatus).map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
          {formData.type === 'SALES' ? (
            <div className="md:col-span-2">
              <label className="block text-gray-700">Customer</label>
              <input type="text" name="customer" value={formData.customer} onChange={handleChange} className="input w-full" />
            </div>
          ) : (
            <div className="md:col-span-2">
              <label className="block text-gray-700">Vendor</label>
              <input type="text" name="vendor" value={formData.vendor} onChange={handleChange} className="input w-full" />
            </div>
          )}
        </div>
        <div className="flex justify-end mt-6 gap-3">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
