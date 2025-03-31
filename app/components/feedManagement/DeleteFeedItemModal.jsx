// app/components/feedManagement/DeleteFeedItemModal.js
"use client";
import { X } from "lucide-react";

const DeleteFeedItemModal = ({ onClose, feedItem, onDeleteFeedItem }) => {
  const handleDelete = () => {
    onDeleteFeedItem(feedItem.id);
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-[color:var(--foreground)]">
        Delete Feed Item
      </h2>
      <p className="mb-4">
        Are you sure you want to delete <strong>{feedItem.name}</strong>? This
        action cannot be undone.
      </p>
      <div className="flex justify-end gap-4">
        <button
          onClick={onClose}
          className="btn-secondary" // Use your secondary button style
        >
          Cancel
        </button>
        <button onClick={handleDelete} className="btn-destructive">
          Delete
        </button>
      </div>
    </>
  );
};

export default DeleteFeedItemModal;
