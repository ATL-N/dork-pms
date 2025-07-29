

'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { Home, Plus, FileDown, Search, BarChart2, FileText, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isValid } from 'date-fns';

import LoadingSpinner from '@/app/components/LoadingSpinner';
import AddExpenseModal from '@/app/components/modals/AddExpenseModal';
import AddRevenueModal from '@/app/components/modals/AddRevenueModal';
import AddInvoiceModal from '@/app/components/modals/AddInvoiceModal';
import { useNotification } from '../context/NotificationContext';

function FinancesPageContent() {
  const { data: session } = useSession();
  const { addNotification } = useNotification();

  const [farms, setFarms] = useState([]);
  const [activeFarmId, setActiveFarmId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [loadingFinancials, setLoadingFinancials] = useState(false);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('transactions');

  // Filters
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [tempDateRange, setTempDateRange] = useState(dateRange);
  const [transactionFilter, setTransactionFilter] = useState({ type: 'all', category: 'all' });
  const [invoiceFilter, setInvoiceFilter] = useState({ status: 'all' });

  const fetchUserFarms = useCallback(async () => {
    if (!session) return;
    setLoadingFarms(true);
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
      setLoadingFarms(false);
    }
  }, [session, addNotification]);

  useEffect(() => {
    fetchUserFarms();
  }, [fetchUserFarms]);

  const fetchFinancialData = useCallback(async () => {
    if (!activeFarmId || !dateRange.start || !dateRange.end) return;
    
    const startDate = new Date(dateRange.start).toISOString();
    const endDate = new Date(dateRange.end).toISOString();

    setLoadingFinancials(true);
    try {
      const [summaryRes, transRes, invRes] = await Promise.all([
        fetch(`/api/finances/summary?farmId=${activeFarmId}&startDate=${startDate}&endDate=${endDate}`),
        fetch(`/api/finances/transactions?farmId=${activeFarmId}&startDate=${startDate}&endDate=${endDate}`),
        fetch(`/api/finances/invoices?farmId=${activeFarmId}&startDate=${startDate}&endDate=${endDate}`),
      ]);

      if (!summaryRes.ok) throw new Error('Failed to fetch financial summary');
      if (!transRes.ok) throw new Error('Failed to fetch transactions');
      if (!invRes.ok) throw new Error('Failed to fetch invoices');

      setSummaryData(await summaryRes.json());
      setTransactions(await transRes.json());
      setInvoices(await invRes.json());

    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setLoadingFinancials(false);
    }
  }, [activeFarmId, dateRange, addNotification]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const handleFilterSubmit = () => {
    const start = new Date(tempDateRange.start);
    const end = new Date(tempDateRange.end);
    if (!isValid(start) || !isValid(end) || start > end) {
        addNotification('Invalid date range. Please ensure the start date is before the end date.', 'error');
        return;
    }
    setDateRange(tempDateRange);
  };

  const handleAddTransaction = async (data) => {
    try {
      const response = await fetch('/api/finances/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, farmId: activeFarmId, type: data.amount > 0 ? 'REVENUE' : 'EXPENSE' }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add transaction');
      }
      addNotification(`Transaction added successfully`, 'success');
      fetchFinancialData(); // Refetch all data
      data.amount > 0 ? setIsRevenueModalOpen(false) : setIsExpenseModalOpen(false);
    } catch (error) {
      addNotification(error.message, 'error');
    }
  };
  
  const handleAddInvoice = async (invoiceData) => {
    try {
      const response = await fetch('/api/finances/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...invoiceData, farmId: activeFarmId }),
      });
      if (!response.ok) throw new Error('Failed to add invoice');
      addNotification('Invoice created successfully', 'success');
      fetchFinancialData();
      setIsInvoiceModalOpen(false);
    } catch (error) {
      addNotification(error.message, 'error');
    }
  };

  const handleMarkAsPaid = async (invoiceId) => {
    try {
        const response = await fetch(`/api/finances/invoices/${invoiceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'PAID' }),
        });
        if (!response.ok) throw new Error('Failed to update invoice status');
        addNotification('Invoice marked as paid', 'success');
        fetchFinancialData();
    } catch (error) {
        addNotification(error.message, 'error');
    }
  };
  
  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Vendor/Customer'];
    const rows = filteredTransactions.map(t => [
      format(new Date(t.date), 'yyyy-MM-dd'),
      t.type,
      t.category,
      t.amount,
      t.description || '',
      t.vendor || t.customer || ''
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `financial_report_${activeFarmId}_${dateRange.start}_to_${dateRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('Data exported successfully!', 'success');
  };

  const filteredTransactions = transactions.filter(t => {
    const typeMatch = transactionFilter.type === 'all' || t.type === transactionFilter.type;
    const categoryMatch = transactionFilter.category === 'all' || t.category === transactionFilter.category;
    return typeMatch && categoryMatch;
  });

  const filteredInvoices = invoices.filter(i => {
      return invoiceFilter.status === 'all' || i.status === invoiceFilter.status;
  });

  const chartData = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(new Date(), 5 - i);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const monthStr = format(month, 'MMM yyyy');

    const revenue = transactions
      .filter(t => t.type === 'REVENUE' && new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'EXPENSE' && new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd)
      .reduce((sum, t) => sum + t.amount, 0);

    return { name: monthStr, Revenue: revenue, Expenses: expenses };
  });

  const transactionCategories = [...new Set(transactions.map(t => t.category))];
  const canPerformActions = session?.user?.userType === 'ADMIN' || userRole === 'OWNER' || userRole === 'MANAGER';

  const SummaryCard = ({ title, value, period }) => (
    <div className="card p-4">
      <h3 className="text-sm font-medium text-[color:var(--muted-foreground)]">{title}</h3>
      <p className={`text-2xl font-bold ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
      </p>
      <p className="text-xs text-[color:var(--muted-foreground)]">{period}</p>
    </div>
  );

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl font-bold">Finances</h1>
            {canPerformActions && (
                <div className="flex items-center gap-2">
                    <button onClick={exportToCSV} className="btn-secondary flex items-center gap-2">
                        <FileDown size={18} /> Export
                    </button>
                    <button onClick={() => setIsRevenueModalOpen(true)} className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700">
                        <Plus size={18} /> Add Revenue
                    </button>
                    <button onClick={() => setIsExpenseModalOpen(true)} className="btn-primary flex items-center gap-2 bg-red-600 hover:bg-red-700">
                        <Plus size={18} /> Add Expense
                    </button>
                </div>
            )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--border)] pb-2">
            <span className="font-medium mr-2">Farms:</span>
            {loadingFarms ? <LoadingSpinner size="small" /> : farms.length > 0 ? farms.map(farm => (
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
            )) : <p className="text-sm text-[color:var(--muted-foreground)]">No farms found.</p>}
        </div>

        {loadingFinancials ? <LoadingSpinner /> : activeFarmId ? (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SummaryCard title="Total Revenue" value={summaryData?.period.revenue ?? 0} period="Selected Period" />
                    <SummaryCard title="Total Expenses" value={summaryData?.period.expenses ?? 0} period="Selected Period" />
                    <SummaryCard title="Net Profit/Loss" value={summaryData?.period.netProfit ?? 0} period="Selected Period" />
                    <SummaryCard title="YTD Revenue" value={summaryData?.ytd.revenue ?? 0} period="Year-to-Date" />
                    <SummaryCard title="YTD Expenses" value={summaryData?.ytd.expenses ?? 0} period="Year-to-Date" />
                    <SummaryCard title="YTD Net Profit" value={summaryData?.ytd.netProfit ?? 0} period="Year-to-Date" />
                </div>
            
                <div className="card p-6">
                    <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2"><BarChart2 /> Performance Chart</h2>
                        <div className="flex items-center gap-2">
                            <input type="date" value={tempDateRange.start} onChange={e => setTempDateRange(prev => ({...prev, start: e.target.value}))} className="input" />
                            <span className="text-[color:var(--muted-foreground)]">to</span>
                            <input type="date" value={tempDateRange.end} onChange={e => setTempDateRange(prev => ({...prev, end: e.target.value}))} className="input" />
                            <button onClick={handleFilterSubmit} className="btn-primary">Filter</button>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(value)} />
                        <Tooltip formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)} />
                        <Legend />
                        <Bar dataKey="Revenue" fill="var(--success)" />
                        <Bar dataKey="Expenses" fill="var(--destructive)" />
                    </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex border-b border-[color:var(--border)]">
                    <button onClick={() => setActiveTab('transactions')} className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'transactions' ? 'text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]' : 'text-[color:var(--muted-foreground)]'}`}>
                        <DollarSign size={16} /> Transactions
                    </button>
                    <button onClick={() => setActiveTab('invoices')} className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === 'invoices' ? 'text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]' : 'text-[color:var(--muted-foreground)]'}`}>
                        <FileText size={16} /> Invoices
                    </button>
                </div>

                {activeTab === 'transactions' && (
                    <div className="card p-6">
                        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                            <h2 className="text-2xl font-bold">Transaction History</h2>
                            <div className="flex items-center gap-4">
                                <select value={transactionFilter.type} onChange={e => setTransactionFilter(prev => ({...prev, type: e.target.value}))} className="input">
                                <option value="all">All Types</option>
                                <option value="REVENUE">Revenue</option>
                                <option value="EXPENSE">Expense</option>
                                </select>
                                <select value={transactionFilter.category} onChange={e => setTransactionFilter(prev => ({...prev, category: e.target.value}))} className="input">
                                <option value="all">All Categories</option>
                                {transactionCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">Date</th>
                                        <th className="text-left p-2">Type</th>
                                        <th className="text-left p-2">Category</th>
                                        <th className="text-right p-2">Amount</th>
                                        <th className="text-left p-2 hidden md:table-cell">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.map(t => (
                                        <tr key={t.id} className="border-b">
                                            <td className="p-2">{format(new Date(t.date), 'MMM dd, yyyy')}</td>
                                            <td className={`p-2 font-semibold ${t.type === 'REVENUE' ? 'text-green-600' : 'text-red-600'}`}>{t.type}</td>
                                            <td className="p-2">{t.category}</td>
                                            <td className="p-2 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(t.amount)}</td>
                                            <td className="p-2 hidden md:table-cell">{t.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'invoices' && (
                    <div className="card p-6">
                        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                            <h2 className="text-2xl font-bold">Invoice Management</h2>
                            <div className="flex items-center gap-2">
                                <select value={invoiceFilter.status} onChange={e => setInvoiceFilter({status: e.target.value})} className="input">
                                    <option value="all">All Statuses</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="PAID">Paid</option>
                                    <option value="OVERDUE">Overdue</option>
                                </select>
                                {canPerformActions && <button onClick={() => setIsInvoiceModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Create Invoice</button>}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">Number</th>
                                        <th className="text-left p-2">Date</th>
                                        <th className="text-left p-2">Due Date</th>
                                        <th className="text-right p-2">Amount</th>
                                        <th className="text-center p-2">Status</th>
                                        <th className="text-center p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInvoices.map(i => (
                                        <tr key={i.id} className="border-b">
                                            <td className="p-2">{i.invoiceNumber}</td>
                                            <td className="p-2">{format(new Date(i.date), 'MMM dd, yyyy')}</td>
                                            <td className="p-2">{i.dueDate ? format(new Date(i.dueDate), 'MMM dd, yyyy') : 'N/A'}</td>
                                            <td className="p-2 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(i.amount)}</td>
                                            <td className="p-2 text-center">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${i.status === 'PAID' ? 'bg-green-100 text-green-800' : i.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                    {i.status}
                                                </span>
                                            </td>
                                            <td className="p-2 text-center">
                                                {i.status === 'PENDING' && canPerformActions && (
                                                    <button onClick={() => handleMarkAsPaid(i.id)} className="btn-secondary text-xs">Mark as Paid</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </>
        ) : (
            !loadingFarms && <div className="text-center p-8">
                <h2 className="text-xl font-semibold">No Farm Selected</h2>
                <p className="mt-2 text-[color:var(--muted-foreground)]">Please select a farm above to view its finances.</p>
            </div>
        )}

        {canPerformActions && (
            <>
                <AddExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onAddExpense={(data) => handleAddTransaction({...data, amount: -Math.abs(data.amount)})} farmId={activeFarmId} />
                <AddRevenueModal isOpen={isRevenueModalOpen} onClose={() => setIsRevenueModalOpen(false)} onAddRevenue={(data) => handleAddTransaction({...data, amount: Math.abs(data.amount)})} farmId={activeFarmId} />
                <AddInvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} onAddInvoice={handleAddInvoice} />
            </>
        )}
    </div>
  );
}

export default function FinancesPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <FinancesPageContent />
        </Suspense>
    );
}
