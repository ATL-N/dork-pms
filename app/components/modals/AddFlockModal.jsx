// app/components/modals/AddFlockModal.jsx
import React, { useState, useEffect } from "react";
import { format, subDays } from 'date-fns';

export default function AddFlockModal({
  onClose,
  onSave,
  flockToEdit = null,
  farms = [],
  defaultFarmId = null,
  title = "Add New Flock",
  isSubmitting = false,
}) {
  const getInitialState = () => ({
    name: "",
    type: "BROILER",
    breed: "",
    quantity: "",
    location: "Barn 1",
    startDate: format(new Date(), 'yyyy-MM-dd'),
    farmId: defaultFarmId || (farms.length > 0 ? farms[0].id : ""),
    costPerBird: "",
  });

  const [flockData, setFlockData] = useState(getInitialState());
  const [age, setAge] = useState('');

  const isEditMode = !!flockToEdit;

  useEffect(() => {
    if (flockToEdit) {
      setFlockData({
        id: flockToEdit.id,
        name: flockToEdit.name || "",
        type: flockToEdit.type || "BROILER",
        breed: flockToEdit.breed || "",
        quantity: flockToEdit.quantity || "",
        location: flockToEdit.location || "Barn 1",
        startDate: flockToEdit.startDate
          ? format(new Date(flockToEdit.startDate), 'yyyy-MM-dd')
          : format(new Date(), 'yyyy-MM-dd'),
        farmId: flockToEdit.farmId || defaultFarmId,
        costPerBird: flockToEdit.costPerBird || "",
      });
    } else {
      setFlockData(getInitialState());
    }
  }, [flockToEdit, defaultFarmId, farms]);

  const handleAgeChange = (e) => {
      const newAge = e.target.value;
      setAge(newAge);
      if (newAge && !isNaN(newAge) && newAge > 0) {
          const newStartDate = subDays(new Date(), parseInt(newAge, 10));
          setFlockData(prev => ({ ...prev, startDate: format(newStartDate, 'yyyy-MM-dd') }));
      } else {
          setFlockData(prev => ({...prev, startDate: format(new Date(), 'yyyy-MM-dd')}));
      }
  }

  const handleDateChange = (e) => {
      setAge('');
      handleChange(e);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFlockData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = {
        ...flockData,
        quantity: parseInt(flockData.quantity, 10),
        costPerBird: parseFloat(flockData.costPerBird) || null,
        // Convert date to ISO string
        startDate: new Date(flockData.startDate).toISOString(),
    };
    onSave(submissionData, () => {
        setFlockData(getInitialState());
        setAge('');
    });
  };

  return (
    <div className="bg-[color:var(--card)] p-6 rounded-lg shadow-lg w-full max-w-lg">
      <h2 className="text-xl font-bold mb-4 text-[color:var(--foreground)]">
        {title}
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Farm</label>
            <select
              name="farmId"
              value={flockData.farmId}
              onChange={handleChange}
              className="input w-full"
              required
              disabled={isEditMode}
            >
              {farms.map(farm => (
                <option key={farm.id} value={farm.id}>{farm.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Flock Name</label>
            <input
              type="text"
              name="name"
              value={flockData.name}
              onChange={handleChange}
              className="input w-full"
              placeholder="e.g., Broiler Batch 1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Flock Type</label>
            <select
              name="type"
              value={flockData.type}
              onChange={handleChange}
              className="input w-full"
              disabled={isEditMode}
            >
              <option value="BROILER">Broiler</option>
              <option value="LAYER">Layer</option>
              <option value="BREEDER">Breeder</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Breed</label>
            <input
              type="text"
              name="breed"
              value={flockData.breed}
              onChange={handleChange}
              className="input w-full"
              placeholder="e.g., Ross 308"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cost per Bird ($)</label>
            <input
              type="number"
              name="costPerBird"
              value={flockData.costPerBird}
              onChange={handleChange}
              className="input w-full"
              placeholder="e.g., 1.25"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={flockData.quantity}
              onChange={handleChange}
              className="input w-full"
              placeholder="Number of birds"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Age (days)</label>
            <input
              type="number"
              name="age"
              value={age}
              onChange={handleAgeChange}
              className="input w-full"
              placeholder="Optional: for existing flocks"
              disabled={isEditMode}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={flockData.startDate}
              onChange={handleDateChange}
              className="input w-full"
              required
              disabled={isEditMode}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Location / Pen</label>
            <input
              type="text"
              name="location"
              value={flockData.location}
              onChange={handleChange}
              className="input w-full"
              placeholder="e.g., Barn A, Pen 3"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : isEditMode ? "Save Changes" : "Add Flock"}
          </button>
        </div>
      </form>
    </div>
  );
}
