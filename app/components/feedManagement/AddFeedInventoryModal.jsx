// app/components/feedManagement/AddFeedInventoryModal.js
"use client";

import { useState, useEffect } from "react";

const AddFeedInventoryModal = ({ onClose, onAddFeed, feedToEdit, title }) => {
  const [feedData, setFeedData] = useState({
    name: "",
    type: "complete", // Default to complete, but provide options
    category: "",
    supplier: "",
    quantity: "",
    unit: "kg",
    unitPrice: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    location: "",
    batchNumber: "",
    minimumLevel: "",
    optimumLevel: "",
    reorderLevel: "",
    nutritionalInfo: {
      protein: "",
      fat: "",
      fiber: "",
      calcium: "",
      phosphorus: "",
      energy: "",
    },
  });

  const isEditMode = !!feedToEdit;

  useEffect(() => {
    if (feedToEdit) {
      setFeedData({
        name: feedToEdit.name || "",
        type: feedToEdit.type || "complete",
        category: feedToEdit.category || "",
        supplier: feedToEdit.supplier || "",
        quantity: feedToEdit.quantity || "",
        unit: feedToEdit.unit || "kg",
        unitPrice: feedToEdit.unitPrice || "",
        purchaseDate:
          feedToEdit.purchaseDate || new Date().toISOString().split("T")[0],
        expiryDate: feedToEdit.expiryDate || "",
        location: feedToEdit.location || "",
        batchNumber: feedToEdit.batchNumber || "",
        minimumLevel: feedToEdit.minimumLevel || "",
        optimumLevel: feedToEdit.optimumLevel || "",
        reorderLevel: feedToEdit.reorderLevel || "",
        nutritionalInfo: {
          protein: feedToEdit.nutritionalInfo?.protein ?? "",
          fat: feedToEdit.nutritionalInfo?.fat ?? "",
          fiber: feedToEdit.nutritionalInfo?.fiber ?? "",
          calcium: feedToEdit.nutritionalInfo?.calcium ?? "",
          phosphorus: feedToEdit.nutritionalInfo?.phosphorus ?? "",
          energy: feedToEdit.nutritionalInfo?.energy ?? "",
        },
      });
    }
  }, [feedToEdit]);

  const handleNutritionalChange = (e) => {
    const { name, value } = e.target;
    setFeedData((prev) => ({
      ...prev,
      nutritionalInfo: {
        ...prev.nutritionalInfo,
        [name]: value,
      },
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Validation (add more as needed)
    if (
      !feedData.name ||
      !feedData.type ||
      !feedData.quantity ||
      !feedData.unit ||
      !feedData.unitPrice
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const dataToSend = {
      ...feedData,
      quantity: parseFloat(feedData.quantity),
      unitPrice: parseFloat(feedData.unitPrice),
      minimumLevel: parseFloat(feedData.minimumLevel) || 0, // Default to 0 if empty
      optimumLevel: parseFloat(feedData.optimumLevel) || 0,
      reorderLevel: parseFloat(feedData.reorderLevel) || 0,
      nutritionalInfo: {
        ...feedData.nutritionalInfo,
        protein: parseFloat(feedData.nutritionalInfo.protein) || 0,
        fat: parseFloat(feedData.nutritionalInfo.fat) || 0,
        fiber: parseFloat(feedData.nutritionalInfo.fiber) || 0,
        calcium: parseFloat(feedData.nutritionalInfo.calcium) || 0,
        phosphorus: parseFloat(feedData.nutritionalInfo.phosphorus) || 0,
        energy: parseFloat(feedData.nutritionalInfo.energy) || 0,
      },
    };

    if (isEditMode) {
      dataToSend.id = feedToEdit.id; // Add ID for updates
      onAddFeed(dataToSend);
    } else {
      onAddFeed(dataToSend);
    }

    onClose(); // Close whether adding or editing
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-[color:var(--foreground)]">
        {title ? title : "Add New Feed"}
      </h2>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Feed Name</label>
            <input
              type="text"
              name="name"
              value={feedData.name}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Feed Type</label>
            <select
              name="type"
              value={feedData.type}
              onChange={handleChange}
              className="input w-full"
            >
              <option value="complete">Complete Feed</option>
              <option value="ingredient">Ingredient</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={feedData.category}
              onChange={handleChange}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Supplier</label>
            <input
              type="text"
              name="supplier"
              value={feedData.supplier}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={feedData.quantity}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <select
              name="unit"
              value={feedData.unit}
              onChange={handleChange}
              className="input w-full"
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
              <option value="ton">ton</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit Price</label>
            <input
              type="number"
              name="unitPrice"
              value={feedData.unitPrice}
              onChange={handleChange}
              className="input w-full"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={feedData.purchaseDate}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiryDate"
              value={feedData.expiryDate}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={feedData.location}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Batch Number
            </label>
            <input
              type="text"
              name="batchNumber"
              value={feedData.batchNumber}
              onChange={handleChange}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Minimum Level
            </label>
            <input
              type="number"
              name="minimumLevel"
              value={feedData.minimumLevel}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Optimum Level
            </label>
            <input
              type="number"
              name="optimumLevel"
              value={feedData.optimumLevel}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Reorder Level
            </label>
            <input
              type="number"
              name="reorderLevel"
              value={feedData.reorderLevel}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">
            Nutritional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Protein (%)
              </label>
              <input
                type="number"
                name="protein"
                value={feedData.nutritionalInfo.protein}
                onChange={handleNutritionalChange}
                className="input w-full"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fat (%)</label>
              <input
                type="number"
                name="fat"
                value={feedData.nutritionalInfo.fat}
                onChange={handleNutritionalChange}
                className="input w-full"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Fiber (%)
              </label>
              <input
                type="number"
                name="fiber"
                value={feedData.nutritionalInfo.fiber}
                onChange={handleNutritionalChange}
                className="input w-full"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Calcium (%)
              </label>
              <input
                type="number"
                name="calcium"
                value={feedData.nutritionalInfo.calcium}
                onChange={handleNutritionalChange}
                className="input w-full"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Phosphorus (%)
              </label>
              <input
                type="number"
                name="phosphorus"
                value={feedData.nutritionalInfo.phosphorus}
                onChange={handleNutritionalChange}
                className="input w-full"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Energy (kcal/kg)
              </label>
              <input
                type="number"
                name="energy"
                value={feedData.nutritionalInfo.energy}
                onChange={handleNutritionalChange}
                className="input w-full"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button type="submit" className="btn-primary w-full">
            {isEditMode ? "Update Feed" : "Add Feed"}
          </button>
        </div>
      </form>
    </>
  );
};

export default AddFeedInventoryModal;
