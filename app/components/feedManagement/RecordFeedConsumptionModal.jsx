// app/components/feedManagement/RecordFeedConsumptionModal.js
"use client";

import { useState, useEffect } from "react";

const RecordFeedConsumptionModal = ({
  onClose,
  feed,
  flocks,
  onRecordConsumption,
}) => {
  const [consumptionData, setConsumptionData] = useState({
    flockId: "",
    quantity: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    recordedBy: "",
  });

  useEffect(() => {
    // Pre-select the first flock (if available)
    if (flocks && flocks.length > 0) {
      setConsumptionData((prev) => ({ ...prev, flockId: flocks[0].id }));
    }
  }, [flocks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConsumptionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (
      !consumptionData.flockId ||
      !consumptionData.quantity ||
      !consumptionData.date
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    if (parseFloat(consumptionData.quantity) > feed.quantity) {
      alert("Consumption quantity cannot exceed available feed quantity.");
      return;
    }

    const record = {
      ...consumptionData,
      feedId: feed.id,
      feedName: feed.name,
      quantity: parseFloat(consumptionData.quantity),
      unit: feed.unit,
      costPerUnit: feed.unitPrice,
      totalCost: parseFloat(consumptionData.quantity) * feed.unitPrice,
    };

    onRecordConsumption(feed.id, record); // Pass feed ID and data
    onClose();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-[color:var(--foreground)]">
        Record Feed Consumption ({feed.name})
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
              value={consumptionData.flockId}
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
            <label className="block text-sm font-medium mb-1">
              Quantity ({feed.unit})
            </label>
            <input
              type="number"
              name="quantity"
              value={consumptionData.quantity}
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
              value={consumptionData.date}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <input
              type="text"
              name="notes"
              value={consumptionData.notes}
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
              value={consumptionData.recordedBy}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
        </div>
        <div className="mt-6">
          <button type="submit" className="btn-primary w-full">
            Record Consumption
          </button>
        </div>
      </form>
    </>
  );
};

export default RecordFeedConsumptionModal;
