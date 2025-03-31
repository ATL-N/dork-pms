import { useState, useEffect } from "react";
import { X, Package } from "lucide-react";

export default function AddInventoryItemModal({
  onClose,
  onSubmit,
  initialData = null,
  mode = "add",
}) {
  const [formData, setFormData] = useState({
    name: "",
    category: "supplies",
    type: "",
    currentStock: "",
    unit: "",
    minThreshold: "",
    supplier: "",
    unitPrice: "",
    location: "",
  });

  // Populate form with existing data when in edit mode
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        category: initialData.category || "supplies",
        type: initialData.type || "",
        currentStock: initialData.currentStock?.toString() || "",
        unit: initialData.unit || "",
        minThreshold: initialData.minThreshold?.toString() || "",
        supplier: initialData.supplier || "",
        unitPrice: initialData.unitPrice?.toString() || "",
        location: initialData.location || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const processedItem = {
      ...(initialData || {}), // Preserve existing ID and other properties when editing
      ...formData,
      id:
        initialData?.id ||
        `INV-${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`,
      currentStock: parseFloat(formData.currentStock),
      minThreshold: parseFloat(formData.minThreshold),
      unitPrice: parseFloat(formData.unitPrice),
      lastRestocked:
        initialData?.lastRestocked || new Date().toISOString().split("T")[0],
      batchDetails: initialData?.batchDetails || [
        {
          batchNo: `B-${Math.floor(Math.random() * 10000)}`,
          quantity: parseFloat(formData.currentStock),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        },
      ],
    };

    onSubmit(processedItem);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Package size={24} />
          {mode === "add" ? "Add Inventory Item" : "Edit Inventory Item"}
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
            <label className="block mb-2 text-sm font-medium">Item Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input w-full"
            >
              <option value="supplies">Supplies</option>
              <option value="medication">Medication</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Item Type</label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">
              Current Stock
            </label>
            <input
              type="number"
              name="currentStock"
              value={formData.currentStock}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Unit</label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">
              Minimum Threshold
            </label>
            <input
              type="number"
              name="minThreshold"
              value={formData.minThreshold}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Supplier</label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">
              Unit Price ($)
            </label>
            <input
              type="number"
              name="unitPrice"
              step="0.01"
              value={formData.unitPrice}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Storage Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="input w-full"
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {mode === "add" ? "Add Item" : "Update Item"}
          </button>
        </div>
      </form>
    </div>
  );
}
