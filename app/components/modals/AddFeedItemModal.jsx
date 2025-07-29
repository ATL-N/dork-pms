// app/components/modals/AddFeedItemModal.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Package, DollarSign, Hash, FileText, Tag, Building, ClipboardList, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const feedTypes = ['COMPLETE', 'INGREDIENT'];

const categoryOptions = {
  COMPLETE: ['Starter Feed', 'Grower Feed', 'Finisher Feed', 'Layer Feed', 'Breeder Feed', 'Medicated Feed'],
  INGREDIENT: ['Grains / Energy', 'Protein Source', 'Fats & Oils', 'Vitamins & Minerals', 'Additives', 'By-products'],
};

const InputField = ({ id, label, value, onChange, error, icon, type = 'text', children }) => (
  <div className="form-group">
    <label htmlFor={id} className="form-label flex items-center gap-2 mb-1">{icon}{label}</label>
    {children || <input type={type} id={id} name={id} value={value} onChange={onChange} className={`input w-full ${error ? 'border-red-500' : ''}`} />}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default function AddFeedItemModal({ onClose, onSave, itemToEdit, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'INGREDIENT',
    category: '',
    supplier: '',
    quantity: '',
    unit: '',
    unitPrice: '',
    purchaseDate: new Date(),
    expiryDate: null,
    location: '',
    batchNumber: '',
  });
  const [errors, setErrors] = useState({});

  const isEditMode = Boolean(itemToEdit);

  useEffect(() => {
    if (isEditMode && itemToEdit) {
      setFormData({
        name: itemToEdit.name || '',
        type: itemToEdit.type || 'INGREDIENT',
        category: itemToEdit.category || '',
        supplier: itemToEdit.supplier || '',
        quantity: itemToEdit.quantity?.toString() || '',
        unit: itemToEdit.unit || '',
        unitPrice: itemToEdit.unitPrice?.toString() || '',
        purchaseDate: itemToEdit.purchaseDate ? new Date(itemToEdit.purchaseDate) : new Date(),
        expiryDate: itemToEdit.expiryDate ? new Date(itemToEdit.expiryDate) : null,
        location: itemToEdit.location || '',
        batchNumber: itemToEdit.batchNumber || '',
      });
    }
  }, [itemToEdit, isEditMode]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    if (!formData.quantity || isNaN(formData.quantity) || parseFloat(formData.quantity) < 0) newErrors.quantity = 'A valid quantity is required.';
    if (!formData.unit.trim()) newErrors.unit = 'Unit is required (e.g., kg, lbs, bags).';
    if (!formData.unitPrice || isNaN(formData.unitPrice) || parseFloat(formData.unitPrice) < 0) newErrors.unitPrice = 'A valid unit price is required.';
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required.';
    if (!formData.category) newErrors.category = 'Category is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // If the type is changing, reset the category
      if (name === 'type') {
        return { ...prev, [name]: value, category: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const currentCategories = categoryOptions[formData.type] || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-center">{isEditMode ? 'Edit Feed Item' : 'Add New Feed Item'}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
        <InputField id="name" label="Feed Name" value={formData.name} onChange={handleChange} error={errors.name} icon={<Package size={16} />} />
        
        <InputField id="type" label="Type" icon={<ClipboardList size={16} />}>
          <select id="type" name="type" value={formData.type} onChange={handleChange} className="input w-full">
            {feedTypes.map(type => <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase()}</option>)}
          </select>
        </InputField>

        <InputField id="category" label="Category" error={errors.category} icon={<Tag size={16} />}>
            <select id="category" name="category" value={formData.category} onChange={handleChange} className={`input w-full ${errors.category ? 'border-red-500' : ''}`} disabled={!formData.type}>
                <option value="">Select a category</option>
                {currentCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
        </InputField>

        <InputField id="quantity" label="Quantity" value={formData.quantity} onChange={handleChange} error={errors.quantity} icon={<Hash size={16} />} type="number" />
        <InputField id="unit" label="Unit (e.g., kg, bag)" value={formData.unit} onChange={handleChange} error={errors.unit} icon={<Package size={16} />} />
        <InputField id="unitPrice" label="Unit Price" value={formData.unitPrice} onChange={handleChange} error={errors.unitPrice} icon={<DollarSign size={16} />} type="number" />
        
        <InputField id="purchaseDate" label="Purchase Date" error={errors.purchaseDate} icon={<CalendarIcon size={16} />}>
            <input type="date" id="purchaseDate" name="purchaseDate" value={format(new Date(formData.purchaseDate), 'yyyy-MM-dd')} onChange={(e) => handleDateChange('purchaseDate', new Date(e.target.value))} className={`input w-full ${errors.purchaseDate ? 'border-red-500' : ''}`} />
        </InputField>

        <InputField id="expiryDate" label="Expiry Date (Optional)" icon={<AlertTriangle size={16} />}>
            <input type="date" id="expiryDate" name="expiryDate" value={formData.expiryDate ? format(new Date(formData.expiryDate), 'yyyy-MM-dd') : ''} onChange={(e) => handleDateChange('expiryDate', e.target.value ? new Date(e.target.value) : null)} className="input w-full" />
        </InputField>

        <InputField id="supplier" label="Supplier (Optional)" value={formData.supplier} onChange={handleChange} icon={<Building size={16} />} />
        <InputField id="location" label="Storage Location (Optional)" value={formData.location} onChange={handleChange} icon={<FileText size={16} />} />
        <InputField id="batchNumber" label="Batch Number (Optional)" value={formData.batchNumber} onChange={handleChange} icon={<FileText size={16} />} />
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Item')}
        </button>
      </div>
    </form>
  );
}
