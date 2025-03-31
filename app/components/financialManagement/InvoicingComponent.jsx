// components/financialManagement/InvoicingComponent.js
import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { FileText, Download, Printer } from "lucide-react";

export default function InvoicingComponent() {
  const [invoices, setInvoices] = useState([
    {
      id: "INV-2024-001",
      customer: "Local Supermarket",
      date: "2024-02-15",
      items: [
        {
          description: "Layer Eggs",
          quantity: 1000,
          unitPrice: 0.45,
          total: 450,
        },
        {
          description: "Egg Tray Packaging",
          quantity: 20,
          unitPrice: 5,
          total: 100,
        },
      ],
      subtotal: 550,
      tax: 55,
      total: 605,
      status: "Paid",
    },
    {
      id: "INV-2024-002",
      customer: "Regional Restaurant Chain",
      date: "2024-02-22",
      items: [
        {
          description: "Broiler Chickens",
          quantity: 500,
          unitPrice: 12,
          total: 6000,
        },
      ],
      subtotal: 6000,
      tax: 600,
      total: 6600,
      status: "Pending",
    },
  ]);

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleDownloadInvoice = (invoice) => {
    // Placeholder for invoice download logic
    console.log("Downloading invoice", invoice);
  };

  const handlePrintInvoice = (invoice) => {
    // Placeholder for invoice print logic
    console.log("Printing invoice", invoice);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Invoices</h2>
        <button className="btn-primary flex items-center gap-2">
          <FileText size={18} />
          Create New Invoice
        </button>
      </div>

      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">Invoice ID</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{invoice.id}</td>
                <td className="p-3">{invoice.customer}</td>
                <td className="p-3">{invoice.date}</td>
                <td className="p-3 text-right">
                  ${invoice.total.toLocaleString()}
                </td>
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      invoice.status === "Paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleDownloadInvoice(invoice)}
                      className="text-gray-600 hover:text-gray-900"
                      title="Download Invoice"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handlePrintInvoice(invoice)}
                      className="text-gray-600 hover:text-gray-900"
                      title="Print Invoice"
                    >
                      <Printer size={16} />
                    </button>
                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="text-gray-600 hover:text-gray-900"
                      title="View Details"
                    >
                      <FileText size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <Dialog
          open={true}
          onClose={() => setSelectedInvoice(null)}
          className="fixed inset-0 z-50 overflow-y-auto p-4 pt-[10vh]"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="relative bg-white rounded-lg max-w-2xl mx-auto p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-bold">
                Invoice Details - {selectedInvoice.id}
              </Dialog.Title>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Download size={16} /> Download
                </button>
                <button
                  onClick={() => handlePrintInvoice(selectedInvoice)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Printer size={16} /> Print
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-medium">{selectedInvoice.customer}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Invoice Date</p>
                <p className="font-medium">{selectedInvoice.date}</p>
              </div>
            </div>

            <table className="w-full mb-6">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-center">Quantity</th>
                  <th className="p-2 text-right">Unit Price</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{item.description}</td>
                    <td className="p-2 text-center">{item.quantity}</td>
                    <td className="p-2 text-right">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="p-2 text-right">
                      ${item.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    selectedInvoice.status === "Paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {selectedInvoice.status}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Subtotal</p>
                <p className="font-medium">
                  ${selectedInvoice.subtotal.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Tax</p>
                <p className="font-medium">
                  ${selectedInvoice.tax.toLocaleString()}
                </p>
                <p className="text-lg font-bold mt-2">Total</p>
                <p className="text-xl font-bold text-green-600">
                  ${selectedInvoice.total.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
