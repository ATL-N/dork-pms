// app/components/productionTracking/RecordEggProductionModal.js
"use client";

import { useState, useEffect } from "react";

const RecordEggProductionModal = ({ onClose, onAddRecord, flocks }) => {
  const [recordData, setRecordData] = useState({
    date: new Date().toISOString().split("T")[0],
    flockId: "",
    eggsCollected: "",
    damagedEggs: "",
    averageWeight: "",
    notes: "",
    recordedBy: "",
  });

  useEffect(() => {
    // Pre-select the first flock (if available)
    if (flocks && flocks.length > 0) {
      setRecordData((prev) => ({ ...prev, flockId: flocks[0].id }));
    }
  }, [flocks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!recordData.flockId) return;
    const flock = flocks.find((flock) => flock.id === recordData.flockId);

    const newRecord = {
      ...recordData,
      eggsCollected: parseInt(recordData.eggsCollected),
      damagedEggs: parseInt(recordData.damagedEggs) || 0, // Default to 0
      averageWeight: parseFloat(recordData.averageWeight) || 0,
      flockName: flock.name,
    };
    onAddRecord(newRecord);
    onClose();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-[color:var(--foreground)]">
        Record Egg Production
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={recordData.date}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Flock</label>
            <select
              name="flockId"
              value={recordData.flockId}
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
              Eggs Collected
            </label>
            <input
              type="number"
              name="eggsCollected"
              value={recordData.eggsCollected}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Damaged Eggs
            </label>
            <input
              type="number"
              name="damagedEggs"
              value={recordData.damagedEggs}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Average Weight (g)
            </label>
            <input
              type="number"
              name="averageWeight"
              value={recordData.averageWeight}
              onChange={handleChange}
              className="input w-full"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <input
              type="text"
              name="notes"
              value={recordData.notes}
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
              value={recordData.recordedBy}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
        </div>
        <div className="mt-6">
          <button type="submit" className="btn-primary w-full">
            Record Production
          </button>
        </div>
      </form>
    </>
  );
};

export default RecordEggProductionModal;
