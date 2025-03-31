"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";

export default function AddFeedModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "complete",
    quantity: "",
    unit: "kg",
    location: "",
    supplier: "",
    productionDate: "",
    expiryDate: "",
    proteinContent: "",
    energy: "",
    minStockLevel: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: `F-${Math.floor(1000 + Math.random() * 9000)}`,
      currentStock: parseFloat(formData.quantity),
    });
    onClose();
  };

  return (
    <div className="bg-[color:var(--background)] p-6 rounded-lg w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Add New Feed</h2>
        <button onClick={onClose} className="btn-icon">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Feed Name</label>
          <input
            type="text"
            required
            className="input w-full"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Type</label>
            <select
              className="input w-full"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <option value="complete">Complete Feed</option>
              <option value="supplement">Supplement</option>
              <option value="premix">Premix</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Quantity</label>
            <input
              type="number"
              required
              className="input w-full"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Production Date</label>
            <input
              type="date"
              required
              className="input w-full"
              value={formData.productionDate}
              onChange={(e) =>
                setFormData({ ...formData, productionDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Expiry Date</label>
            <input
              type="date"
              required
              className="input w-full"
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: e.target.value })
              }
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full">
          <Save size={18} className="mr-2" />
          Save Feed
        </button>
      </form>
    </div>
  );
}
