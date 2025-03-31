// components/productionTracking/AddProductionRecordModal.js
import { useState } from "react";
import { Dialog } from "@headlessui/react";

export default function AddProductionRecordModal({ onClose, onSave, type }) {
  const [formData, setFormData] = useState({
    flockId: "",
    flockName: "",
    date: new Date().toISOString().split("T")[0],
    ...(type === "layer"
      ? {
          totalEggs: "",
          brokenEggs: "",
          productionRate: "",
          averageEggWeight: "",
          eggQualityScore: "",
          eggGrading: {
            large: "",
            medium: "",
            small: "",
          },
          shippedEggs: "",
          revenue: "",
        }
      : {
          totalBirdsProcessed: "",
          averageWeight: "",
          meatQuality: "",
          cutYield: "",
          processingEfficiency: "",
          revenue: "",
        }),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested egg grading
    if (name.startsWith("eggGrading.")) {
      const gradingKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        eggGrading: {
          ...prev.eggGrading,
          [gradingKey]: value,
        },
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      type,
    });
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto p-4 pt-[10vh]"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="relative bg-white rounded-lg max-w-2xl mx-auto p-6">
        <Dialog.Title className="text-lg font-bold mb-4">
          Add {type === "layer" ? "Layer" : "Broiler"} Production Record
        </Dialog.Title>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Flock ID</label>
              <input
                type="text"
                name="flockId"
                value={formData.flockId}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Flock Name</label>
              <input
                type="text"
                name="flockName"
                value={formData.flockName}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>
          </div>

          {type === "layer" ? (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block mb-2">Total Eggs</label>
                <input
                  type="number"
                  name="totalEggs"
                  value={formData.totalEggs}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Broken Eggs</label>
                <input
                  type="number"
                  name="brokenEggs"
                  value={formData.brokenEggs}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Production Rate (%)</label>
                <input
                  type="number"
                  name="productionRate"
                  value={formData.productionRate}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Avg. Egg Weight (g)</label>
                <input
                  type="number"
                  name="averageEggWeight"
                  value={formData.averageEggWeight}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Egg Quality Score</label>
                <input
                  type="number"
                  name="eggQualityScore"
                  value={formData.eggQualityScore}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Revenue ($)</label>
                <input
                  type="number"
                  name="revenue"
                  value={formData.revenue}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Large Eggs (%)</label>
                <input
                  type="number"
                  name="eggGrading.large"
                  value={formData.eggGrading.large}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Medium Eggs (%)</label>
                <input
                  type="number"
                  name="eggGrading.medium"
                  value={formData.eggGrading.medium}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Small Eggs (%)</label>
                <input
                  type="number"
                  name="eggGrading.small"
                  value={formData.eggGrading.small}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block mb-2">Total Birds Processed</label>
                <input
                  type="number"
                  name="totalBirdsProcessed"
                  value={formData.totalBirdsProcessed}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Avg. Weight (kg)</label>
                <input
                  type="number"
                  name="averageWeight"
                  value={formData.averageWeight}
                  onChange={handleChange}
                  step="0.1"
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Meat Quality Grade</label>
                <select
                  name="meatQuality"
                  value={formData.meatQuality}
                  onChange={handleChange}
                  className="input w-full"
                  required
                >
                  <option value="">Select Grade</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
              <div>
                <label className="block mb-2">Cut Yield (%)</label>
                <input
                  type="number"
                  name="cutYield"
                  value={formData.cutYield}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Processing Efficiency (%)</label>
                <input
                  type="number"
                  name="processingEfficiency"
                  value={formData.processingEfficiency}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Revenue ($)</label>
                <input
                  type="number"
                  name="revenue"
                  value={formData.revenue}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Record
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
