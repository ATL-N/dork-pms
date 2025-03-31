"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";

export default function RecordConsumptionModal({
  flocks,
  feeds,
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    feedId: "",
    quantity: "",
    flockId: "",
    recordedBy: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: `C-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    onClose();
  };

  return (
    <div className="bg-[color:var(--background)] p-6 rounded-lg w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Record Consumption</h2>
        <button onClick={onClose} className="btn-icon">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Date</label>
          <input
            type="date"
            required
            className="input w-full"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Select Feed</label>
          <select
            className="input w-full"
            required
            value={formData.feedId}
            onChange={(e) =>
              setFormData({ ...formData, feedId: e.target.value })
            }
          >
            <option value="">Select Feed</option>
            {feeds.map((feed) => (
              <option key={feed.id} value={feed.id}>
                {feed.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Quantity (kg)</label>
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

        <div className="space-y-2">
          <label className="block text-sm font-medium">Select Flock</label>
          <select
            className="input w-full"
            required
            value={formData.flockId}
            onChange={(e) =>
              setFormData({ ...formData, flockId: e.target.value })
            }
          >
            <option value="">Select Flock</option>
            {flocks
              .filter((f) => f.status === "active")
              .map((flock) => (
                <option key={flock.id} value={flock.id}>
                  {flock.name}
                </option>
              ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Recorded By</label>
          <input
            type="text"
            required
            className="input w-full"
            value={formData.recordedBy}
            onChange={(e) =>
              setFormData({ ...formData, recordedBy: e.target.value })
            }
          />
        </div>

        <button type="submit" className="btn-primary w-full">
          <Save size={18} className="mr-2" />
          Save Consumption
        </button>
      </form>
    </div>
  );
}
