"use client";
import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Package,
  AlertTriangle,
  Clipboard,
} from "lucide-react";

// Import Modal Components
import AddInventoryItemModal from "../components/inventoryManagement/AddInventoryItemModal";
// import EditInventoryItemModal from "../components/inventoryManagement/EditInventoryItemModal";
import DeleteInventoryItemModal from "../components/inventoryManagement/DeleteInventoryItemModal";
import RequestInventoryModal from "../components/inventoryManagement/RequestInventoryModal";
import Modal from "../components/Modal";

export default function InventoryManagement() {
  const [activeTab, setActiveTab] = useState("supplies");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItem, setExpandedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const [inventoryItems, setInventoryItems] = useState([
    {
      id: "INV-001",
      name: "Chicken Feed - Starter",
      category: "supplies",
      type: "feed",
      currentStock: 5000,
      unit: "kg",
      minThreshold: 2000,
      supplier: "Green Farms Ltd",
      lastRestocked: "2025-02-15",
      unitPrice: 0.75,
      reorderPoint: 3000,
      location: "Main Warehouse",
      batchDetails: [
        { batchNo: "B-2501", quantity: 2500, expiryDate: "2025-08-15" },
        { batchNo: "B-2502", quantity: 2500, expiryDate: "2025-09-15" },
      ],
    },
    {
      id: "INV-002",
      name: "Vaccines - Newcastle Disease",
      category: "medication",
      type: "vaccine",
      currentStock: 250,
      unit: "doses",
      minThreshold: 100,
      supplier: "VetCare Pharmaceuticals",
      lastRestocked: "2025-01-20",
      unitPrice: 2.5,
      reorderPoint: 150,
      location: "Cold Storage",
      batchDetails: [
        { batchNo: "V-2401", quantity: 150, expiryDate: "2025-12-31" },
        { batchNo: "V-2402", quantity: 100, expiryDate: "2026-01-31" },
      ],
    },
    {
      id: "INV-003",
      name: "Cleaning Disinfectant",
      category: "supplies",
      type: "cleaning",
      currentStock: 120,
      unit: "liters",
      minThreshold: 50,
      supplier: "CleanFarm Solutions",
      lastRestocked: "2025-02-01",
      unitPrice: 15.0,
      reorderPoint: 75,
      location: "Chemical Storage",
      batchDetails: [
        { batchNo: "C-2501", quantity: 60, expiryDate: "2026-02-01" },
        { batchNo: "C-2502", quantity: 60, expiryDate: "2026-03-01" },
      ],
    },
  ]);

  const handleAddInventoryItem = () => {
    setModalContent(
      <AddInventoryItemModal
        onClose={() => setShowModal(false)}
        onAddItem={(newItem) => {
          setInventoryItems([...inventoryItems, newItem]);
          setShowModal(false);
        }}
      />
    );
    setShowModal(true);
  };

  const handleEditInventoryItem = (item) => {
    setModalContent(
      <AddInventoryItemModal
        // item={item}
        onClose={() => setShowModal(false)}
        onSubmit={(updatedItem) => {
          setInventoryItems(
            inventoryItems.map((inv) =>
              inv.id === updatedItem.id ? updatedItem : inv
            )
          );
          //   setShowModal(false);
        }}
        initialData={item}
      />
    );
    setShowModal(true);
  };

  const handleDeleteInventoryItem = (itemId) => {
    setInventoryItems(inventoryItems.filter((item) => item.id !== itemId));
    setShowModal(false);
  };

  const handleRequestInventory = (item) => {
    setModalContent(
      <RequestInventoryModal
        item={item}
        onClose={() => setShowModal(false)}
        onRequest={(requestDetails) => {
          // Logic for processing inventory request
          console.log("Inventory Request:", requestDetails);
          setShowModal(false);
        }}
      />
    );
    setShowModal(true);
  };

  const filteredInventoryItems = inventoryItems
    .filter((item) => item.category === activeTab)
    .filter((item) => {
      if (!searchTerm) return true;
      return (
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={handleAddInventoryItem}
        >
          <Plus size={18} />
          <span>Add Inventory Item</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[color:var(--border)]">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "supplies"
              ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]"
              : "text-[color:var(--muted-foreground)]"
          }`}
          onClick={() => setActiveTab("supplies")}
        >
          Supplies
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "medication"
              ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]"
              : "text-[color:var(--muted-foreground)]"
          }`}
          onClick={() => setActiveTab("medication")}
        >
          Medications
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search inventory..."
            className="input w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            className="absolute left-3 top-2.5 text-[color:var(--muted-foreground)]"
            size={18}
          />
        </div>
        <button className="input flex items-center gap-2 bg-[color:var(--card)]">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      {/* Inventory List */}
      <div className="space-y-4">
        {filteredInventoryItems.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-[color:var(--muted-foreground)]">
              No inventory items found
            </p>
          </div>
        ) : (
          filteredInventoryItems.map((item) => (
            <div key={item.id} className="card overflow-hidden">
              <div
                className="p-4 flex items-center cursor-pointer"
                onClick={() =>
                  setExpandedItem(expandedItem === item.id ? null : item.id)
                }
              >
                <div className="mr-4">
                  {expandedItem === item.id ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-lg font-medium">{item.name}</span>
                      <span className="ml-3 px-2 py-1 text-xs rounded-full bg-[color:var(--accent)] text-[color:var(--accent-foreground)]">
                        {item.type}
                      </span>
                    </div>
                    <div className="hidden md:block">
                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-xs text-[color:var(--muted-foreground)]">
                            Current Stock
                          </span>
                          <p
                            className={`font-medium ${
                              item.currentStock <= item.minThreshold
                                ? "text-[color:var(--destructive)]"
                                : "text-[color:var(--success)]"
                            }`}
                          >
                            {item.currentStock} {item.unit}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-[color:var(--muted-foreground)]">
                            Location
                          </span>
                          <p className="font-medium">{item.location}</p>
                        </div>
                        <div>
                          <span className="text-xs text-[color:var(--muted-foreground)]">
                            Last Restocked
                          </span>
                          <p className="font-medium">{item.lastRestocked}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:hidden mt-2">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-xs text-[color:var(--muted-foreground)]">
                          Stock
                        </span>
                        <p
                          className={`font-medium ${
                            item.currentStock <= item.minThreshold
                              ? "text-[color:var(--destructive)]"
                              : "text-[color:var(--success)]"
                          }`}
                        >
                          {item.currentStock} {item.unit}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-[color:var(--muted-foreground)]">
                          Location
                        </span>
                        <p className="font-medium">{item.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditInventoryItem(item);
                    }}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="p-2 text-[color:var(--muted-foreground)] hover:text-[color:var(--destructive)]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalContent(
                        <DeleteInventoryItemModal
                          item={item}
                          onClose={() => setShowModal(false)}
                          onDelete={() => handleDeleteInventoryItem(item.id)}
                        />
                      );
                      setShowModal(true);
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedItem === item.id && (
                <div className="border-t border-[color:var(--border)] p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Inventory Details */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Inventory Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[color:var(--muted-foreground)]">
                            Item ID:
                          </span>
                          <span className="font-medium">{item.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[color:var(--muted-foreground)]">
                            Supplier:
                          </span>
                          <span className="font-medium">{item.supplier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[color:var(--muted-foreground)]">
                            Unit Price:
                          </span>
                          <span className="font-medium">
                            ${item.unitPrice.toFixed(2)} per {item.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[color:var(--muted-foreground)]">
                            Reorder Point:
                          </span>
                          <span
                            className={`font-medium ${
                              item.currentStock <= item.reorderPoint
                                ? "text-[color:var(--destructive)]"
                                : "text-[color:var(--success)]"
                            }`}
                          >
                            {item.reorderPoint} {item.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Batch Details */}
                    <div>
                      <h3 className="font-medium mb-3">Batch Information</h3>
                      <div className="space-y-2">
                        {item.batchDetails.map((batch, index) => (
                          <div
                            key={index}
                            className={`p-2 border-l-4 rounded-r-md ${
                              new Date(batch.expiryDate) < new Date()
                                ? "border-l-[color:var(--destructive)] bg-[color:var(--destructive)] bg-opacity-5"
                                : "border-l-[color:var(--success)] bg-[color:var(--success)] bg-opacity-5"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">
                                {batch.batchNo}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  new Date(batch.expiryDate) < new Date()
                                    ? "bg-[color:var(--destructive)] bg-opacity-10 text-[color:var(--destructive)]"
                                    : "bg-[color:var(--success)] bg-opacity-10 text-[color:var(--success)]"
                                }`}
                              >
                                {new Date(batch.expiryDate) < new Date()
                                  ? "Expired"
                                  : "Active"}
                              </span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-sm text-[color:var(--muted-foreground)]">
                                Quantity: {batch.quantity} {item.unit}
                              </span>
                              <span className="text-sm text-[color:var(--muted-foreground)]">
                                Expiry: {batch.expiryDate}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Usage Statistics */}
                    <div>
                      <h3 className="font-medium mb-3">Usage & Alerts</h3>
                      <div className="space-y-3">
                        {item.currentStock <= item.minThreshold && (
                          <div className="flex items-center bg-[color:var(--destructive)] bg-opacity-10 p-3 rounded-md">
                            <AlertTriangle
                              size={24}
                              className="text-[color:var(--destructive)] mr-3"
                            />
                            <div>
                              <p className="font-medium text-[color:var(--destructive)]">
                                Low Stock Alert
                              </p>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Stock is below minimum threshold
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between items-center p-2 bg-[color:var(--card)] rounded-md">
                          <div className="flex items-center">
                            <Package
                              size={20}
                              className="text-[color:var(--muted-foreground)] mr-3"
                            />
                            <span className="font-medium">Total Value</span>
                          </div>
                          <span className="font-bold">
                            ${(item.currentStock * item.unitPrice).toFixed(2)}
                          </span>
                        </div>
                        <button
                          className="w-full btn-primary flex items-center justify-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRequestInventory(item);
                          }}
                        >
                          <Clipboard size={18} />
                          <span>Request Inventory</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Container */}
      {showModal && (
        <Modal
          onClose={() => {
            setShowModal(false);
            setModalContent(null);
          }}
        >
          {modalContent}
        </Modal>
      )}
    </div>
  );
}
