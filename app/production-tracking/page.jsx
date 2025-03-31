// app/production-tracking/page.js
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
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Import modals
import AddProductionRecordModal from "../components/productionTracking/AddProductionRecordModal";
// import EditProductionRecordModal from "../components/productionTracking/EditProductionRecordModal";
import DeleteProductionRecordModal from "../components/productionTracking/DeleteProductionRecordModal";
import Modal from "../components/Modal";

export default function ProductionTracking() {
  const [activeTab, setActiveTab] = useState("layer");
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const [productionRecords, setProductionRecords] = useState([
    {
      id: "PR-1001",
      flockId: "F-1002",
      flockName: "Layer Flock B",
      date: "2025-02-15",
      type: "layer",
      totalEggs: 3420,
      brokenEggs: 82,
      eggQualityScore: 92.6,
      averageEggWeight: 58.5,
      eggGrading: {
        large: 60,
        medium: 35,
        small: 5,
      },
      productionRate: 91.2,
      shippedEggs: 3338,
      revenue: 8345.0,
      status: "active",
    },
    {
      id: "PR-1002",
      flockId: "F-1003",
      flockName: "Broiler Batch C",
      date: "2025-02-15",
      type: "broiler",
      totalBirdsProcessed: 1250,
      averageWeight: 2.4,
      meatQuality: "A",
      cutYield: 75.5,
      processingEfficiency: 98.5,
      revenue: 18750.0,
      status: "active",
    },
    {
      id: "PR-998",
      flockId: "F-998",
      flockName: "Layer Batch X",
      date: "2024-12-31",
      type: "layer",
      totalEggs: 42500,
      brokenEggs: 850,
      eggQualityScore: 89.3,
      averageEggWeight: 57.2,
      eggGrading: {
        large: 55,
        medium: 40,
        small: 5,
      },
      productionRate: 86.5,
      shippedEggs: 41650,
      revenue: 104375.0,
      status: "archived",
    },
  ]);

  const handleAddProductionRecord = (newRecord) => {
    setProductionRecords((prev) => [
      {
        ...newRecord,
        id: `PR-${Math.floor(Math.random() * 9000) + 1000}`,
        status: "active",
      },
      ...prev,
    ]);
    setShowModal(false);
  };

  const handleEditProductionRecord = (editedRecord) => {
    setProductionRecords((prev) =>
      prev.map((record) =>
        record.id === editedRecord.id ? editedRecord : record
      )
    );
    setShowModal(false);
  };

  const handleDeleteProductionRecord = (recordId) => {
    setProductionRecords((prev) =>
      prev.filter((record) => record.id !== recordId)
    );
    setShowModal(false);
  };

  const openAddModal = () => {
    setModalContent(
      <AddProductionRecordModal
        onClose={() => setShowModal(false)}
        onSave={handleAddProductionRecord}
        type={activeTab}
      />
    );
    setShowModal(true);
  };

  const openEditModal = (record) => {
    setModalContent(
      <AddProductionRecordModal
        record={record}
        onClose={() => setShowModal(false)}
        onSave={handleEditProductionRecord}
      />
    );
    setShowModal(true);
  };

  const openDeleteModal = (record) => {
    setModalContent(
      <DeleteProductionRecordModal
        record={record}
        onClose={() => setShowModal(false)}
        onDelete={() => handleDeleteProductionRecord(record.id)}
      />
    );
    setShowModal(true);
  };

  const filteredRecords = productionRecords
    .filter((record) => record.type === activeTab)
    .filter((record) => {
      if (!searchTerm) return true;
      return (
        record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.flockName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  const renderLayerDetails = (record) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div>
        <h3 className="font-medium mb-3">Production Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Eggs</span>
            <span className="font-medium">{record.totalEggs}</span>
          </div>
          <div className="flex justify-between">
            <span>Broken Eggs</span>
            <span className="font-medium text-red-500">
              {record.brokenEggs}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Shipped Eggs</span>
            <span className="font-medium">{record.shippedEggs}</span>
          </div>
          <div className="flex justify-between">
            <span>Production Rate</span>
            <span className="font-medium">{record.productionRate}%</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Egg Quality</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: "Large", percentage: record.eggGrading.large },
                { name: "Medium", percentage: record.eggGrading.medium },
                { name: "Small", percentage: record.eggGrading.small },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                label={{
                  value: "Percentage",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
              <Bar dataKey="percentage" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Performance Metrics</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Avg. Egg Weight</span>
            <span className="font-medium">{record.averageEggWeight}g</span>
          </div>
          <div className="flex justify-between">
            <span>Egg Quality Score</span>
            <span className="font-medium">{record.eggQualityScore}</span>
          </div>
          <div className="flex justify-between">
            <span>Revenue</span>
            <span className="font-medium text-green-600">
              ${record.revenue.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBroilerDetails = (record) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div>
        <h3 className="font-medium mb-3">Processing Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Birds Processed</span>
            <span className="font-medium">{record.totalBirdsProcessed}</span>
          </div>
          <div className="flex justify-between">
            <span>Average Weight</span>
            <span className="font-medium">{record.averageWeight}kg</span>
          </div>
          <div className="flex justify-between">
            <span>Processing Efficiency</span>
            <span className="font-medium">{record.processingEfficiency}%</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Quality Metrics</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Meat Quality Grade</span>
            <span className="font-medium">{record.meatQuality}</span>
          </div>
          <div className="flex justify-between">
            <span>Cut Yield</span>
            <span className="font-medium">{record.cutYield}%</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Financial Performance</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Revenue</span>
            <span className="font-medium text-green-600">
              ${record.revenue.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Price per Bird</span>
            <span className="font-medium">
              ${(record.revenue / record.totalBirdsProcessed).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Production Tracking</h1>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={openAddModal}
        >
          <Plus size={18} />
          <span>Add Production Record</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[color:var(--border)]">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "layer"
              ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]"
              : "text-[color:var(--muted-foreground)]"
          }`}
          onClick={() => setActiveTab("layer")}
        >
          Layer Production
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "broiler"
              ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]"
              : "text-[color:var(--muted-foreground)]"
          }`}
          onClick={() => setActiveTab("broiler")}
        >
          Broiler Production
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search production records..."
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

      {/* Production Records List */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-[color:var(--muted-foreground)]">
              No production records found
            </p>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div key={record.id} className="card overflow-hidden">
              <div
                className="p-4 flex items-center cursor-pointer"
                onClick={() =>
                  setExpandedRecord(
                    expandedRecord === record.id ? null : record.id
                  )
                }
              >
                <div className="mr-4">
                  {expandedRecord === record.id ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-lg font-medium">
                        {record.flockName}
                      </span>
                      <span className="ml-3 px-2 py-1 text-xs rounded-full bg-[color:var(--accent)] text-[color:var(--accent-foreground)]">
                        {record.type === "layer" ? "Layer" : "Broiler"}
                      </span>
                      <span className="ml-2 text-sm text-[color:var(--muted-foreground)]">
                        ({record.id})
                      </span>
                    </div>
                    <div className="hidden md:block">
                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-xs text-[color:var(--muted-foreground)]">
                            Date
                          </span>
                          <p className="font-medium">{record.date}</p>
                        </div>
                        <div>
                          <span className="text-xs text-[color:var(--muted-foreground)]">
                            {record.type === "layer"
                              ? "Total Eggs"
                              : "Birds Processed"}
                          </span>
                          <p className="font-medium">
                            {record.type === "layer"
                              ? record.totalEggs.toLocaleString()
                              : record.totalBirdsProcessed.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-[color:var(--muted-foreground)]">
                            Revenue
                          </span>
                          <p className="font-medium text-green-600">
                            ${record.revenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    {record?.status === "active" && (
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(record);
                          }}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="p-2 text-[color:var(--muted-foreground)] hover:text-[color:var(--destructive)]"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(record);
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedRecord === record.id && (
                <div className="border-t border-[color:var(--border)] p-4">
                  {record.type === "layer"
                    ? renderLayerDetails(record)
                    : renderBroilerDetails(record)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
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