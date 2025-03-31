// components/financialManagement/AddRevenueModal.js
import { useState } from 'react';
import { Dialog } from '@headlessui/react';

export default function AddRevenueModal({ onClose, onSave }) {
  const [revenue, setRevenue] = useState({
    date: "",
    category: "",
    amount: "",
    description: "",
    customer: "",
  });

  const revenueCategories = [
    "Egg Sales",
    "Broiler Sales",
    "Layer Sales",
    "Breeding Stock",
    "Manure Sales",
    "Consulting",
    "Other",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...revenue,
      amount: parseFloat(revenue.amount),
      date: new Date(revenue.date).toISOString().split("T")[0],
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
          Record New Revenue
        </Dialog.Title>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={revenue.date}
              onChange={(e) => setRevenue({ ...revenue, date: e.target.value })}
              className="input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={revenue.category}
              onChange={(e) =>
                setRevenue({ ...revenue, category: e.target.value })
              } // components/financialManagement/AddRevenueModal.js (continued)
              className="input w-full"
              required
            >
              <option value="">Select Category</option>
              {revenueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              value={revenue.amount}
              onChange={(e) =>
                setRevenue({ ...revenue, amount: e.target.value })
              }
              className="input w-full"
              placeholder="Enter amount"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={revenue.description}
              onChange={(e) =>
                setRevenue({ ...revenue, description: e.target.value })
              }
              className="input w-full"
              placeholder="Revenue details"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Customer</label>
            <input
              type="text"
              value={revenue.customer}
              onChange={(e) =>
                setRevenue({ ...revenue, customer: e.target.value })
              }
              className="input w-full"
              placeholder="Customer name"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Revenue
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}