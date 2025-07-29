// app/components/modals/AddFeedFormulationModal.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { BookText, Plus, Trash2, Percent, Hash } from 'lucide-react';

export default function AddFeedFormulationModal({ onClose, onSave, formulationToEdit, isSubmitting, farmId }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState([{ feedItemId: '', quantity: '', percentage: '' }]);
  const [availableFeedItems, setAvailableFeedItems] = useState([]);
  const [errors, setErrors] = useState({});

  const isEditMode = Boolean(formulationToEdit);

  useEffect(() => {
    async function fetchFeedItems() {
      if (!farmId) return;
      try {
        const res = await fetch(`/api/farms/${farmId}/feed-items?type=INGREDIENT`);
        if (!res.ok) throw new Error('Failed to fetch feed ingredients');
        const items = await res.json();
        setAvailableFeedItems(items);
      } catch (error) {
        console.error(error);
        // Optionally show a notification to the user
      }
    }
    fetchFeedItems();
  }, [farmId]);

  useEffect(() => {
    if (isEditMode && formulationToEdit) {
      setName(formulationToEdit.name || '');
      setDescription(formulationToEdit.description || '');
      setIngredients(formulationToEdit.ingredients.map(ing => ({
        feedItemId: ing.feedItemId,
        quantity: ing.quantity.toString(),
        percentage: ing.percentage.toString(),
      })) || [{ feedItemId: '', quantity: '', percentage: '' }]);
    }
  }, [formulationToEdit, isEditMode]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Formulation name is required.';
    
    const totalPercentage = ingredients.reduce((acc, ing) => acc + (parseFloat(ing.percentage) || 0), 0);
    if (Math.abs(totalPercentage - 100) > 0.01) { // Use a small tolerance for float comparison
        newErrors.totalPercentage = `Total percentage must be exactly 100%. Current total: ${totalPercentage.toFixed(2)}%`;
    }

    ingredients.forEach((ing, index) => {
        if (!ing.feedItemId) newErrors[`ingredient_${index}_item`] = 'Required';
        if (!ing.quantity || isNaN(ing.quantity) || parseFloat(ing.quantity) <= 0) newErrors[`ingredient_${index}_qty`] = 'Invalid';
        if (!ing.percentage || isNaN(ing.percentage) || parseFloat(ing.percentage) <= 0) newErrors[`ingredient_${index}_perc`] = 'Invalid';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { feedItemId: '', quantity: '', percentage: '' }]);
  };

  const removeIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave({ name, description, ingredients });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-center">{isEditMode ? 'Edit Feed Formulation' : 'Create New Feed Formulation'}</h2>
      
      <div className="space-y-4">
        <div className="form-group">
          <label htmlFor="name" className="form-label">Formulation Name</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={`input ${errors.name ? 'border-red-500' : ''}`} />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">Description (Optional)</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="input" rows="2"></textarea>
        </div>
      </div>

      <div className="border-t border-[color:var(--border)] pt-4">
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Ingredients</h3>
            {errors.totalPercentage && <p className="text-red-500 text-sm font-semibold">{errors.totalPercentage}</p>}
        </div>
        
        <div className="space-y-3">
          {ingredients.map((ing, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-start bg-background/50 p-2 rounded-md border">
              <div className="col-span-12 md:col-span-5">
                <label className="text-xs font-medium text-muted-foreground">Ingredient</label>
                <select
                  value={ing.feedItemId}
                  onChange={(e) => handleIngredientChange(index, 'feedItemId', e.target.value)}
                  className={`input input-sm w-full ${errors[`ingredient_${index}_item`] ? 'border-red-500' : ''}`}
                >
                  <option value="">Select...</option>
                  {availableFeedItems.map(item => (
                    <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
                  ))}
                </select>
              </div>
              <div className="col-span-6 md:col-span-3">
                 <label className="text-xs font-medium text-muted-foreground">Quantity</label>
                <input
                  type="number"
                  placeholder="e.g., 50"
                  value={ing.quantity}
                  onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                  className={`input input-sm w-full ${errors[`ingredient_${index}_qty`] ? 'border-red-500' : ''}`}
                />
              </div>
              <div className="col-span-6 md:col-span-3">
                <label className="text-xs font-medium text-muted-foreground">Percentage</label>
                <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g., 25"
                      value={ing.percentage}
                      onChange={(e) => handleIngredientChange(index, 'percentage', e.target.value)}
                      className={`input input-sm w-full pr-7 ${errors[`ingredient_${index}_perc`] ? 'border-red-500' : ''}`}
                    />
                    <Percent className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="col-span-12 md:col-span-1 flex items-end h-full">
                <button type="button" onClick={() => removeIngredient(index)} className="btn-destructive-outline btn-sm w-full">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addIngredient} className="btn-secondary mt-3 flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Ingredient
        </button>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Formulation')}
        </button>
      </div>
    </form>
  );
}
