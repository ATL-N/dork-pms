// app/components/feedManagement/AdjustFeedInventoryModal.js
"use client";

import { useState } from "react";
import { X } from "lucide-react";

const AdjustFeedInventoryModal = ({ onClose, feed, onAdjustInventory }) => {
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState(""); // Reason for adjustment

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!quantity) {
      alert("Please enter a quantity.");
      return;
    }

    const adjustment = {
      quantity: parseFloat(quantity), // Convert to number (can be positive or negative)
      notes,
    };
    onAdjustInventory(feed.id, adjustment);
    onClose();
  };

  return (
    <div className="modal-container">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Adjust Inventory ({feed.name})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium">
              Adjustment ({feed.unit}) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="input mt-1 w-full"
              placeholder="Enter positive or negative value"
              required
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium">
              Reason for Adjustment
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input mt-1 w-full"
              rows="3"
            ></textarea>
          </div>

          <div className="mt-6">
            <button type="submit" className="btn-primary w-full">
              Adjust Inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustFeedInventoryModal;
