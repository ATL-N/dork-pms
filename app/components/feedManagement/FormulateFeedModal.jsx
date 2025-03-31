// app/components/feedManagement/FormulateFeedModal.js
"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const FormulateFeedModal = ({ onClose, existingFeeds, onFormulate }) => {
  const [formulationData, setFormulationData] = useState({
    name: "",
    description: "",
    type: "broiler", // Default to broiler, offer options
    stage: "starter", // Default, offer options
    targetProtein: "",
    targetEnergy: "",
    batchSize: "",
    ingredients: [],
    nutritionalProfile: {
      // Initialize nutritional profile
      protein: 0,
      fat: 0,
      fiber: 0,
      calcium: 0,
      phosphorus: 0,
      lysine: 0,
      methionine: 0,
      energy: 0,
    },
    status: "active", // Default status
    costPerKg: 0, // Initial cost
  });

  // State for the *current* ingredient being added
  const [currentIngredientType, setCurrentIngredientType] =
    useState("existing"); // "existing" or "adhoc"
  const [currentFeedId, setCurrentFeedId] = useState(""); // For existing feeds
  const [currentAdHocName, setCurrentAdHocName] = useState("");
  const [currentAdHocUnit, setCurrentAdHocUnit] = useState("kg");
  const [currentAdHocCostPerUnit, setCurrentAdHocCostPerUnit] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState("");
  const [currentPercentage, setCurrentPercentage] = useState("");

  const handleAddIngredient = () => {
    if (currentIngredientType === "existing") {
      if (!currentFeedId || !currentQuantity) {
        alert("Please select a feed and enter a quantity.");
        return;
      }
      if (!currentPercentage) {
        alert("Please enter a percentage.");
        return;
      }

      const existingFeed = existingFeeds.find((f) => f.id === currentFeedId);
      if (!existingFeed) {
        alert("Selected feed not found.");
        return;
      }
      setFormulationData((prev) => ({
        ...prev,
        ingredients: [
          ...prev.ingredients,
          {
            id: currentFeedId,
            name: existingFeed.name, // Use existing feed's name
            percentage: parseFloat(currentPercentage),
            quantity: parseFloat(currentQuantity),
          },
        ],
      }));
    } else {
      // Ad-hoc ingredient
      if (!currentAdHocName || !currentAdHocUnit || !currentQuantity) {
        alert("Please fill in all ad-hoc ingredient details.");
        return;
      }
      if (!currentPercentage) {
        alert("Please enter a percentage.");
        return;
      }
      setFormulationData((prev) => ({
        ...prev,
        ingredients: [
          ...prev.ingredients,
          {
            name: currentAdHocName,
            unit: currentAdHocUnit,
            percentage: parseFloat(currentPercentage),
            quantity: parseFloat(currentQuantity),
          },
        ],
      }));
    }

    // Reset current ingredient inputs
    setCurrentFeedId("");
    setCurrentAdHocName("");
    setCurrentAdHocUnit("kg");
    setCurrentAdHocCostPerUnit("");
    setCurrentQuantity("");
    setCurrentPercentage("");
  };

  const handleRemoveIngredient = (index) => {
    setFormulationData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Calculate total quantity based on ingredients
    const calculatedTotalQuantity = formulationData.ingredients.reduce(
      (total, ingredient) => total + ingredient.quantity,
      0
    );

    if (
      !formulationData.name ||
      !formulationData.type ||
      !formulationData.stage ||
      formulationData.ingredients.length === 0
    ) {
      alert(
        "Please fill in all formulation details and add at least one ingredient."
      );
      return;
    }

    // Recalculate cost and nutritional profile based on *current* ingredients
    let totalCost = 0;
    const calculatedNutritionalProfile = {
      protein: 0,
      fat: 0,
      fiber: 0,
      calcium: 0,
      phosphorus: 0,
      lysine: 0, // Initialize lysine and methionine
      methionine: 0,
      energy: 0,
    };
    formulationData.ingredients.forEach((ingredient) => {
      const feedItem = existingFeeds.find((f) => f.id === ingredient.id);

      if (feedItem) {
        // Existing Feed
        totalCost += feedItem.unitPrice * ingredient.quantity;
        // Accumulate nutritional values, weighted by quantity
        for (const key in calculatedNutritionalProfile) {
          if (
            feedItem.nutritionalInfo[key] !== undefined &&
            !isNaN(feedItem.nutritionalInfo[key])
          ) {
            // Check if valid number
            calculatedNutritionalProfile[key] +=
              (feedItem.nutritionalInfo[key] * ingredient.quantity) /
              calculatedTotalQuantity;
          }
        }
      } else {
        // Ad-Hoc Ingredient:  We don't have nutritional info, so don't include in calculation
        //  But *do* include its cost if available.
        if (!isNaN(parseFloat(ingredient.costPerUnit))) {
          // Basic validation
          totalCost += parseFloat(ingredient.costPerUnit) * ingredient.quantity;
        }
      }
    });

    const costPerKg =
      calculatedTotalQuantity > 0 ? totalCost / calculatedTotalQuantity : 0;

    const updatedFormulationData = {
      ...formulationData,
      costPerKg: costPerKg,
      nutritionalProfile: calculatedNutritionalProfile,
      batchSize: calculatedTotalQuantity,
    };

    onFormulate(updatedFormulationData);
    onClose();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-[color:var(--foreground)]">
        Create Feed Formulation
      </h2>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Formulation Name
            </label>
            <input
              type="text"
              name="name"
              value={formulationData.name}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formulationData.description}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Formulation Type
            </label>
            <select
              name="type"
              value={formulationData.type}
              onChange={handleChange}
              className="input w-full"
              required
            >
              <option value="broiler">Broiler</option>
              <option value="layer">Layer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Formulation Stage
            </label>
            <select
              name="stage"
              value={formulationData.stage}
              onChange={handleChange}
              className="input w-full"
              required
            >
              <option value="starter">Starter</option>
              <option value="grower">Grower</option>
              <option value="finisher">Finisher</option>
              <option value="chick">Chick</option>
              <option value="production">Production</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Target Protein (%)
            </label>
            <input
              type="number"
              name="targetProtein"
              value={formulationData.targetProtein}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Target Energy (kcal/kg)
            </label>
            <input
              type="number"
              name="targetEnergy"
              value={formulationData.targetEnergy}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Batch Size (kg)
            </label>
            <input
              type="number"
              name="batchSize"
              value={formulationData.batchSize}
              onChange={handleChange}
              className="input w-full"
              required
              disabled
            />
          </div>
        </div>

        {/* Ingredient Section */}
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Ingredients</h3>
          <div className="border rounded-md p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <select
                value={currentIngredientType}
                onChange={(e) => setCurrentIngredientType(e.target.value)}
                className="input"
              >
                <option value="existing">Existing Feed</option>
                <option value="adhoc">Ad-hoc Ingredient</option>
              </select>

              {currentIngredientType === "existing" ? (
                <select
                  value={currentFeedId}
                  onChange={(e) => setCurrentFeedId(e.target.value)}
                  className="input"
                >
                  <option value="">Select Feed</option>
                  {existingFeeds.map((feed) => (
                    <option key={feed.id} value={feed.id}>
                      {feed.name}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Ingredient Name"
                    value={currentAdHocName}
                    onChange={(e) => setCurrentAdHocName(e.target.value)}
                    className="input"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={currentAdHocUnit}
                    onChange={(e) => setCurrentAdHocUnit(e.target.value)}
                    className="input"
                  />
                  {/* Remove cost per unit for adhoc */}
                </>
              )}

              <input
                type="number"
                placeholder="Quantity"
                value={currentQuantity}
                onChange={(e) => setCurrentQuantity(e.target.value)}
                className="input"
              />
              <input
                type="number"
                placeholder="Percentage"
                value={currentPercentage}
                onChange={(e) => setCurrentPercentage(e.target.value)}
                className="input"
              />

              <button
                type="button"
                onClick={handleAddIngredient}
                className="btn-primary"
              >
                Add
              </button>
            </div>

            {formulationData.ingredients.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Added Ingredients:</h4>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Ingredient
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Percentage (%)
                      </th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formulationData.ingredients.map((ingredient, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">{ingredient.name}</td>
                        <td className="px-4 py-2 text-right">
                          {ingredient.quantity} {ingredient.unit || "kg"}{" "}
                          {/* Fallback to kg if unit is missing */}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {ingredient.percentage}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="mt-6">
          <button type="submit" className="btn-primary w-full">
            Create Formulation
          </button>
        </div>
      </form>
    </>
  );
};

export default FormulateFeedModal;
