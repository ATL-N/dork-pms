'use client';

import { useState, useEffect } from 'react';
import Modal from '@/app/components/Modal';

export default function UpdateStockModal({ isOpen, onClose, onSave, item }) {
  const [stockChange, setStockChange] = useState('');
  const [stockAction, setStockAction] = useState('add'); // 'add' or 'use'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStockChange('');
      setStockAction('add');
      setError(null);
    }
  }, [isOpen]);

  const handleSave = async () => {
    const changeAmount = parseFloat(stockChange);
    if (isNaN(changeAmount) || changeAmount <= 0) {
      setError('Please enter a valid positive number for the stock change.');
      return;
    }

    if (stockAction === 'use' && changeAmount > item.currentStock) {
      setError('Cannot use more stock than is available.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({ 
        currentStock: item.currentStock, 
        stockChange: changeAmount, 
        stockAction 
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideDefaultButtons={true}>
      <h2 className="text-2xl font-bold mb-2">Update Stock for {item.name}</h2>
      <p className="text-sm text-[color:var(--muted-foreground)] mb-4">
        Current Quantity: {item.currentStock} {item.unit}
      </p>
      
      {error && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-4">{error}</p>}

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700">Action</label>
          <div className="flex gap-4 mt-1">
            <button 
              onClick={() => setStockAction('add')} 
              className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 transition-colors ${
                stockAction === 'add' ? "bg-[color:var(--primary)] text-white" : "bg-[color:var(--card)] hover:bg-[color:var(--accent)]"
              }`}>
              Add Stock (Purchase)
            </button>
            <button 
              onClick={() => setStockAction('use')} 
              className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 transition-colors ${
                stockAction === 'use' ? "bg-[color:var(--primary)] text-white" : "bg-[color:var(--card)] hover:bg-[color:var(--accent)]"
              }`}>
              Use Stock (Decrease)
            </button>
          </div>
        </div>
        <div>
          <label className="block text-gray-700">Amount</label>
          <input
            type="number"
            value={stockChange}
            onChange={(e) => setStockChange(e.target.value)}
            className="input w-full"
            placeholder={`e.g., 10`}
            min="0"
          />
        </div>
      </div>

      <div className="flex justify-end mt-6 gap-3">
        <button type="button" onClick={onClose} disabled={isSubmitting} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
          Cancel
        </button>
        <button onClick={handleSave} disabled={isSubmitting || !stockChange} className="btn-primary">
          {isSubmitting ? 'Saving...' : 'Update Stock'}
        </button>
      </div>
    </Modal>
  );
}
