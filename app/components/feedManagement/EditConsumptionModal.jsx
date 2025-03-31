// app/components/feedManagement/EditConsumptionModal.js
"use client";

import { useState, useEffect } from "react";

const EditConsumptionModal = ({
  onClose,
  record,
  feedInventory,
  flocks,
  onUpdateConsumption,
}) => {
  const [editedRecord, setEditedRecord] = useState({
    flockId: "",
    quantity: "",
    date: "",
    notes: "",
    recordedBy: "",
    feedId: "", // Include feedId
  });

  useEffect(() => {
    if (record) {
      setEditedRecord({
        flockId: record.flockId,
        quantity: record.quantity,
        date: record.date,
        notes: record.notes,
        recordedBy: record.recordedBy,
        feedId: record.feedId, // Initialize feedId
      });
    }
  }, [record]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedRecord((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (
      !editedRecord.flockId ||
      !editedRecord.quantity ||
      !editedRecord.date ||
      !editedRecord.feedId
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const feedItem = feedInventory.find((f) => f.id === editedRecord.feedId);
    if (!feedItem) {
      alert("Selected feed item not found."); // Should not happen, but check
      return;
    }

    // Validation: Ensure sufficient inventory, considering *original* quantity.
    if (
      parseFloat(editedRecord.quantity) >
      feedItem.quantity + record.quantity
    ) {
      alert("Consumption quantity cannot exceed available feed quantity.");
      return;
    }

    const updatedRecord = {
      ...record, // Keep original ID
      ...editedRecord,
      feedName: feedItem.name, //update with current name
      quantity: parseFloat(editedRecord.quantity),
      unit: feedItem.unit,
      costPerUnit: feedItem.unitPrice,
      totalCost: parseFloat(editedRecord.quantity) * feedItem.unitPrice,
    };

    onUpdateConsumption(updatedRecord, record.quantity); // Pass *original* quantity
    onClose();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-[color:var(--foreground)]">
        Edit Consumption Record
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
            <label className="block text-sm font-medium mb-1">Flock</label>
            <select
              name="flockId"
              value={editedRecord.flockId}
              onChange={handleChange}
              className="input w-full"
              required
            >
              <option value="">Select a Flock</option>
              {flocks.map((flock) => (
                <option key={flock.id} value={flock.id}>
                  {flock.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={editedRecord.quantity}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={editedRecord.date}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Feed</label>
            <select
              name="feedId"
              value={editedRecord.feedId}
              onChange={handleChange}
              className="input w-full"
              required
            >
              <option value="">Select Feed</option>
              {feedInventory.map((feed) => (
                <option key={feed.id} value={feed.id}>
                  {feed.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <input
              type="text"
              name="notes"
              value={editedRecord.notes}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Recorded By
            </label>
            <input
              type="text"
              name="recordedBy"
              value={editedRecord.recordedBy}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
        </div>
        <div className="mt-6">
          <button type="submit" className="btn-primary w-full">
            Update Record
          </button>
        </div>
      </form>
    </>
  );
};

export default EditConsumptionModal;