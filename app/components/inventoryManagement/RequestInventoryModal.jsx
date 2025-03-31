// components/inventoryManagement/RequestInventoryModal.js
import { useState } from "react";
import { Clipboard, X } from "lucide-react";

export default function RequestInventoryModal({ item, onClose, onRequest }) {
  const [requestDetails, setRequestDetails] = useState({
    quantity: "",
    reason: "",
    expectedDeliveryDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequestDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const request = {
      ...requestDetails,
      itemId: item.id,
      itemName: item.name,
      currentStock: item.currentStock,
      requestDate: new Date().toISOString().split("T")[0],
      quantity: parseFloat(requestDetails.quantity),
    };
    onRequest(request);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Clipboard size={24} />
          Request Inventory: {item.name}
        </h2>
        <button
          onClick={onClose}
          className="text-[color:var(--muted-foreground)] hover:text-[color:var(--destructive)]"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium">
              Current Stock
            </label>
            <input
              type="text"
              value={`${item.currentStock} ${item.unit}`}
              disabled
              className="input w-full bg-[color:var(--muted)] cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">
              Requested Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={requestDetails.quantity}
              onChange={handleChange}
              min={1}
              max={1000}
              className="input w-full"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Reason for Request
          </label>
          <textarea
            name="reason"
            value={requestDetails.reason}
            onChange={handleChange}
            rows={3}
            className="input w-full"
            placeholder="Explain why you need this inventory..."
            required
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Expected Delivery Date
          </label>
          <input
            type="date"
            name="expectedDeliveryDate"
            value={requestDetails.expectedDeliveryDate}
            onChange={handleChange}
            className="input w-full"
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Clipboard size={18} />
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}
