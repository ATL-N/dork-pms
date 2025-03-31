// app/components/productionTracking/EditMeatProductionModal.js
"use client";

import { useState, useEffect } from "react";

const EditMeatProductionModal = ({
  onClose,
  onUpdateRecord,
  flocks,
  record,
}) => {
  const [recordData, setRecordData] = useState({
    date: "",
    flockId: "",
    birdsProcessed: "",
    averageWeight: "",
    notes: "",
    recordedBy: "",
    feedConversionRatio: "",
  });

  useEffect(() => {
    if (record) {
      setRecordData({
        date: record.date || "",
        flockId: record.flockId || "",
        birdsProcessed: record.birdsProcessed || "",
        averageWeight: record.averageWeight || "",
        notes: record.notes || "",
        recordedBy: record.recordedBy || "",
        feedConversionRatio: record.feedConversionRatio || "",
      });
    }
  }, [record]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!recordData.flockId) return;

    const flock = flocks.find((flock) => flock.id === recordData.flockId);
    const updatedRecord = {
      ...record,
      ...recordData,
      birdsProcessed: parseInt(recordData.birdsProcessed),
      averageWeight: parseFloat(recordData.averageWeight),
      totalWeight:
        (parseFloat(recordData.averageWeight) / 1000) *
        parseInt(recordData.birdsProcessed), // Calculate total weight,
      feedConversionRatio: parseFloat(recordData.feedConversionRatio) || 0,
      flockName: flock.name,
    };

    onUpdateRecord(updatedRecord);
    onClose();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-[color:var(--foreground)]">
        Edit Meat Production Record
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
              Birds Processed
            </label>
            <input
              type="number"
              name="birdsProcessed"
              value={recordData.birdsProcessed}
              onChange={handleChange}
              className="input w-full"
              required
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
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Feed Conversion Ratio
            </label>
            <input
              type="number"
              name="feedConversionRatio"
              value={recordData.feedConversionRatio}
              onChange={handleChange}
              className="input w-full"
              step="0.01"
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
            Update Record
          </button>
        </div>
      </form>
    </>
  );
};

export default EditMeatProductionModal;
