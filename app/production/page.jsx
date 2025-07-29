// app/production/page.jsx
"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { Plus, Download, Home, Filter, Egg, Bird, Wheat, ShoppingCart } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNotification } from "../context/NotificationContext";
import Modal from "../components/Modal";
import AddEggSaleModal from "../components/modals/AddEggSaleModal";
import ExportProductionModal from "../components/modals/ExportProductionModal";
import SummaryCard from "../components/dashboards/SummaryCard";
import ProductionDataTable from "../components/production/ProductionDataTable";
import ProductionTrendChart from "../components/production/ProductionTrendChart";
import FlockComparisonChart from "../components/production/FlockComparisonChart";

function ProductionPageContent() {
  const { data: session } = useSession();
  const { addNotification } = useNotification();

  const [farms, setFarms] = useState([]);
  const [activeFarmId, setActiveFarmId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const [productionData, setProductionData] = useState({
    kpis: {},
    records: [],
    flockComparison: [],
    productionTrend: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ type: null, data: null });

  const [filters, setFilters] = useState({
    dateRange: 'last30days',
    flockType: 'all',
    flockId: 'all',
  });

  const fetchUserFarms = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/farms');
      if (!res.ok) throw new Error('Failed to fetch farms');
      const farmsData = await res.json();
      setFarms(farmsData);
      if (farmsData.length > 0) {
        const initialFarm = farmsData[0];
        setActiveFarmId(initialFarm.id);
        setUserRole(initialFarm.role);
      }
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [session, addNotification]);

  useEffect(() => {
    fetchUserFarms();
  }, [fetchUserFarms]);

  const fetchProductionData = useCallback(async () => {
    if (!activeFarmId) {
        setProductionData({ kpis: {}, records: [], flockComparison: [], productionTrend: [] });
        return;
    };
    setIsLoading(true);
    
    const query = new URLSearchParams(filters).toString();

    try {
      const res = await fetch(`/api/farms/${activeFarmId}/production?${query}`);
      if (!res.ok) throw new Error('Failed to fetch production data');
      const data = await res.json();
      setProductionData(data);
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeFarmId, filters, addNotification]);

  useEffect(() => {
    fetchProductionData();
  }, [fetchProductionData]);

  const handleModalSubmit = async (url, body, method = 'POST', successMessage) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process request');
      }

      addNotification(successMessage, 'success');
      closeModal();
      fetchProductionData(); // Refresh data
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (type, data = null) => {
    setModalConfig({ type, data });
    setShowModal(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setShowModal(false);
    setTimeout(() => setModalConfig({ type: null, data: null }), 300);
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const renderModalContent = () => {
    const { type, data } = modalConfig;
    if (!type) return null;

    switch(type) {
      case 'addEggSale':
        return <AddEggSaleModal
          isSubmitting={isSubmitting}
          onClose={closeModal}
          onSave={(saleData) => handleModalSubmit(`/api/farms/${activeFarmId}/egg-sales`, saleData, 'POST', 'Egg sale recorded successfully!')}
          farmId={activeFarmId}
        />;
      case 'export':
        return <ExportProductionModal
          onClose={closeModal}
          farmId={activeFarmId}
          filters={filters}
        />;
      default:
        return null;
    }
  };
  
  const canPerformActions = session?.user?.userType === 'ADMIN' || userRole === 'OWNER' || userRole === 'MANAGER';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Production Analytics</h1>
        <div className="flex items-center gap-2">
            {canPerformActions && (
                <button
                    className="btn-primary flex items-center gap-2"
                    onClick={() => openModal('addEggSale')}
                    disabled={!activeFarmId || isSubmitting}
                >
                    <Plus size={18} />
                    <span>Add Egg Sale</span>
                </button>
            )}
            <button
                className="btn-secondary flex items-center gap-2"
                onClick={() => openModal('export')}
                disabled={!activeFarmId}
            >
                <Download size={18} />
                <span>Export</span>
            </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--border)] pb-2">
        <span className="font-medium mr-2">Farm:</span>
        {farms.length > 0 ? farms.map(farm => (
          <button
            key={farm.id}
            className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-2 ${
              activeFarmId === farm.id
                ? "bg-[color:var(--primary)] text-white"
                : "bg-[color:var(--card)] hover:bg-[color:var(--accent)]"
            }`}
            onClick={() => {
                setActiveFarmId(farm.id);
                setUserRole(farm.role);
            }}
          >
            <Home size={16} />
            {farm.name}
          </button>
        )) : !isLoading && <p className="text-sm text-[color:var(--muted-foreground)]">No farms found.</p>}
      </div>

      {activeFarmId ? (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard title="Total Egg Production (7 Days)" value={productionData.kpis?.totalEggsLast7Days || 0} icon={<Egg />} />
            <SummaryCard title="Average Eggs Per Bird" value={productionData.kpis?.avgEggsPerBird?.toFixed(2) || 0} icon={<Bird />} />
            <SummaryCard title="Feed Conversion Ratio (FCR)" value={productionData.kpis?.fcr?.toFixed(2) || 'N/A'} icon={<Wheat />} />
            <SummaryCard title="Total Birds Sold (This Month)" value={productionData.kpis?.birdsSoldThisMonth || 0} icon={<ShoppingCart />} />
          </div>

          {/* Filters */}
          <div className="bg-[color:var(--card)] p-4 rounded-lg flex flex-wrap items-center gap-4">
            <Filter size={16} className="text-[color:var(--muted-foreground)]" />
            <h3 className="font-semibold">Filters</h3>
            <select name="dateRange" value={filters.dateRange} onChange={handleFilterChange} className="input">
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="allTime">All Time</option>
            </select>
            <select name="flockType" value={filters.flockType} onChange={handleFilterChange} className="input">
                <option value="all">All Flock Types</option>
                <option value="Layer">Layers</option>
                <option value="Broiler">Broilers</option>
            </select>
             {/* A flock selector could be added here if needed */}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[color:var(--card)] p-4 rounded-lg">
              <h3 className="font-semibold mb-4">Production Trends Over Time</h3>
              {isLoading ? <LoadingSpinner /> : <ProductionTrendChart data={productionData.productionTrend} />}
            </div>
            <div className="bg-[color:var(--card)] p-4 rounded-lg">
              <h3 className="font-semibold mb-4">Flock vs. Flock Performance</h3>
              {isLoading ? <LoadingSpinner /> : <FlockComparisonChart data={productionData.flockComparison} />}
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-[color:var(--card)] p-4 rounded-lg">
            <h3 className="font-semibold mb-4">Production Records</h3>
            {isLoading ? <LoadingSpinner /> : <ProductionDataTable data={productionData.records} />}
          </div>
        </>
      ) : (
        !isLoading && <div className="text-center p-8">
          <h2 className="text-xl font-semibold">No Farm Selected</h2>
          <p className="mt-2 text-[color:var(--muted-foreground)]">Please select a farm to view production data.</p>
        </div>
      )}

      {showModal && (
        <Modal onClose={closeModal} hideDefaultButtons={true}>
          {renderModalContent()}
        </Modal>
      )}
    </div>
  );
}

export default function ProductionPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <ProductionPageContent />
        </Suspense>
    );
}