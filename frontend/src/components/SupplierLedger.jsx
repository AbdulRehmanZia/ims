import React, { useState, useEffect } from "react";
import { api } from "../Instance/api";
import { Loader, Truck, Eye, Plus, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import LedgerAccountForm from "./LedgerAccountForm";

export default function SupplierLedger() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAccount, setPaymentAccount] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [recordingPayment, setRecordingPayment] = useState(false);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/ledger/accounts/SUPPLIER");
      setSuppliers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountLedger = async (accountId) => {
    try {
      setLoadingEntries(true);
      const response = await api.get(`/ledger/accounts/${accountId}/entries`);
      setLedgerEntries(response.data.data.entries || []);
      setSelectedAccount(response.data.data.account);
      setSheetOpen(true);
    } catch (error) {
      console.error("Error fetching account ledger:", error);
      toast.error("Failed to load ledger entries");
    } finally {
      setLoadingEntries(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setRecordingPayment(true);
    try {
      await api.post("/ledger/payments/supplier", {
        accountId: paymentAccount.id,
        amount: parseFloat(paymentAmount),
        description: paymentDescription || `Payment to ${paymentAccount.name}`,
      });
      toast.success("Payment recorded successfully");
      setShowPaymentForm(false);
      setPaymentAccount(null);
      setPaymentAmount("");
      setPaymentDescription("");
      fetchSuppliers();
      if (sheetOpen && selectedAccount?.id === paymentAccount.id) {
        fetchAccountLedger(paymentAccount.id);
      }
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error(error.response?.data?.message || "Failed to record payment");
    } finally {
      setRecordingPayment(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount).toFixed(2)}`;
  };

  const getBalanceColor = (balance) => {
    if (balance > 0) return "text-red-700"; // You owe supplier (credit balance)
    if (balance < 0) return "text-green-700"; // Supplier owes you (debit balance)
    return "text-[#2F4F4F]";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="animate-spin h-8 w-8 text-[#2F4F4F]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2F4F4F]">Supplier Accounts</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2F4F4F] text-white rounded-md hover:bg-[#2F4F4F]/90 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Supplier
          </button>
        </div>

        {showAddForm && (
          <div className="mb-6">
            <LedgerAccountForm
              type="SUPPLIER"
              onSuccess={fetchSuppliers}
              onClose={() => setShowAddForm(false)}
            />
          </div>
        )}
        {suppliers.length === 0 ? (
          <div className="text-center py-8 text-[#2F4F4F]/70">
            <Truck className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No supplier accounts found</p>
            <p className="text-sm mt-1">Supplier accounts will appear here when created</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#2F4F4F]/20">
              <thead className="bg-[#F4F9F9]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2F4F4F] uppercase tracking-wider">
                    Supplier Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2F4F4F] uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#2F4F4F] uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[#2F4F4F] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#2F4F4F]/20">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-[#F4F9F9]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#2F4F4F]">
                        {supplier.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2F4F4F]/70">
                      {supplier.contactEmail || supplier.contactPhone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <span className={getBalanceColor(supplier.balance)}>
                        {formatCurrency(supplier.balance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => fetchAccountLedger(supplier.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-[#2F4F4F] hover:bg-[#F4F9F9] rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                          View Ledger
                        </button>
                        {supplier.balance > 0 && (
                          <button
                            onClick={() => {
                              setPaymentAccount(supplier);
                              setShowPaymentForm(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          >
                            <DollarSign className="h-4 w-4" />
                            Record Payment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ledger Details Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl bg-[#F4F9F9] overflow-y-auto">
          <SheetHeader className="mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#2F4F4F] text-white">
                <Truck className="h-6 w-6" />
              </div>
              <SheetTitle className="text-xl font-bold text-[#2F4F4F]">
                {selectedAccount?.name} - Ledger
              </SheetTitle>
            </div>
            {selectedAccount && (
              <div className="mt-2 text-sm text-[#2F4F4F]/70">
                <p>Balance: <span className={getBalanceColor(ledgerEntries[ledgerEntries.length - 1]?.balance || 0)}>
                  {formatCurrency(ledgerEntries[ledgerEntries.length - 1]?.balance || 0)}
                </span></p>
              </div>
            )}
          </SheetHeader>

          {loadingEntries ? (
            <div className="flex justify-center items-center py-12">
              <Loader className="animate-spin h-8 w-8 text-[#2F4F4F]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#2F4F4F]/20">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#2F4F4F] uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#2F4F4F] uppercase">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#2F4F4F] uppercase">
                      Debit
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#2F4F4F] uppercase">
                      Credit
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[#2F4F4F] uppercase">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#2F4F4F]/20">
                  {ledgerEntries.length > 0 ? (
                    ledgerEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-[#F4F9F9]">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#2F4F4F]">
                          {formatDate(entry.date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#2F4F4F]">
                          {entry.description}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-green-700">
                          {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-red-700">
                          {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-[#2F4F4F]">
                          {formatCurrency(entry.balance)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-[#2F4F4F]/70">
                        No ledger entries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Payment Form Modal */}
      {showPaymentForm && paymentAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[#2F4F4F] mb-4">
              Record Payment to {paymentAccount.name}
            </h3>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2F4F4F] mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F4F4F]"
                  placeholder="Enter payment amount"
                />
                <p className="text-xs text-[#2F4F4F]/70 mt-1">
                  Amount owed: Rs. {paymentAccount.balance.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2F4F4F] mb-2">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F4F4F]"
                  placeholder="Payment description"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={recordingPayment}
                  className="flex-1 px-4 py-2 bg-[#2F4F4F] text-white rounded-md hover:bg-[#2F4F4F]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {recordingPayment ? (
                    <>
                      <Loader className="animate-spin h-4 w-4" />
                      Recording...
                    </>
                  ) : (
                    "Record Payment"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentForm(false);
                    setPaymentAccount(null);
                    setPaymentAmount("");
                    setPaymentDescription("");
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

