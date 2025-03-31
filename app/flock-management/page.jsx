// app/flock-management/page.js
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
} from "recharts";

// Import modals
import AddFlockModal from "../components/flockManagement/AddFlockModal";
import RecordWeightModal from "../components/flockManagement/RecordWeightModal";
import RecordMortalityModal from "../components/flockManagement/RecordMortalityModal";
import RecordVaccinationModal from "../components/flockManagement/RecordVaccinationModal";
import DeleteFlockModal from "../components/flockManagement/DeleteFlockModal";
import Modal from "../components/Modal";

export default function FlockManagement() {
  const [activeTab, setActiveTab] = useState("active");
  const [expandedFlock, setExpandedFlock] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  function getItemById(data, id) {
      if (!Array.isArray(data)) {
        return null; // Or throw an error, depending on how you want to handle invalid input
      }

      const item = data.find((item) => item.id === id);
      return item || null; // Return null if not found
    }

  // Modal states

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showMortalityModal, setShowMortalityModal] = useState(false);
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [selectedFlock, setSelectedFlock] = useState(null);

  // Data state
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

  const handleAddFlock = async () => {
    try {
      //    const [staffData] = await Promise.all([fetchData("/api/staff/all", "")]);

      setModalContent(
        <div>
          <AddFlockModal
            //  staffData={staffData}
            onClose={() => {
              setShowModal(false);
            }}
          />
        </div>
      );
      setShowModal(true);
    } catch (err) {
      console.log("Error fetching teacher data:", err);
    } finally {
    }
  };

  const handleEditFlock = async (flock) => {
    // console.log('running the handle edit flock',)
    
    try {
        // const flockdata=getItemById(flocks, id)
      //    const [staffData] = await Promise.all([fetchData("/api/staff/all", "")]);

      setModalContent(
        <div>
          <AddFlockModal
            //  staffData={staffData}
            onClose={() => {
              setShowModal(false);
            }}
            flockToEdit={flock}
            title="Edit Flock"
          />
        </div>
      );
      setShowModal(true);
    } catch (err) {
      console.log("Error fetching teacher data:", err);
    } finally {
    }
  };


  const handleDeleteFlock = (flockId) => {
    setFlocks((prev) => prev.filter((flock) => flock.id !== flockId));
    setShowDeleteModal(false);
  };

    const openDeleteModal = async (flock) => {
      try {
        // const flockdata = getItemById(flocks, id);

        setModalContent(
          <div>
            <DeleteFlockModal
              //  staffData={staffData}
              onClose={() => {
                setShowModal(false);
              }}
              flock={flock}
              onDeleteFlock={handleDeleteFlock}
            />
          </div>
        );
        setShowModal(true);
      } catch (err) {
        console.log("Error fetching teacher data:", err);
      } finally {
      }
    };

    const openMortalityModal = async (flock) => {
      try {
        // const flockdata = getItemById(flocks, id);
        // console.log('flockdata', flockdata)

        setModalContent(
          <div>
            <RecordMortalityModal
              //  staffData={staffData}
              onClose={() => {
                setShowModal(false);
              }}
              flock={flock}
              onUpdateMortality={''}
            />
          </div>
        );
        setShowModal(true);
      } catch (err) {
        console.log("Error fetching teacher data:", err);
      } finally {
      }
    };

     const openWeightModal = async (flock) => {
       try {
        //  const flockdata = getItemById(flocks, id);
        //  console.log("flockdata", flockdata);

         setModalContent(
           <div>
             <RecordWeightModal
               //  staffData={staffData}
               onClose={() => {
                 setShowModal(false);
               }}
               flock={flock}
               onUpdateWeight={''}
             />
           </div>
         );
         setShowModal(true);
       } catch (err) {
         console.log("Error fetching teacher data:", err);
       } finally {
       }
     };

  const handleUpdateWeight = (flockId, newWeight, newDataPoint) => {
    setFlocks((prev) =>
      prev.map((flock) => {
        if (flock.id === flockId) {
          return {
            ...flock,
            currentWeight: newWeight,
            growthData: [...flock.growthData, newDataPoint].sort(
              (a, b) => a.day - b.day
            ),
          };
        }
        return flock;
      })
    );
    setShowWeightModal(false);
  };

  const handleUpdateMortality = (flockId, mortalityCount, cause) => {
    setFlocks((prev) =>
      prev.map((flock) => {
        if (flock.id === flockId) {
          const newQuantity = flock.quantity - mortalityCount;
          const newMortalityRate = (
            ((flock.quantity - newQuantity) / flock.quantity) *
            100
          ).toFixed(1);

          return {
            ...flock,
            quantity: newQuantity,
            mortality: parseFloat(newMortalityRate),
          };
        }
        return flock;
      })
    );
    setShowMortalityModal(false);
  };

  const handleAddVaccination = async (flockId, newVaccination) => {
    try {

        setFlocks((prev) =>
          prev.map((flock) => {
            if (flock.id === flockId) {
              return {
                ...flock,
                vaccinationSchedule: [
                  ...flock.vaccinationSchedule,
                  newVaccination,
                ],
              };
            }
            return flock;
          })
        );

      setModalContent(
        <div>
          <RecordVaccinationModal
            onClose={() => {
              setShowModal(false);
              setModalContent(null)
            }}
            flock={flocks}
            

          />
        </div>
      );
      setShowModal(true);
    } catch (err) {
      console.log("Error fetching teacher data:", err);
    } finally {
    }
  };

  const handleAddVaccination1 = (flockId, newVaccination) => {
    setFlocks((prev) =>
      prev.map((flock) => {
        if (flock.id === flockId) {
          return {
            ...flock,
            vaccinationSchedule: [...flock.vaccinationSchedule, newVaccination],
          };
        }
        return flock;
      })
    );
    setShowVaccinationModal(false);
  };

//   // Open modal handlers with selected flock
//   const openDeleteModal = (flock) => {
//     setSelectedFlock(flock);
//     setShowDeleteModal(true);
//   };

//   const openWeightModal = (flock) => {
//     setSelectedFlock(flock);
//     setShowWeightModal(true);
//   };

//   const openMortalityModal1 = (flock) => {
//     setSelectedFlock(flock);
//     setShowMortalityModal(true);
//   };

//   const openVaccinationModal = (flock) => {
//     setSelectedFlock(flock);
//     setShowVaccinationModal(true);
//   };

  // Filter and search
  const filteredFlocks = flocks
    .filter((flock) => flock.status === activeTab)
    .filter((flock) => {
      if (!searchTerm) return true;
      return (
        flock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flock.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flock.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flock.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Flock Management</h1>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={handleAddFlock}
        >
          <Plus size={18} />
          <span>Add New Flock</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[color:var(--border)]">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "active"
              ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]"
              : "text-[color:var(--muted-foreground)]"
          }`}
          onClick={() => setActiveTab("active")}
        >
          Active Flocks
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "archived"
              ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]"
              : "text-[color:var(--muted-foreground)]"
          }`}
          onClick={() => setActiveTab("archived")}
        >
          Archived Flocks
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search flocks..."
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

      {/* Flocks List */}
      <div className="space-y-4">
        {filteredFlocks.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-[color:var(--muted-foreground)]">
              No flocks found
            </p>
          </div>
        ) : (
          filteredFlocks.map((flock) => (
            <div key={flock.id} className="card overflow-hidden">
              <div
                className="p-4 flex items-center cursor-pointer"
                onClick={() =>
                  setExpandedFlock(expandedFlock === flock.id ? null : flock.id)
                }
              >
                <div className="mr-4">
                  {expandedFlock === flock.id ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-lg font-medium">{flock.name}</span>
                      <span className="ml-3 px-2 py-1 text-xs rounded-full bg-[color:var(--accent)] text-[color:var(--accent-foreground)]">
                        {flock.type === "layer" ? "Layer" : "Broiler"}
                      </span>
                      <span className="ml-2 text-sm text-[color:var(--muted-foreground)]">
                        ({flock.breed})
                      </span>
                    </div>
                    <div className="hidden md:block">
                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-xs text-[color:var(--muted-foreground)]">
                            Location
                          </span>
                          <p className="font-medium">{flock.location}</p>
                        </div>
                        <div>
                          <span className="text-xs text-[color:var(--muted-foreground)]">
                            Quantity
                          </span>
                          <p className="font-medium">
                            {flock.status === "active"
                              ? flock.quantity.toLocaleString()
                              : `${flock.finalQuantity.toLocaleString()}/${flock.initialQuantity.toLocaleString()}`}
                          </p>
                        </div>
                        {flock.status === "active" && (
                          <div>
                            <span className="text-xs text-[color:var(--muted-foreground)]">
                              Age
                            </span>
                            <p className="font-medium">
                              {flock.currentAge} days
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="md:hidden mt-2">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-xs text-[color:var(--muted-foreground)]">
                          Location
                        </span>
                        <p className="font-medium">{flock.location}</p>
                      </div>
                      <div>
                        <span className="text-xs text-[color:var(--muted-foreground)]">
                          Quantity
                        </span>
                        <p className="font-medium">
                          {flock.status === "active"
                            ? flock.quantity.toLocaleString()
                            : `${flock.finalQuantity.toLocaleString()}/${flock.initialQuantity.toLocaleString()}`}
                        </p>
                      </div>
                      {flock.status === "active" && (
                        <div>
                          <span className="text-xs text-[color:var(--muted-foreground)]">
                            Age
                          </span>
                          <p className="font-medium">{flock.currentAge} days</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {flock?.status === "active" && (
                  <div className="flex items-center gap-2" key={flock?.id}>
                    <button
                      className="p-2 text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFlock(flock);
                      }}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="p-2 text-[color:var(--muted-foreground)] hover:text-[color:var(--destructive)]"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(flock);
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {expandedFlock === flock.id && (
                <div className="border-t border-[color:var(--border)] p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Basic Info */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Flock Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[color:var(--muted-foreground)]">
                            ID:
                          </span>
                          <span className="font-medium">{flock.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[color:var(--muted-foreground)]">
                            Start Date:
                          </span>
                          <span className="font-medium">{flock.startDate}</span>
                        </div>
                        {flock.status === "archived" && (
                          <div className="flex justify-between">
                            <span className="text-[color:var(--muted-foreground)]">
                              End Date:
                            </span>
                            <span className="font-medium">{flock.endDate}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-[color:var(--muted-foreground)]">
                            Mortality Rate:
                          </span>
                          <span
                            className={`font-medium ${
                              flock.mortality > 2
                                ? "text-[color:var(--destructive)]"
                                : "text-[color:var(--success)]"
                            }`}
                          >
                            {flock.mortality}%
                          </span>
                        </div>
                        {flock.type === "broiler" &&
                          flock.status === "active" && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-[color:var(--muted-foreground)]">
                                  Current Weight:
                                </span>
                                <span className="font-medium">
                                  {flock.currentWeight}g
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[color:var(--muted-foreground)]">
                                  Target Weight:
                                </span>
                                <span className="font-medium">
                                  {flock.targetWeight}g
                                </span>
                              </div>
                            </>
                          )}
                        {flock.type === "layer" &&
                          flock.status === "active" && (
                            <div className="flex justify-between">
                              <span className="text-[color:var(--muted-foreground)]">
                                Egg Production:
                              </span>
                              <span className="font-medium">
                                {flock.eggProduction}%
                              </span>
                            </div>
                          )}
                        {flock.type === "broiler" &&
                          flock.status === "archived" && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-[color:var(--muted-foreground)]">
                                  Average Weight:
                                </span>
                                <span className="font-medium">
                                  {flock.averageWeight}g
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[color:var(--muted-foreground)]">
                                  Feed Conversion:
                                </span>
                                <span className="font-medium">
                                  {flock.feedConversion}
                                </span>
                              </div>
                            </>
                          )}
                        {flock.type === "layer" &&
                          flock.status === "archived" && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-[color:var(--muted-foreground)]">
                                  Total Eggs:
                                </span>
                                <span className="font-medium">
                                  {flock.totalEggs.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[color:var(--muted-foreground)]">
                                  Avg. Production:
                                </span>
                                <span className="font-medium">
                                  {flock.averageProduction}%
                                </span>
                              </div>
                            </>
                          )}
                      </div>
                    </div>

                    {/* Middle Column - Graph */}
                    {flock.status === "active" && (
                      <div className="lg:col-span-2">
                        <h3 className="font-medium mb-4">
                          {flock.type === "broiler"
                            ? "Growth Performance"
                            : "Production Performance"}
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            {flock.type === "broiler" ? (
                              <LineChart data={flock.growthData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="day"
                                  label={{
                                    value: "Age (days)",
                                    position: "insideBottom",
                                    offset: -5,
                                  }}
                                />
                                <YAxis
                                  label={{
                                    value: "Weight (g)",
                                    angle: -90,
                                    position: "insideLeft",
                                  }}
                                />
                                <Tooltip
                                  formatter={(value) => [`${value}g`, "Weight"]}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="weight"
                                  stroke="#10b981"
                                  strokeWidth={2}
                                  dot={{ r: 4 }}
                                />
                              </LineChart>
                            ) : (
                              <LineChart data={flock.productionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="week"
                                  label={{
                                    value: "Age (weeks)",
                                    position: "insideBottom",
                                    offset: -5,
                                  }}
                                />
                                <YAxis
                                  label={{
                                    value: "Production (%)",
                                    angle: -90,
                                    position: "insideLeft",
                                  }}
                                />
                                <Tooltip
                                  formatter={(value) => [
                                    `${value}%`,
                                    "Production",
                                  ]}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="production"
                                  stroke="#f59e0b"
                                  strokeWidth={2}
                                  dot={{ r: 4 }}
                                />
                              </LineChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {flock.status === "active" && (
                      <>
                        {/* Vaccination Schedule */}
                        <div>
                          <h3 className="font-medium mb-3">
                            Vaccination Schedule
                          </h3>
                          <div className="space-y-2">
                            {flock.vaccinationSchedule.map((vac, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-2 border-b border-[color:var(--border)]"
                              >
                                <div>
                                  <p className="font-medium">{vac.vaccine}</p>
                                  <p className="text-xs text-[color:var(--muted-foreground)]">
                                    {vac.date}
                                  </p>
                                </div>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    vac.status === "completed"
                                      ? "bg-[color:var(--success)] bg-opacity-10 text-[color:var(--accent)]"
                                      : "bg-[color:var(--info)] bg-opacity-10 text-[color:var(--accent)]"
                                  }`}
                                >
                                  {vac.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Feed Schedule */}
                        <div>
                          <h3 className="font-medium mb-3">Feed Program</h3>
                          <div className="space-y-2">
                            {flock.feedSchedule.map((feed, index) => (
                              <div
                                key={index}
                                className={`p-2 border-l-4 rounded-r-md ${
                                  flock.currentAge >= feed.startDay &&
                                  flock.currentAge <= feed.endDay
                                    ? "border-l-[color:var(--primary)] bg-[color:var(--primary)] bg-opacity-5"
                                    : "border-l-[color:var(--muted-foreground)] bg-[color:var(--muted)] bg-opacity-5"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">
                                    {feed.phase}
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-[color:var(--card)]">
                                    Day {feed.startDay}-{feed.endDay}
                                  </span>
                                </div>
                                <p className="text-sm mt-1">
                                  <span className="text-[color:var(--muted-foreground)]">
                                    Consumption:
                                  </span>{" "}
                                  {feed.dailyConsumption}g/bird/day
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="lg:col-span-3 flex gap-3 mt-3">
                          <button
                            className="btn-primary"
                            onClick={(e) => {e.stopPropagation(); openWeightModal(flock)}}
                          >
                            Record Weight
                          </button>
                          <button
                            className="btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              openMortalityModal(flock);
                            }}
                          >
                            Record Mortality
                          </button>
                          <button
                            className="btn-primary"
                            onClick={handleAddVaccination}
                          >
                            Record Vaccination
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {/* {showAddModal && (
        <AddFlockModal
          onClose={() => setShowAddModal(false)}
          onAddFlock={handleAddFlock}
        />
      )} */}

      {/* {showDeleteModal && selectedFlock && (
        <DeleteFlockModal
          flock={selectedFlock}
          onClose={() => setShowDeleteModal(false)}
          onDelete={() => handleDeleteFlock(selectedFlock.id)}
        />
      )} */}

      {showWeightModal && selectedFlock && (
        <RecordWeightModal
          flock={selectedFlock}
          onClose={() => setShowWeightModal(false)}
          onSave={(weight, dataPoint) =>
            handleUpdateWeight(selectedFlock.id, weight, dataPoint)
          }
        />
      )}

      {showMortalityModal && selectedFlock && (
        <RecordMortalityModal
          flock={selectedFlock}
          onClose={() => setShowMortalityModal(false)}
          onSave={(count, cause) =>
            handleUpdateMortality(selectedFlock.id, count, cause)
          }
        />
      )}

      {showVaccinationModal && selectedFlock && (
        <RecordVaccinationModal
          flock={selectedFlock}
          isOpen={showVaccinationModal}
          onClose={() => setShowVaccinationModal(false)}
          onSave={(vaccination) =>
            handleAddVaccination(selectedFlock.id, vaccination)
          }
        />
      )}

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
