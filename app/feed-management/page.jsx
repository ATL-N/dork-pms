// app/feed-management/page.js
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
  Utensils,
  Package,
  ShoppingCart,
  BarChart,
  AlertTriangle,
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
  BarChart as RechartsBarChart,
  Bar,
} from "recharts";

// Import modals
import AddFeedInventoryModal from "../components/feedManagement/AddFeedInventoryModal";
import RecordFeedConsumptionModal from "../components/feedManagement/RecordFeedConsumptionModal";
import FormulateFeedModal from "../components/feedManagement/FormulateFeedModal";
import DeleteFeedItemModal from "../components/feedManagement/DeleteFeedModal"; // Corrected import
import EditConsumptionModal from "../components/feedManagement/EditConsumptionModal";
import FeedAnalyticsModal from "../components/feedManagement/FeedAnalyticsModal";
import DeleteFormulationModal from "../components/feedManagement/DeleteFormulationModal";
import Modal from "../components/Modal";

export default function FeedManagement() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [expandedItem, setExpandedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const [flocks, setFlocks] = useState([
    {
      id: "F-1001",
      name: "Broiler Batch A",
      type: "broiler",
      breed: "Ross 308",
      location: "Barn 1",
      startDate: "2025-01-15",
      quantity: 5000,
      currentAge: 21,
      currentWeight: 850,
      targetWeight: 2500,
      mortality: 1.2,
      status: "active",
      growthData: [
        { day: 1, weight: 42 },
        { day: 7, weight: 170 },
        { day: 14, weight: 430 },
        { day: 21, weight: 850 },
      ],
      vaccinationSchedule: [
        {
          date: "2025-01-15",
          vaccine: "Newcastle Disease",
          status: "completed",
        },
        {
          date: "2025-01-22",
          vaccine: "Infectious Bronchitis",
          status: "completed",
        },
        { date: "2025-02-05", vaccine: "Gumboro Disease", status: "scheduled" },
      ],
      feedSchedule: [
        { phase: "Starter", startDay: 1, endDay: 10, dailyConsumption: 25 },
        { phase: "Grower", startDay: 11, endDay: 24, dailyConsumption: 85 },
        { phase: "Finisher", startDay: 25, endDay: 42, dailyConsumption: 180 },
      ],
    },
    {
      id: "F-1002",
      name: "Layer Flock B",
      type: "layer",
      breed: "Hy-Line Brown",
      location: "Barn 2",
      startDate: "2024-11-10",
      quantity: 3800,
      currentAge: 112,
      currentWeight: 1750,
      eggProduction: 92.5,
      mortality: 0.8,
      status: "active",
      productionData: [
        { week: 18, production: 0 },
        { week: 19, production: 10 },
        { week: 20, production: 45 },
        { week: 21, production: 65 },
        { week: 22, production: 80 },
        { week: 23, production: 88 },
        { week: 24, production: 92.5 },
      ],
      vaccinationSchedule: [
        {
          date: "2024-11-10",
          vaccine: "Newcastle Disease",
          status: "completed",
        },
        {
          date: "2024-11-17",
          vaccine: "Infectious Bronchitis",
          status: "completed",
        },
        { date: "2024-12-01", vaccine: "Fowl Pox", status: "completed" },
      ],
      feedSchedule: [
        { phase: "Chick", startDay: 1, endDay: 42, dailyConsumption: 30 },
        { phase: "Grower", startDay: 43, endDay: 126, dailyConsumption: 75 },
        { phase: "Layer", startDay: 127, endDay: 500, dailyConsumption: 110 },
      ],
    },
    {
      id: "F-1003",
      name: "Broiler Batch C",
      type: "broiler",
      breed: "Cobb 500",
      location: "Barn 3",
      startDate: "2024-12-20",
      quantity: 4500,
      currentAge: 45,
      currentWeight: 2350,
      targetWeight: 2500,
      mortality: 1.5,
      status: "active",
      growthData: [
        { day: 1, weight: 40 },
        { day: 7, weight: 165 },
        { day: 14, weight: 415 },
        { day: 21, weight: 820 },
        { day: 28, weight: 1320 },
        { day: 35, weight: 1900 },
        { day: 42, weight: 2350 },
      ],
      vaccinationSchedule: [
        {
          date: "2024-12-20",
          vaccine: "Newcastle Disease",
          status: "completed",
        },
        {
          date: "2024-12-27",
          vaccine: "Infectious Bronchitis",
          status: "completed",
        },
        { date: "2025-01-10", vaccine: "Gumboro Disease", status: "completed" },
      ],
      feedSchedule: [
        { phase: "Starter", startDay: 1, endDay: 10, dailyConsumption: 25 },
        { phase: "Grower", startDay: 11, endDay: 24, dailyConsumption: 85 },
        { phase: "Finisher", startDay: 25, endDay: 42, dailyConsumption: 180 },
      ],
    },
    {
      id: "F-998",
      name: "Layer Batch X",
      type: "layer",
      breed: "Hy-Line Brown",
      location: "Barn 1",
      startDate: "2024-03-15",
      endDate: "2025-01-20",
      initialQuantity: 4000,
      finalQuantity: 3840,
      totalEggs: 1250000,
      averageProduction: 86.5,
      mortality: 4.0,
      status: "archived",
    },
    {
      id: "F-999",
      name: "Broiler Batch Y",
      type: "broiler",
      breed: "Ross 308",
      location: "Barn 2",
      startDate: "2024-10-01",
      endDate: "2024-11-12",
      initialQuantity: 5500,
      finalQuantity: 5335,
      averageWeight: 2450,
      feedConversion: 1.82,
      mortality: 3.0,
      status: "archived",
    },
  ]);

  // Example feed inventory data
  const [feedInventory, setFeedInventory] = useState([
    {
      id: "FD-1001",
      name: "Broiler Starter Feed",
      type: "complete",
      category: "broiler",
      supplier: "NutriFeeds Inc.",
      quantity: 2500,
      unit: "kg",
      unitPrice: 0.65,
      purchaseDate: "2025-02-10",
      expiryDate: "2025-05-10",
      location: "Warehouse A",
      nutritionalInfo: {
        protein: 22,
        fat: 5,
        fiber: 4,
        calcium: 1.2,
        phosphorus: 0.8,
        energy: 3050, // kcal/kg
      },
      batchNumber: "BF24-567",
      status: "in-stock",
      minimumLevel: 500,
      optimumLevel: 3000,
      reorderLevel: 750,
    },
    {
      id: "FD-1002",
      name: "Layer Feed",
      type: "complete",
      category: "layer",
      supplier: "Avian Nutrition Co.",
      quantity: 3800,
      unit: "kg",
      unitPrice: 0.58,
      purchaseDate: "2025-02-15",
      expiryDate: "2025-05-15",
      location: "Warehouse B",
      nutritionalInfo: {
        protein: 16,
        fat: 3.5,
        fiber: 3.8,
        calcium: 3.8,
        phosphorus: 0.6,
        energy: 2850, // kcal/kg
      },
      batchNumber: "LF24-289",
      status: "in-stock",
      minimumLevel: 800,
      optimumLevel: 4000,
      reorderLevel: 1200,
    },
    {
      id: "FD-1003",
      name: "Broiler Finisher Feed",
      type: "complete",
      category: "broiler",
      supplier: "NutriFeeds Inc.",
      quantity: 1800,
      unit: "kg",
      unitPrice: 0.6,
      purchaseDate: "2025-02-20",
      expiryDate: "2025-05-20",
      location: "Warehouse A",
      nutritionalInfo: {
        protein: 18,
        fat: 6,
        fiber: 3.5,
        calcium: 0.9,
        phosphorus: 0.7,
        energy: 3150, // kcal/kg
      },
      batchNumber: "BF24-612",
      status: "in-stock",
      minimumLevel: 500,
      optimumLevel: 2500,
      reorderLevel: 750,
    },
    {
      id: "FD-1004",
      name: "Corn",
      type: "ingredient",
      category: "grain",
      supplier: "GrainMaster Supply",
      quantity: 5000,
      unit: "kg",
      unitPrice: 0.32,
      purchaseDate: "2025-02-05",
      expiryDate: "2025-08-05",
      location: "Silo 1",
      nutritionalInfo: {
        protein: 8.5,
        fat: 3.8,
        fiber: 2.2,
        calcium: 0.02,
        phosphorus: 0.3,
        energy: 3300, // kcal/kg
      },
      batchNumber: "CR24-113",
      status: "in-stock",
      minimumLevel: 1000,
      optimumLevel: 8000,
      reorderLevel: 1500,
    },
    {
      id: "FD-1005",
      name: "Soybean Meal",
      type: "ingredient",
      category: "protein",
      supplier: "GrainMaster Supply",
      quantity: 3000,
      unit: "kg",
      unitPrice: 0.55,
      purchaseDate: "2025-02-08",
      expiryDate: "2025-07-08",
      location: "Warehouse C",
      nutritionalInfo: {
        protein: 48,
        fat: 2,
        fiber: 3.5,
        calcium: 0.3,
        phosphorus: 0.65,
        energy: 2450, // kcal/kg
      },
      batchNumber: "SB24-092",
      status: "in-stock",
      minimumLevel: 800,
      optimumLevel: 3500,
      reorderLevel: 1000,
    },
  ]);

  // Example feed consumption records
  const [feedConsumption, setFeedConsumption] = useState([
    {
      id: "FC-1001",
      date: "2025-03-01",
      feedId: "FD-1001",
      feedName: "Broiler Starter Feed",
      flockId: "F-1001",
      flockName: "Broiler Batch A",
      quantity: 125,
      unit: "kg",
      costPerUnit: 0.65,
      totalCost: 81.25,
      notes: "Regular morning feeding",
      recordedBy: "John Smith",
    },
    {
      id: "FC-1002",
      date: "2025-03-01",
      feedId: "FD-1002",
      feedName: "Layer Feed",
      flockId: "F-1002",
      flockName: "Layer Flock B",
      quantity: 418,
      unit: "kg",
      costPerUnit: 0.58,
      totalCost: 242.44,
      notes: "Daily ration",
      recordedBy: "Maria Garcia",
    },
    {
      id: "FC-1003",
      date: "2025-03-02",
      feedId: "FD-1001",
      feedName: "Broiler Starter Feed",
      flockId: "F-1001",
      flockName: "Broiler Batch A",
      quantity: 130,
      unit: "kg",
      costPerUnit: 0.65,
      totalCost: 84.5,
      notes: "Regular morning feeding",
      recordedBy: "John Smith",
    },
    {
      id: "FC-1004",
      date: "2025-03-02",
      feedId: "FD-1003",
      feedName: "Broiler Finisher Feed",
      flockId: "F-1003",
      flockName: "Broiler Batch C",
      quantity: 202,
      unit: "kg",
      costPerUnit: 0.6,
      totalCost: 121.2,
      notes: "Changed feed type due to age",
      recordedBy: "Ahmed Hassan",
    },
    {
      id: "FC-1005",
      date: "2025-03-02",
      feedId: "FD-1002",
      feedName: "Layer Feed",
      flockId: "F-1002",
      flockName: "Layer Flock B",
      quantity: 420,
      unit: "kg",
      costPerUnit: 0.58,
      totalCost: 243.6,
      notes: "Daily ration",
      recordedBy: "Maria Garcia",
    },
  ]);

  // Example feed formulations
  const [feedFormulations, setFeedFormulations] = useState([
    {
      id: "FF-1001",
      name: "Custom Broiler Starter",
      description: "High protein starter feed for broiler chicks (0-14 days)",
      createdDate: "2025-02-15",
      updatedDate: "2025-02-15",
      createdBy: "Dr. Emily Chen",
      type: "broiler",
      stage: "starter",
      targetProtein: 22,
      targetEnergy: 3000, // kcal/kg
      ingredients: [
        { id: "FD-1004", name: "Corn", percentage: 55, quantity: 550 },
        { id: "FD-1005", name: "Soybean Meal", percentage: 35, quantity: 350 },
        { name: "Wheat Bran", percentage: 3, quantity: 30 },
        { name: "Fish Meal", percentage: 3, quantity: 30 },
        { name: "Vitamin Premix", percentage: 2, quantity: 20 },
        { name: "Mineral Premix", percentage: 2, quantity: 20 },
      ],
      nutritionalProfile: {
        protein: 22.3,
        fat: 4.8,
        fiber: 3.2,
        calcium: 1.1,
        phosphorus: 0.75,
        lysine: 1.2,
        methionine: 0.52,
        energy: 3010,
      },
      costPerKg: 0.52,
      status: "active",
      batchSize: 1000, // kg
    },
    {
      id: "FF-1002",
      name: "Custom Layer Production",
      description: "Balanced feed for laying hens in peak production",
      createdDate: "2025-02-10",
      updatedDate: "2025-02-20",
      createdBy: "Dr. Emily Chen",
      type: "layer",
      stage: "production",
      targetProtein: 16.5,
      targetEnergy: 2850, // kcal/kg
      ingredients: [
        { id: "FD-1004", name: "Corn", percentage: 60, quantity: 600 },
        { id: "FD-1005", name: "Soybean Meal", percentage: 25, quantity: 250 },
        { name: "Wheat Bran", percentage: 3, quantity: 30 },
        { name: "Limestone", percentage: 8, quantity: 80 },
        { name: "Vitamin Premix", percentage: 2, quantity: 20 },
        { name: "Mineral Premix", percentage: 2, quantity: 20 },
      ],
      nutritionalProfile: {
        protein: 16.8,
        fat: 3.5,
        fiber: 3.0,
        calcium: 3.9,
        phosphorus: 0.65,
        lysine: 0.85,
        methionine: 0.42,
        energy: 2870,
      },
      costPerKg: 0.48,
      status: "active",
      batchSize: 1000, // kg
    },
    {
      id: "FF-1003",
      name: "Custom Broiler Finisher",
      description:
        "Energy-rich feed for broilers in finishing stage (25-42 days)",
      createdDate: "2025-02-18",
      updatedDate: "2025-02-18",
      createdBy: "Dr. Emily Chen",
      type: "broiler",
      stage: "finisher",
      targetProtein: 19,
      targetEnergy: 3150, // kcal/kg
      ingredients: [
        { id: "FD-1004", name: "Corn", percentage: 65, quantity: 650 },
        { id: "FD-1005", name: "Soybean Meal", percentage: 25, quantity: 250 },
        { name: "Wheat Bran", percentage: 3, quantity: 30 },
        { name: "Fish Meal", percentage: 2, quantity: 20 },
        { name: "Vitamin Premix", percentage: 2.5, quantity: 25 },
        { name: "Mineral Premix", percentage: 2.5, quantity: 25 },
      ],
      nutritionalProfile: {
        protein: 19.2,
        fat: 5.3,
        fiber: 3.0,
        calcium: 0.9,
        phosphorus: 0.67,
        lysine: 1.0,
        methionine: 0.45,
        energy: 3180,
      },
      costPerKg: 0.5,
      status: "active",
      batchSize: 1000, // kg
    },
  ]);

  // Helper function
  function getItemById(data, id) {
    if (!Array.isArray(data)) {
      return null;
    }
    return data.find((item) => item.id === id) || null;
  }

  // Calculate daily consumption data for chart
  const consumptionChartData = (() => {
    const dataMap = {};

    feedConsumption.forEach((record) => {
      const date = record.date;
      if (!dataMap[date]) {
        dataMap[date] = { date, totalQuantity: 0 };
      }
      dataMap[date].totalQuantity += record.quantity;
    });

    return Object.values(dataMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  })();

  // Calculate feed by category for chart
  const feedByCategoryData = (() => {
    const data = {};

    feedInventory.forEach((item) => {
      const category = item.category;
      if (!data[category]) {
        data[category] = { category, quantity: 0, value: 0 };
      }
      data[category].quantity += item.quantity;
      data[category].value += item.quantity * item.unitPrice;
    });

    return Object.values(data);
  })();

  // Handlers for modals
  const handleAddFeedInventory = () => {
    setModalContent(
      <AddFeedInventoryModal
        onClose={() => {
          setShowModal(false);
          setModalContent(null);
        }}
        onAddFeed={(newItem) => {
          setFeedInventory((prev) => [
            ...prev,
            { ...newItem, id: `FD-${Date.now()}` },
          ]);
          setShowModal(false);
        }}
      />
    );
    setShowModal(true);
  };

  const handleEditFeedItem = (item) => {
    setModalContent(
      <AddFeedInventoryModal
        onClose={() => {
          setShowModal(false);
          setModalContent(null);
        }}
        feedToEdit={item}
        title="Edit Feed Item"
        onAddFeed={(updatedItem) => {
          setFeedInventory((prev) =>
            prev.map((feedItem) =>
              feedItem.id === updatedItem.id ? updatedItem : feedItem
            )
          );
          setShowModal(false);
        }}
      />
    );
    setShowModal(true);
  };

  const openDeleteFeedItemModal = (item) => {
    setModalContent(
      <DeleteFeedItemModal
        onClose={() => {
          setShowModal(false);
          setModalContent(null);
        }}
        feedItem={item}
        onDeleteFeedItem={() => {
          setFeedInventory((prev) =>
            prev.filter((feedItem) => feedItem.id !== item.id)
          );
          setShowModal(false);
        }}
      />
    );
    setShowModal(true);
  };

  const handleAddConsumption = () => {
    setModalContent(
      <RecordFeedConsumptionModal
        onClose={() => {
          setShowModal(false);
          setModalContent(null);
        }}
        feedInventory={feedInventory}
        flocks={flocks}
        onRecordConsumption={(newRecord) => {
          // Update consumption records
          setFeedConsumption((prev) => [...prev, newRecord]);

          // Update inventory quantity
          setFeedInventory((prev) =>
            prev.map((item) =>
              item.id === newRecord.feedId
                ? { ...item, quantity: item.quantity - newRecord.quantity }
                : item
            )
          );

          setShowModal(false);
        }}
      />
    );
    setShowModal(true);
  };

  const handleEditConsumption = (record) => {
    setModalContent(
      <EditConsumptionModal
        onClose={() => {
          setShowModal(false);
          setModalContent(null);
        }}
        record={record}
        feedInventory={feedInventory}
        flocks={flocks}
        onUpdateConsumption={(updatedRecord, originalQuantity) => {
          // Update consumption records
          setFeedConsumption((prev) =>
            prev.map((item) =>
              item.id === updatedRecord.id ? updatedRecord : item
            )
          );

          // Update inventory quantity - adjust by the difference
          const quantityDifference = originalQuantity - updatedRecord.quantity;

          setFeedInventory((prev) =>
            prev.map((item) =>
              item.id === updatedRecord.feedId
                ? { ...item, quantity: item.quantity + quantityDifference }
                : item
            )
          );

          setShowModal(false);
        }}
      />
    );
    setShowModal(true);
  };

  const handleAddFormulation = () => {
    setModalContent(
      <FormulateFeedModal
        onClose={() => {
          setShowModal(false);
          setModalContent(null);
        }}
        existingFeeds={feedInventory.filter(
          (item) => item.type === "ingredient"
        )}
        onFormulate={(newFormulation) => {
          // 1. Create new formulation
          setFeedFormulations((prev) => [
            ...prev,
            { ...newFormulation, id: `FF-${Date.now()}` },
          ]);

          // 2.  Decrease ingredient quantities
          newFormulation.ingredients.forEach((ingredient) => {
            if (ingredient.id) {
              // Only adjust if it's referencing an existing feed
              setFeedInventory((prevInventory) =>
                prevInventory.map((item) =>
                  item.id === ingredient.id
                    ? { ...item, quantity: item.quantity - ingredient.quantity }
                    : item
                )
              );
            }
          });

          setShowModal(false);
        }}
      />
    );
    setShowModal(true);
  };

  const handleEditFormulation = (formulation) => {
    setModalContent(
      <FormulateFeedModal
        onClose={() => {
          setShowModal(false);
          setModalContent(null);
        }}
        existingFeeds={feedInventory.filter(
          (item) => item.type === "ingredient"
        )}
        formulationToEdit={formulation}
        title="Edit Feed Formulation"
        onFormulate={(updatedFormulation) => {
          // 1. Find original formulation and its ingredients
          const originalFormulation = feedFormulations.find(
            (f) => f.id === updatedFormulation.id
          );
          const originalIngredients = originalFormulation.ingredients;

          // 2.  Restore original ingredient quantities.
          originalIngredients.forEach((ingredient) => {
            if (ingredient.id) {
              setFeedInventory((prevInventory) =>
                prevInventory.map((item) =>
                  item.id === ingredient.id
                    ? { ...item, quantity: item.quantity + ingredient.quantity }
                    : item
                )
              );
            }
          });

          // 3.  Update the formulation
          setFeedFormulations((prev) =>
            prev.map((item) =>
              item.id === updatedFormulation.id ? updatedFormulation : item
            )
          );

          // 4.  Reduce *new* ingredient quantities
          updatedFormulation.ingredients.forEach((ingredient) => {
            if (ingredient.id) {
              setFeedInventory((prevInventory) =>
                prevInventory.map((item) =>
                  item.id === ingredient.id
                    ? { ...item, quantity: item.quantity - ingredient.quantity }
                    : item
                )
              );
            }
          });

          setShowModal(false);
        }}
      />
    );
    setShowModal(true);
  };

  const handleDeleteFormulation = (formulationId) => {
    const formulationToDelete = feedFormulations.find(
      (f) => f.id === formulationId
    );

    formulationToDelete.ingredients.forEach((ingredient) => {
      if (ingredient.id) {
        setFeedInventory((prevInventory) =>
          prevInventory.map((item) =>
            item.id === ingredient.id
              ? { ...item, quantity: item.quantity + ingredient.quantity } // Add back
              : item
          )
        );
      }
    });

    setFeedFormulations((prev) =>
      prev.filter((formulation) => formulation.id !== formulationId)
    );

    setShowModal(false);
  };

  const openDeleteFormulationModal = (formulation) => {
    setModalContent(
      <DeleteFormulationModal
        onClose={() => {
          setShowModal(false);
          setModalContent(null);
        }}
        formulation={formulation}
        onDeleteFormulation={handleDeleteFormulation}
      />
    );
    setShowModal(true);
  };

  const openAnalyticsModal = () => {
    setModalContent(
      <FeedAnalyticsModal
        onClose={() => {
          setShowModal(false);
          setModalContent(null);
        }}
        feedInventory={feedInventory}
        feedConsumption={feedConsumption}
        feedFormulations={feedFormulations}
      />
    );
    setShowModal(true);
  };

  // Filtered data based on active tab
  let filteredData = [];
  switch (activeTab) {
    case "inventory":
      filteredData = feedInventory.filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.supplier.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
          filterType === "all" ||
          (filterType === "complete" && item.type === "complete") ||
          (filterType === "ingredient" && item.type === "ingredient") ||
          (filterType === "low" && item.quantity <= item.reorderLevel);

        return matchesSearch && matchesFilter;
      });
      break;
    case "consumption":
      filteredData = feedConsumption.filter((record) => {
        return (
          record.feedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.flockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      break;
    case "formulation":
      filteredData = feedFormulations.filter((formula) => {
        return (
          formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          formula.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      break;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Feed Management</h1>
        <div className="flex gap-3">
          <button
            className="btn-primary flex items-center gap-2"
            onClick={openAnalyticsModal}
          >
            <BarChart size={18} />
            <span>Analytics</span>
          </button>
          {activeTab === "inventory" && (
            <button
              className="btn-primary flex items-center gap-2"
              onClick={handleAddFeedInventory}
            >
              <Plus size={18} />
              <span>Add Feed Item</span>
            </button>
          )}
          {activeTab === "consumption" && (
            <button
              className="btn-primary flex items-center gap-2"
              onClick={handleAddConsumption}
            >
              <Plus size={18} />
              <span>Record Consumption</span>
            </button>
          )}
          {activeTab === "formulation" && (
            <button
              className="btn-primary flex items-center gap-2"
              onClick={handleAddFormulation}
            >
              <Plus size={18} />
              <span>Create Formulation</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[color:var(--border)]">
        <button
          className={`px-4 py-2 font-medium flex items-center gap-2 ${
            activeTab === "inventory"
              ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]"
              : "text-[color:var(--muted-foreground)]"
          }`}
          onClick={() => setActiveTab("inventory")}
        >
          <Package size={18} />
          <span>Feed Inventory</span>
        </button>
        <button
          className={`px-4 py-2 font-medium flex items-center gap-2 ${
            activeTab === "consumption"
              ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]"
              : "text-[color:var(--muted-foreground)]"
          }`}
          onClick={() => setActiveTab("consumption")}
        >
          <Utensils size={18} />
          <span>Consumption Tracking</span>
        </button>
        <button
          className={`px-4 py-2 font-medium flex items-center gap-2 ${
            activeTab === "formulation"
              ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]"
              : "text-[color:var(--muted-foreground)]"
          }`}
          onClick={() => setActiveTab("formulation")}
        >
          <ShoppingCart size={18} />
          <span>Feed Formulation</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={`Search ${
              activeTab === "inventory"
                ? "feed items"
                : activeTab === "consumption"
                ? "consumption records"
                : "formulations"
            }...`}
            className="input w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            className="absolute left-3 top-2.5 text-[color:var(--muted-foreground)]"
            size={18}
          />
        </div>
        {activeTab === "inventory" && (
          <select
            className="input bg-[color:var(--card)]"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="complete">Complete Feeds</option>
            <option value="ingredient">Ingredients</option>
            <option value="low">Low Stock</option>
          </select>
        )}
      </div>

      {/* Dashboard Cards */}
      {activeTab === "inventory" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4">
            <h3 className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Total Feed Items
            </h3>
            <p className="text-2xl font-bold">{feedInventory.length}</p>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Total Quantity
            </h3>
            <p className="text-2xl font-bold">
              {feedInventory
                .reduce((sum, item) => sum + item.quantity, 0)
                .toLocaleString() + " "}
              kg
            </p>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Inventory Value
            </h3>
            <p className="text-2xl font-bold">
              $
              {feedInventory
                .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
                .toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </p>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Low Stock Items
            </h3>
            <p className="text-2xl font-bold">
              {
                feedInventory.filter(
                  (item) => item.quantity <= item.reorderLevel
                ).length
              }
            </p>
          </div>
        </div>
      )}

      {activeTab === "consumption" && (
        <div className="card p-4">
          <h3 className="font-medium mb-3">Daily Feed Consumption</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={consumptionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  label={{
                    value: "Quantity (kg)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${value} kg`, "Consumption"]}
                />
                <Line
                  dataKey="totalQuantity"
                  stroke="#10b981"
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "formulation" && (
        <div className="card p-4">
          <h3 className="font-medium mb-3">Feed Formulations by Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={[
                  {
                    name: "Broiler Starter",
                    count: feedFormulations.filter(
                      (f) => f.type === "broiler" && f.stage === "starter"
                    ).length,
                  },
                  {
                    name: "Broiler Grower",
                    count: feedFormulations.filter(
                      (f) => f.type === "broiler" && f.stage === "grower"
                    ).length,
                  },
                  {
                    name: "Broiler Finisher",
                    count: feedFormulations.filter(
                      (f) => f.type === "broiler" && f.stage === "finisher"
                    ).length,
                  },
                  {
                    name: "Layer Chick",
                    count: feedFormulations.filter(
                      (f) => f.type === "layer" && f.stage === "chick"
                    ).length,
                  },
                  {
                    name: "Layer Grower",
                    count: feedFormulations.filter(
                      (f) => f.type === "layer" && f.stage === "grower"
                    ).length,
                  },
                  {
                    name: "Layer Production",
                    count: feedFormulations.filter(
                      (f) => f.type === "layer" && f.stage === "production"
                    ).length,
                  },
                ]}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-[color:var(--muted-foreground)]">
              No{" "}
              {activeTab === "inventory"
                ? "feed items"
                : activeTab === "consumption"
                ? "consumption records"
                : "formulations"}{" "}
              found
            </p>
          </div>
        ) : (
          <>
            {activeTab === "inventory" &&
              filteredData.map((item) => (
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
                          <span className="text-lg font-medium">
                            {item.name}
                          </span>
                          <span className="ml-3 px-2 py-1 text-xs rounded-full bg-[color:var(--accent)] text-[color:var(--accent-foreground)]">
                            {item.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div>
                            <p
                              className={`font-medium ${
                                item.quantity <= item.reorderLevel
                                  ? "text-red-500"
                                  : ""
                              }`}
                            >
                              {item.quantity} {item.unit}
                            </p>
                            {item.quantity <= item.reorderLevel && (
                              <span className="text-xs text-red-500 flex items-center">
                                <AlertTriangle size={14} className="mr-1" />
                                Low stock
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              ${item.unitPrice.toFixed(2)}/{item.unit}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditFeedItem(item);
                        }}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="p-2 text-[color:var(--muted-foreground)] hover:text-[color:var(--destructive)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteFeedItemModal(item);
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedItem === item.id && (
                    <div className="border-t border-[color:var(--border)] p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Details */}
                        <div>
                          <h4 className="font-medium mb-2">Details</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                ID:
                              </p>
                              <p className="font-medium">{item.id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Category:
                              </p>
                              <p className="font-medium">{item.category}</p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Supplier:
                              </p>
                              <p className="font-medium">{item.supplier}</p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Purchase Date:
                              </p>
                              <p className="font-medium">{item.purchaseDate}</p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Expiry Date:
                              </p>
                              <p className="font-medium">{item.expiryDate}</p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Location:
                              </p>
                              <p className="font-medium">{item.location}</p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Batch Number:
                              </p>
                              <p className="font-medium">{item.batchNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Minimum Level:
                              </p>
                              <p className="font-medium">
                                {item.minimumLevel} {item.unit}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Optimum Level:
                              </p>
                              <p className="font-medium">
                                {item.optimumLevel} {item.unit}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Reorder Level:
                              </p>
                              <p className="font-medium">
                                {item.reorderLevel} {item.unit}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Nutritional Information */}
                        <div>
                          <h4 className="font-medium mb-2">
                            Nutritional Information
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Protein:
                              </p>
                              <p className="font-medium">
                                {item.nutritionalInfo.protein}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Fat:
                              </p>
                              <p className="font-medium">
                                {item.nutritionalInfo.fat}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Fiber:
                              </p>
                              <p className="font-medium">
                                {item.nutritionalInfo.fiber}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Calcium:
                              </p>
                              <p className="font-medium">
                                {item.nutritionalInfo.calcium}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Phosphorus:
                              </p>
                              <p className="font-medium">
                                {item.nutritionalInfo.phosphorus}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Energy:
                              </p>
                              <p className="font-medium">
                                {item.nutritionalInfo.energy} kcal/kg
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

            {activeTab === "consumption" &&
              filteredData.map((record) => (
                <div key={record.id} className="card overflow-hidden">
                  <div
                    className="p-4 flex items-center cursor-pointer"
                    onClick={() =>
                      setExpandedItem(
                        expandedItem === record.id ? null : record.id
                      )
                    }
                  >
                    <div className="mr-4">
                      {expandedItem === record.id ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <span className="text-lg font-medium">
                            {record.feedName}
                          </span>
                          <span className="ml-3 px-2 py-1 text-xs rounded-full bg-[color:var(--accent)] text-[color:var(--accent-foreground)]">
                            {record.flockName}
                          </span>
                          <span className="ml-2 text-sm text-[color:var(--muted-foreground)]">
                            ({record.date})
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {record.quantity} {record.unit}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditConsumption(record);
                        }}
                      >
                        <Edit size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details (if needed) */}
                  {expandedItem === record.id && (
                    <div className="border-t border-[color:var(--border)] p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Details</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                ID:
                              </p>
                              <p className="font-medium">{record.id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Date:
                              </p>
                              <p className="font-medium">{record.date}</p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Flock ID:
                              </p>
                              <p className="font-medium">{record.flockId}</p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Feed ID:
                              </p>
                              <p className="font-medium">{record.feedId}</p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Cost per Unit:
                              </p>
                              <p className="font-medium">
                                ${record.costPerUnit.toFixed(2)}/{record.unit}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Total Cost:
                              </p>
                              <p className="font-medium">
                                ${record.totalCost.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Notes:
                              </p>
                              <p className="font-medium">{record.notes}</p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Recorded By:
                              </p>
                              <p className="font-medium">{record.recordedBy}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

            {activeTab === "formulation" &&
              filteredData.map((formula) => (
                <div key={formula.id} className="card overflow-hidden">
                  <div
                    className="p-4 flex items-center cursor-pointer"
                    onClick={() =>
                      setExpandedItem(
                        expandedItem === formula.id ? null : formula.id
                      )
                    }
                  >
                    <div className="mr-4">
                      {expandedItem === formula.id ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-lg font-medium">
                            {formula.name}
                          </span>
                          <span className="ml-3 px-2 py-1 text-xs rounded-full bg-[color:var(--accent)] text-[color:var(--accent-foreground)]">
                            {formula.type} - {formula.stage}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            ${formula.costPerKg.toFixed(2)}/kg
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-[color:var(--muted-foreground)]">
                        {formula.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditFormulation(formula);
                        }}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="p-2 text-[color:var(--muted-foreground)] hover:text-[color:var(--destructive)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteFormulationModal(formula);
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedItem === formula.id && (
                    <div className="border-t border-[color:var(--border)] p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Details */}
                        <div>
                          <h4 className="font-medium mb-2">Details</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                ID:
                              </p>
                              <p className="font-medium">{formula.id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Created Date:
                              </p>
                              <p className="font-medium">
                                {formula.createdDate}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Updated Date:
                              </p>
                              <p className="font-medium">
                                {formula.updatedDate}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Created By:
                              </p>
                              <p className="font-medium">{formula.createdBy}</p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Target Protein:
                              </p>
                              <p className="font-medium">
                                {formula.targetProtein}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Target Energy:
                              </p>
                              <p className="font-medium">
                                {formula.targetEnergy} kcal/kg
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Batch Size:
                              </p>
                              <p className="font-medium">
                                {formula.batchSize} kg
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Status:
                              </p>
                              <p className="font-medium capitalize">
                                {formula.status}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Ingredients */}
                        <div>
                          <h4 className="font-medium mb-2">Ingredients</h4>
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Ingredient
                                </th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Percentage
                                </th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Quantity (kg)
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {formula.ingredients.map((ingredient, index) => (
                                <tr key={index}>
                                  <td className="px-4 py-2 whitespace-nowrap">
                                    {ingredient.id
                                      ? getItemById(
                                          feedInventory,
                                          ingredient?.id
                                        )?.name
                                      : ingredient?.name}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-right">
                                    {ingredient.percentage}%
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-right">
                                    {ingredient.quantity}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Nutritional Profile */}
                        <div>
                          <h4 className="font-medium mb-2">
                            Nutritional Profile
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Protein:
                              </p>
                              <p className="font-medium">
                                {formula.nutritionalProfile.protein}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Fat:
                              </p>
                              <p className="font-medium">
                                {formula.nutritionalProfile.fat}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Fiber:
                              </p>
                              <p className="font-medium">
                                {formula.nutritionalProfile.fiber}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Calcium:
                              </p>
                              <p className="font-medium">
                                {formula.nutritionalProfile.calcium}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Phosphorus:
                              </p>
                              <p className="font-medium">
                                {formula.nutritionalProfile.phosphorus}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Lysine:
                              </p>
                              <p className="font-medium">
                                {formula.nutritionalProfile.lysine}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Methionine:
                              </p>
                              <p className="font-medium">
                                {formula.nutritionalProfile.methionine}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-[color:var(--muted-foreground)]">
                                Energy:
                              </p>
                              <p className="font-medium">
                                {formula.nutritionalProfile.energy} kcal/kg
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </>
        )}
      </div>

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