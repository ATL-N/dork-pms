// components/flockManagement/FlockModal.js
import React, { useState, useEffect } from "react";
import Modal from "../Modal";

export default function FlockModal({
  isOpen,
  onClose,
  onSave,
  flockToEdit = null,
  title='Add Flock'
}) {
  const [flockData, setFlockData] = useState({
    name: "",
    type: "broiler",
    breed: "Ross 308",
    quantity: "",
    location: "Barn 1",
    startDate: new Date().toISOString().split("T")[0],
  });

  const isEditMode = !!flockToEdit;

  // Initialize form with edit data if available
  useEffect(() => {
    if (flockToEdit) {
      setFlockData({
        name: flockToEdit.name || "",
        type: flockToEdit.type || "broiler",
        breed: flockToEdit.breed || "Ross 308",
        quantity: flockToEdit.quantity || "",
        location: flockToEdit.location || "Barn 1",
        startDate:
          flockToEdit.startDate || new Date().toISOString().split("T")[0],
      });
    }
  }, [flockToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFlockData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (isEditMode) {
      // Update existing flock
      const updatedFlock = {
        ...flockToEdit,
        ...flockData,
        quantity: parseInt(flockData.quantity),
      };

      onSave(updatedFlock);
    } else {
      // Add new flock
      const newFlock = {
        ...flockData,
        id: `F-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "active",
        currentAge: 0,
        mortality: 0,
        quantity: parseInt(flockData.quantity),
      };

      // Add type-specific properties
      if (flockData.type === "broiler") {
        newFlock.currentWeight = 40;
        newFlock.targetWeight = 2500;
        newFlock.growthData = [{ day: 0, weight: 40 }];
        newFlock.vaccinationSchedule = [];
        newFlock.feedSchedule = [
          { phase: "Starter", startDay: 1, endDay: 10, dailyConsumption: 25 },
          { phase: "Grower", startDay: 11, endDay: 24, dailyConsumption: 85 },
          {
            phase: "Finisher",
            startDay: 25,
            endDay: 42,
            dailyConsumption: 180,
          },
        ];
      } else if (flockData.type === "layer") {
        newFlock.currentWeight = 40;
        newFlock.eggProduction = 0;
        newFlock.productionData = [{ week: 0, production: 0 }];
        newFlock.vaccinationSchedule = [];
        newFlock.feedSchedule = [
          { phase: "Chick", startDay: 1, endDay: 42, dailyConsumption: 30 },
          { phase: "Grower", startDay: 43, endDay: 126, dailyConsumption: 75 },
          { phase: "Layer", startDay: 127, endDay: 500, dailyConsumption: 110 },
        ];
      }

      onSave(newFlock);
    }

    onClose();
  };

  const modalTitle = isEditMode ? "Edit Flock" : "Add New Flock";

  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-[color:var(--foreground)]">
        {title}
      </h2>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Flock Name</label>
            <input
              type="text"
              name="name"
              value={flockData.name}
              onChange={handleChange}
              className="input w-full"
              placeholder="Flock name"
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
              disabled={isEditMode} // Prevent changing type in edit mode
            >
              <option value="broiler">Broiler</option>
              <option value="layer">Layer</option>
              <option value="breeder">Breeder</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Breed</label>
            <select
              name="breed"
              value={flockData.breed}
              onChange={handleChange}
              className="input w-full"
            >
              <option value="Ross 308">Ross 308</option>
              <option value="Cobb 500">Cobb 500</option>
              <option value="Hy-Line Brown">Hy-Line Brown</option>
              <option value="Hy-Line W-36">Hy-Line W-36</option>
              <option value="Lohmann Brown">Lohmann Brown</option>
            </select>
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
            <label className="block text-sm font-medium mb-1">Location</label>
            <select
              name="location"
              value={flockData.location}
              onChange={handleChange}
              className="input w-full"
            >
              <option value="Barn 1">Barn 1</option>
              <option value="Barn 2">Barn 2</option>
              <option value="Barn 3">Barn 3</option>
              <option value="Barn 4">Barn 4</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={flockData.startDate}
              onChange={handleChange}
              className="input w-full"
              required
              disabled={isEditMode} // Prevent changing start date in edit mode
            />
          </div>
        </div>
      </form>
    </>
  );
}
