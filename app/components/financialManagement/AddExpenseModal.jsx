// components/financialManagement/AddExpenseModal.js
import { useState } from 'react';
import { Dialog } from '@headlessui/react';

export default function AddExpenseModal({ onClose, onSave }) {
  const [expense, setExpense] = useState({
    date: '',
    category: '',
    amount: '',
    description: '',
    vendor: '',
  });

  const expenseCategories = [
    'Feed', 
    'Medication', 
    'Labor', 
    'Equipment', 
    'Utilities', 
    'Maintenance', 
    'Veterinary Services'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...expense,
      amount: parseFloat(expense.amount),
      date: new Date(expense.date).toISOString().split('T')[0]
    });
  };

  return (
    <Dialog 
      open={true} 
      onClose={onClose} 
      className="fixed inset-0 z-50 overflow-y-auto p-4 pt-[25vh]"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="relative bg-white rounded-lg max-w-md mx-auto p-6 shadow-xl">
        <Dialog.Title className="text-lg font-bold mb-4">
          Record New Expense
        </Dialog.Title>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={expense.date}
              onChange={(e) => setExpense({...expense, date: e.target.value})}
              className="input w-full"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={expense.category}
              onChange={(e) => setExpense({...expense, category: e.target.value})}
              className="input w-full"
              required
            >
              <option value="">Select Category</option>
              {expenseCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              value={expense.amount}
              onChange={(e) => setExpense({...expense, amount: e.target.value})}
              className="input w-full"
              placeholder="Enter amount"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={expense.description}
              onChange={(e) => setExpense({...expense, description: e.target.value})}
              className="input w-full"
              placeholder="Expense details"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Vendor</label>
            <input
              type="text"
              value={expense.vendor}
              onChange={(e) => setExpense({...expense, vendor: e.target.value})}
              className="input w-full"
              placeholder="Vendor name"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}