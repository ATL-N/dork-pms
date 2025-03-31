"use client";

import { useState } from "react";
import { X, Save, Plus } from "lucide-react";

export default function CreateFormulationModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "mash",
    targetSpecies: "broiler",
    ingredients: [{ name: "", percentage: "" }],
    proteinContent: "",
    energy: "",
    costPerKg: "",
  });

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: "", percentage: "" }],
    });
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: `FORM-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    onClose();
  };

  return (
    <div className="bg-[color:var(--background)] p-6 rounded-lg w-full max-w-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Create New Formulation</h2>
        <button onClick={onClose} className="btn-icon">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Formulation Name
            </label>
            <input
              type="text"
              required
              className="input w-full"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Target Species</label>
            <select
              className="input w-full"
              value={formData.targetSpecies}
              onChange={(e) =>
                setFormData({ ...formData, targetSpecies: e.target.value })
              }
            >
              <option value="broiler">Broiler</option>
              <option value="layer">Layer</option>
              <option value="breeder">Breeder</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Ingredients</h3>
          {formData.ingredients.map((ing, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                placeholder="Ingredient name"
                className="input flex-1"
                value={ing.name}
                onChange={(e) =>
                  handleIngredientChange(index, "name", e.target.value)
                }
              />
              <input
                type="number"
                placeholder="%"
                className="input w-20"
                value={ing.percentage}
                onChange={(e) =>
                  handleIngredientChange(index, "percentage", e.target.value)
                }
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="btn-secondary flex items-center gap-2"
          >
            <Plus size={16} />
            Add Ingredient
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Protein (%)</label>
            <input
              type="number"
              required
              className="input w-full"
              value={formData.proteinContent}
              onChange={(e) =>
                setFormData({ ...formData, proteinContent: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Energy (kcal/kg)
            </label>
            <input
              type="number"
              required
              className="input w-full"
              value={formData.energy}
              onChange={(e) =>
                setFormData({ ...formData, energy: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Cost per kg ($)</label>
            <input
              type="number"
              step="0.01"
              required
              className="input w-full"
              value={formData.costPerKg}
              onChange={(e) =>
                setFormData({ ...formData, costPerKg: e.target.value })
              }
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full">
          <Save size={18} className="mr-2" />
          Save Formulation
        </button>
      </form>
    </div>
  );
}
