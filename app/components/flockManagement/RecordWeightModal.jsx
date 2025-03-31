// components/flockManagement/RecordWeightModal.js
import React, { useState } from "react";
import Modal, { ModalFooter } from "../Modal";

export default function RecordWeightModal({
  isOpen,
  onClose,
  flock,
  onUpdateWeight,
}) {
  const [weight, setWeight] = useState("");

  const handleSubmit = () => {
    if (!weight) return;

    const newWeight = parseFloat(weight);
    const newDataPoint = {
      day: flock.currentAge,
      weight: newWeight,
    };

    onUpdateWeight(flock.id, newWeight, newDataPoint);
    onClose();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-[color:var(--foreground)]">
        Record Weight
      </h2>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium mb-1">Current Age</label>
          <input
            type="text"
            value={`${flock?.currentAge || 0} days`}
            className="input w-full"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Last Recorded Weight
          </label>
          <input
            type="text"
            value={`${flock?.currentWeight || 0}g`}
            className="input w-full"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            New Weight (grams)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="input w-full"
            placeholder="Enter weight in grams"
            required
          />
        </div>
        {/* <ModalFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmText="Save Weight"
        /> */}
      </form>
    </>
  );
}
