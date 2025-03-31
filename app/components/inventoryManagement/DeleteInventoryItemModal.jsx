// components/inventoryManagement/DeleteInventoryItemModal.js
import { Trash2, AlertTriangle } from "lucide-react";

export default function DeleteInventoryItemModal({ item, onClose, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
      <div className="flex flex-col items-center text-center">
        <AlertTriangle
          size={64}
          className="text-[color:var(--destructive)] mb-4"
        />
        <h2 className="text-xl font-bold mb-2">Delete Inventory Item</h2>
        <p className="text-[color:var(--muted-foreground)] mb-6">
          Are you sure you want to delete
          <span className="font-medium mx-1">{item.name}</span>
          from your inventory?
        </p>

        <div className="flex space-x-3 w-full">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="btn-destructive flex-1 flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
