// app/components/feedManagement/DeleteFeedModal.js
"use client";

import { X } from "lucide-react";

const DeleteFeedModal = ({ onClose, feed, onDeleteFeed }) => {
  const handleDelete = () => {
    onDeleteFeed(feed.id);
    onClose(); // Close the modal after deleting
  };

  return (
    <div className="modal-container">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Delete Feed</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <p className="mb-4">
          Are you sure you want to delete <strong>{feed.name}</strong>? This
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
      </div>
    </div>
  );
};

export default DeleteFeedModal;
