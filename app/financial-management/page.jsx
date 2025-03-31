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
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Import modals
import AddExpenseModal from "../components/financialManagement/AddExpenseModal";
import AddRevenueModal from "../components/financialManagement/AddRevenueModal";
import AddInvoiceModal from "../components/financialManagement/AddInvoiceModal";
import Modal from "../components/Modal";

export default function FinancialManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [filter, setFilter] = useState("all");

  // Sample financial data
  const [expenses, setExpenses] = useState([
    {
      id: "EXP-1001",
      date: "2025-01-15",
      category: "Feed",
      amount: 15000,
      description: "Broiler feed purchase",
      vendor: "FarmFeed Inc.",
    },
    {
      id: "EXP-1002",
      date: "2025-01-22",
      category: "Medication",
      amount: 5000,
      description: "Vaccination supplies",
      vendor: "VetCare Solutions",
    },
    {
      id: "EXP-1003",
      date: "2025-02-05",
      category: "Labor",
      amount: 12000,
      description: "Farm worker wages",
      vendor: "Local Labor Services",
    },
  ]);

  const [revenues, setRevenues] = useState([
    {
      id: "REV-1001",
      date: "2025-01-31",
      category: "Egg Sales",
      amount: 45000,
      description: "Layer flock egg sales",
      customer: "Local Supermarket",
    },
    {
      id: "REV-1002",
      date: "2025-02-15",
      category: "Broiler Sales",
      amount: 62000,
      description: "Broiler flock meat sales",
      customer: "Poultry Distributors Ltd",
    },
    {
      id: "REV-1003",
      date: "2025-02-28",
      category: "Egg Sales",
      amount: 38000,
      description: "Specialty egg sales",
      customer: "Organic Food Stores",
    },
  ]);

  const [invoices, setInvoices] = useState([
    {
      id: "INV-1001",
      date: "2025-01-31",
      type: "Sales",
      amount: 45000,
      status: "Paid",
      customer: "Local Supermarket",
      dueDate: "2025-02-14",
    },
    {
      id: "INV-1002",
      date: "2025-02-15",
      type: "Sales",
      amount: 62000,
      status: "Paid",
      customer: "Poultry Distributors Ltd",
      dueDate: "2025-03-01",
    },
    {
      id: "INV-1003",
      date: "2025-02-05",
      type: "Purchase",
      amount: 15000,
      status: "Pending",
      vendor: "FarmFeed Inc.",
      dueDate: "2025-02-20",
    },
  ]);

  const financialOverview = {
    totalRevenue: 107000,
    totalExpenses: 20000,
    netProfit: 87000,
    profitMargin: 81.3,
    monthlyTrend: [
      { month: "Jan", revenue: 45000, expenses: 15000, profit: 30000 },
      { month: "Feb", revenue: 62000, expenses: 5000, profit: 57000 },
    ],
  };

  // Handlers for adding new records
  const handleAddExpense = (newExpense) => {
    setExpenses([
      ...expenses,
      { ...newExpense, id: `EXP-${expenses.length + 1001}` },
    ]);
    setShowModal(false);
  };

  const handleAddRevenue = (newRevenue) => {
    setRevenues([
      ...revenues,
      { ...newRevenue, id: `REV-${revenues.length + 1001}` },
    ]);
    setShowModal(false);
  };

  const handleAddInvoice = (newInvoice) => {
    setInvoices([
      ...invoices,
      { ...newInvoice, id: `INV-${invoices.length + 1001}` },
    ]);
    setShowModal(false);
  };

  // Modal opening functions
  const openExpenseModal = () => {
    setModalContent(
      <AddExpenseModal
        onClose={() => setShowModal(false)}
        onSave={handleAddExpense}
      />
    );
    setShowModal(true);
  };

  const openRevenueModal = () => {
    setModalContent(
      <AddRevenueModal
        onClose={() => setShowModal(false)}
        onSave={handleAddRevenue}
      />
    );
    setShowModal(true);
  };

  const openInvoiceModal = () => {
    setModalContent(
      <AddInvoiceModal
        onClose={() => setShowModal(false)}
        onSave={handleAddInvoice}
      />
    );
    setShowModal(true);
  };

  // Filtering and searching functions
  const filterExpenses = () => {
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.vendor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filter === "all" || expense.category === filter;

      return matchesSearch && matchesFilter;
    });
  };

  const filterRevenues = () => {
    return revenues.filter((revenue) => {
      const matchesSearch =
        revenue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        revenue.customer.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filter === "all" || revenue.category === filter;

      return matchesSearch && matchesFilter;
    });
  };

  const filterInvoices = () => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.vendor?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filter === "all" || invoice.status === filter;

      return matchesSearch && matchesFilter;
    });
  };

  // Render expenses tab
  const renderExpensesTab = () => {
    const expenseCategories = [...new Set(expenses.map((e) => e.category))];
    const filteredExpenses = filterExpenses();

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[color:var(--muted-foreground)]"
                size={18}
              />
              <input
                type="text"
                placeholder="Search expenses..."
                className="pl-10 pr-4 py-2 border rounded w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border rounded"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {expenseCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={openExpenseModal}
          >
            <Plus size={18} />
            <span>Add Expense</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[color:var(--background-secondary)]">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Vendor</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="border-b">
                  <td className="p-3">{expense.id}</td>
                  <td className="p-3">{expense.date}</td>
                  <td className="p-3">{expense.category}</td>
                  <td className="p-3">${expense.amount.toLocaleString()}</td>
                  <td className="p-3">{expense.description}</td>
                  <td className="p-3">{expense.vendor}</td>
                  <td className="p-3 flex justify-center space-x-2">
                    <button className="text-[color:var(--primary)]">
                      <Edit size={18} />
                    </button>
                    <button className="text-[color:var(--destructive)]">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render revenues tab
  const renderRevenuesTab = () => {
    const revenueCategories = [...new Set(revenues.map((r) => r.category))];
    const filteredRevenues = filterRevenues();

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[color:var(--muted-foreground)]"
                size={18}
              />
              <input
                type="text"
                placeholder="Search revenues..."
                className="pl-10 pr-4 py-2 border rounded w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border rounded"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {revenueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={openRevenueModal}
          >
            <Plus size={18} />
            <span>Add Revenue</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[color:var(--background-secondary)]">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRevenues.map((revenue) => (
                <tr key={revenue.id} className="border-b">
                  <td className="p-3">{revenue.id}</td>
                  <td className="p-3">{revenue.date}</td>
                  <td className="p-3">{revenue.category}</td>
                  <td className="p-3">${revenue.amount.toLocaleString()}</td>
                  <td className="p-3">{revenue.description}</td>
                  <td className="p-3">{revenue.customer}</td>
                  <td className="p-3 flex justify-center space-x-2">
                    <button className="text-[color:var(--primary)]">
                      <Edit size={18} />
                    </button>
                    <button className="text-[color:var(--destructive)]">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render invoices tab
  const renderInvoicesTab = () => {
    const invoiceStatuses = ["Paid", "Pending", "Overdue"];
    const filteredInvoices = filterInvoices();

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[color:var(--muted-foreground)]"
                size={18}
              />
              <input
                type="text"
                placeholder="Search invoices..."
                className="pl-10 pr-4 py-2 border rounded w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border rounded"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {invoiceStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={openInvoiceModal}
          >
            <Plus size={18} />
            <span>Create Invoice</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[color:var(--background-secondary)]">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Customer/Vendor</th>
                <th className="p-3 text-left">Due Date</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b">
                  <td className="p-3">{invoice.id}</td>
                  <td className="p-3">{invoice.date}</td>
                  <td className="p-3">{invoice.type}</td>
                  <td className="p-3">${invoice.amount.toLocaleString()}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        invoice.status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : invoice.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-3">{invoice.customer || invoice.vendor}</td>
                  <td className="p-3">{invoice.dueDate}</td>
                  <td className="p-3 flex justify-center space-x-2">
                    <button className="text-[color:var(--primary)]">
                      <Edit size={18} />
                    </button>
                    <button className="text-[color:var(--destructive)]">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Financial Management</h1>
        <div className="flex gap-3">
          <button
            className="btn-primary flex items-center gap-2"
            onClick={openExpenseModal}
          >
            <TrendingDown size={18} />
            <span>Record Expense</span>
          </button>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={openRevenueModal}
          >
            <TrendingUp size={18} />
            <span>Record Revenue</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[color:var(--border)]">
        {[
          { value: "overview", label: "Financial Overview" },
          { value: "expenses", label: "Expenses" },
          { value: "revenues", label: "Revenues" },
          { value: "invoices", label: "Invoices" },
        ].map((tab) => (
          <button
            key={tab.value}
            className={`px-4 py-2 font-medium ${
              activeTab === tab.value
                ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]"
                : "text-[color:var(--muted-foreground)]"
            }`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conditional Rendering of Tabs */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Financial Summary Cards (from previous implementation) */}
          <div className="card p-4 space-y-3">
            <div className="flex justify-between items-center">
              <DollarSign className="text-[color:var(--primary)]" />
              <span className="text-sm text-[color:var(--muted-foreground)]">
                Total Revenue
              </span>
            </div>
            <h2 className="text-2xl font-bold">
              ${financialOverview.totalRevenue.toLocaleString()}
            </h2>
            <p className="text-sm text-[color:var(--success)]">
              +12.5% from last month
            </p>
          </div>

          <div className="card p-4 space-y-3">
            <div className="flex justify-between items-center">
              <CreditCard className="text-[color:var(--destructive)]" />
              <span className="text-sm text-[color:var(--muted-foreground)]">
                Total Expenses
              </span>
            </div>
            <h2 className="text-2xl font-bold">
              ${financialOverview.totalExpenses.toLocaleString()}
            </h2>
            <p className="text-sm text-[color:var(--destructive)]">
              -3.2% from last month
            </p>
          </div>

          <div className="card p-4 space-y-3">
            <div className="flex justify-between items-center">
              <FileText className="text-[color:var(--success)]" />
              <span className="text-sm text-[color:var(--muted-foreground)]">
                Net Profit
              </span>
            </div>
            <h2 className="text-2xl font-bold">
              ${financialOverview.netProfit.toLocaleString()}
            </h2>
            <p className="text-sm text-[color:var(--success)]">
              {financialOverview.profitMargin}% Profit Margin
            </p>
          </div>

          {/* Monthly Financial Trend */}
          <div className="md:col-span-3 card p-4">
            <h3 className="font-medium mb-4">Monthly Financial Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialOverview.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Render specific tabs based on activeTab */}
      {activeTab === "expenses" && renderExpensesTab()}
      {activeTab === "revenues" && renderRevenuesTab()}
      {activeTab === "invoices" && renderInvoicesTab()}

      {/* Modals */}
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