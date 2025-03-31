// components/flockManagement/RecordMortalityModal.js
import React, { useState } from "react";
import Modal, { ModalFooter } from "../Modal";

export default function RecordMortalityModal({
  isOpen,
  onClose,
  flock,
  onUpdateMortality,
}) {
  const [mortality, setMortality] = useState("");
  const [cause, setCause] = useState("disease");

  const handleSubmit = () => {
    if (!mortality) return;

    onUpdateMortality(flock.id, parseInt(mortality), cause);
    onClose();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-[color:var(--foreground)]">
        Record Mortality
      </h2>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium mb-1">
            Current Flock Size
          </label>
          <input
            type="text"
            value={flock?.quantity.toLocaleString() || 0}
            className="input w-full"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Number of Birds Lost
          </label>
          <input
            type="number"
            value={mortality}
            onChange={(e) => setMortality(e.target.value)}
            className="input w-full"
            placeholder="Enter number"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cause</label>
          <select
            value={cause}
            onChange={(e) => setCause(e.target.value)}
            className="input w-full"
          >
            <option value="disease">Disease</option>
            <option value="predation">Predation</option>
            <option value="environmental">Environmental Factors</option>
            <option value="accident">Accident</option>
            <option value="other">Other</option>
          </select>
        </div>
        {/* <ModalFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmText="Record Mortality"
        /> */}
      </form>
    </>
  );
}
