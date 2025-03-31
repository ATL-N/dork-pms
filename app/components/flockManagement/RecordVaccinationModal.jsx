// components/flockManagement/RecordVaccinationModal.js
import React, { useState } from "react";
// import Modal, { ModalFooter } from "../Modal";

export default function RecordVaccinationModal({
  onClose,
  flock,
  onAddVaccination,
}) {

  console.log('running record vaccination modal')

  const [vaccine, setVaccine] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = () => {
    if (!vaccine) return;

    const newVaccination = {
      vaccine,
      date,
      status: "completed",
    };

    onAddVaccination(flock.id, newVaccination);
    onClose();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-[color:var(--foreground)]">
        Record Vaccination
      </h2>
      <form
        className="space-y-4 bg-opacity-100"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label className="block text-sm font-medium mb-1">Vaccine Name</label>
          <input
            type="text"
            value={vaccine}
            onChange={(e) => setVaccine(e.target.value)}
            className="input w-full"
            placeholder="Enter vaccine name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Vaccination Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input w-full"
            required
          />
        </div>
        {/* <ModalFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmText="Record Vaccination"
        /> */}
      </form>
    </>
  );
}
