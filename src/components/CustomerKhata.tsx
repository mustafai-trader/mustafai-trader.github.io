"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  DollarSign,
  History,
  X
} from "lucide-react";
import { Storage, Customer, Invoice, Payment } from "@/lib/storage";

export default function CustomerKhata() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  // Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerInvoices, setCustomerInvoices] = useState<Invoice[]>([]);
  const [customerPayments, setCustomerPayments] = useState<Payment[]>([]);

  // Form states
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [nameUrdu, setNameUrdu] = useState("");
  const [phone, setPhone] = useState("");
  const [routeName, setRouteName] = useState("");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [creditLimit, setCreditLimit] = useState("50000");

  // Recovery form states
  const [recoveryAmount, setRecoveryAmount] = useState("");
  const [recoveryNotes, setRecoveryNotes] = useState("");

  const refreshCustomers = () => {
    setCustomers(Storage.getCustomers());
  };

  useEffect(() => {
    refreshCustomers();
  }, []);

  const openAddCustomerModal = () => {
    setEditingCustomer(null);
    setCode("");
    setName("");
    setNameUrdu("");
    setPhone("");
    setRouteName("Main Market Route");
    setAddress("");
    setBalance("0");
    setCreditLimit("50000");
    setIsCustomerModalOpen(true);
  };

  const openEditCustomerModal = (c: Customer) => {
    setEditingCustomer(c);
    setCode(c.code);
    setName(c.name);
    setNameUrdu(c.name_urdu || "");
    setPhone(c.phone || "");
    setRouteName(c.route_name || "");
    setAddress(c.address || "");
    setBalance(c.balance.toString());
    setCreditLimit(c.credit_limit ? c.credit_limit.toString() : "50000");
    setIsCustomerModalOpen(true);
  };

  const openRecoveryModal = (c: Customer) => {
    setSelectedCustomer(c);
    setRecoveryAmount("");
    setRecoveryNotes("");
    setIsRecoveryModalOpen(true);
  };

  const openLedgerModal = (c: Customer) => {
    setSelectedCustomer(c);
    const allInvoices = Storage.getInvoices().filter((i) => i.customer_id === c.id);
    const allPayments = (Storage as any).exportBackup
      ? JSON.parse(Storage.exportBackup()).payments.filter((p: any) => p.customer_id === c.id)
      : [];
    setCustomerInvoices(allInvoices);
    setCustomerPayments(allPayments);
    setIsLedgerModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    Storage.saveCustomer({
      id: editingCustomer?.id,
      code,
      name: name.toUpperCase().trim(),
      name_urdu: nameUrdu.trim(),
      phone: phone.trim(),
      route_name: routeName.trim(),
      address: address.trim(),
      balance: Number(balance) || 0,
      credit_limit: Number(creditLimit) || 50000,
    });

    setIsCustomerModalOpen(false);
    refreshCustomers();
  };

  const handleSaveRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const amt = Number(recoveryAmount);
    if (isNaN(amt) || amt <= 0) return;

    Storage.recordCustomerPayment(selectedCustomer.id, amt, recoveryNotes || "Cash payment recovery");
    setIsRecoveryModalOpen(false);
    refreshCustomers();
  };

  const handleDeleteCustomer = (id: number) => {
    if (!confirm("Are you sure you want to delete this shop? / کیا آپ یہ دکان ڈیلیٹ کرنا چاہتے ہیں؟")) return;
    Storage.deleteCustomer(id);
    refreshCustomers();
  };

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.name_urdu && c.name_urdu.includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.route_name && c.route_name.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q)) ||
      c.code.toLowerCase().includes(q)
    );
  });

  const totalOutstanding = customers.reduce((sum, c) => sum + (Number(c.balance) || 0), 0);

  return (
    <div className="p-3 sm:p-5 max-w-4xl mx-auto pb-28 text-slate-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Customer Khata & Recovery</span>
            <span className="text-sm font-normal text-slate-500">/ کسٹمر کھاتہ و وصولی</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage shopkeepers, ledger statements, and direct payment collections
          </p>
        </div>

        <button
          onClick={openAddCustomerModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold rounded-xl text-sm shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Shop / نئی دکان شامل کریں</span>
        </button>
      </div>

      {/* Metric */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 font-medium block">
            Total Market Receivables / کل بقایا مارکیٹ ادھار
          </span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block font-mono">
            Rs {totalOutstanding.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-mono">{customers.length} Shops Registered</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search by shop name, Urdu, route or phone / تلاش کریں..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
        />
      </div>

      {/* Customers List */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl p-6">
          <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <h3 className="font-bold text-slate-700 text-base">No Customers Found / کوئی کسٹمر نہیں ملا</h3>
          <p className="text-xs text-slate-400 mt-1">Add your customer shops to begin booking orders.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                    {c.code}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 tracking-tight uppercase">
                    {c.name}
                    {c.name_urdu && <span className="font-normal text-slate-500 text-sm ml-2">({c.name_urdu})</span>}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  {c.route_name && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Route: {c.route_name}</span>
                    </span>
                  )}
                  {c.address && <span>• {c.address}</span>}
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-blue-600 font-semibold hover:underline">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{c.phone}</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-none border-slate-100">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Outstanding Khata / بقایا:
                  </span>
                  <span className={`font-mono font-bold text-base ${c.balance > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                    Rs {Number(c.balance).toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openRecoveryModal(c)}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Receive Cash</span>
                  </button>

                  <button
                    onClick={() => openLedgerModal(c)}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Ledger</span>
                  </button>

                  <button
                    onClick={() => openEditCustomerModal(c)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteCustomer(c.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 text-slate-900 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  {editingCustomer ? "Edit Customer / دکان میں تبدیلی" : "Add New Customer / نئی دکان"}
                </h3>
                <p className="text-xs text-slate-500">Shopkeeper details, route, and opening balance</p>
              </div>
              <button onClick={() => setIsCustomerModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">Shop / Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Madina Karyana Store"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden uppercase"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">Urdu Name / اردو نام</label>
                  <input
                    type="text"
                    placeholder="مثلاً: مدینہ کریانہ اسٹور"
                    value={nameUrdu}
                    onChange={(e) => setNameUrdu(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Code / SKU</label>
                  <input
                    type="text"
                    placeholder="e.g. C-201"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number / فون</label>
                  <input
                    type="tel"
                    placeholder="03001234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Route / Area / روٹ</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Stop / Chandani Chowk"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Opening Balance / سابقہ ادھار</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Address / مکمل پتہ</label>
                <input
                  type="text"
                  placeholder="Street / Market Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="w-1/2 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl"
                >
                  Cancel / منسوخ
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Customer / محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recovery Modal */}
      {isRecoveryModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 text-slate-900 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Record Cash Payment / وصولی</h3>
                <p className="text-xs text-blue-600 font-bold uppercase">{selectedCustomer.name}</p>
              </div>
              <button onClick={() => setIsRecoveryModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 mb-3 text-xs flex justify-between font-mono">
              <span className="text-slate-500">Current Outstanding:</span>
              <strong className="text-amber-700 font-bold">
                Rs {selectedCustomer.balance.toLocaleString("en-PK")}
              </strong>
            </div>

            <form onSubmit={handleSaveRecovery} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Amount Received (Rs) / وصول شدہ رقم *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={recoveryAmount}
                  onChange={(e) => setRecoveryAmount(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 font-mono text-lg font-bold text-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Notes / تفصیل
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cash recovery collected"
                  value={recoveryNotes}
                  onChange={(e) => setRecoveryNotes(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecoveryModalOpen(false)}
                  className="w-1/2 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl"
                >
                  Cancel / منسوخ
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Payment / وصولی سیو کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ledger Modal */}
      {isLedgerModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col p-5 text-slate-900 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Customer Ledger Statement / کسٹمر کھاتہ تفصیل
                </h3>
                <p className="text-xs text-blue-600 font-bold uppercase">{selectedCustomer.name}</p>
              </div>
              <button onClick={() => setIsLedgerModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-3 flex-1 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex justify-between items-center font-mono text-xs">
                <span>Current Outstanding Balance:</span>
                <strong className="text-base text-amber-700">
                  Rs {selectedCustomer.balance.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                </strong>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 font-semibold text-slate-600 border-b border-slate-200">
                      <th className="p-2.5">Date / تاریخ</th>
                      <th className="p-2.5">Type / تفصیل</th>
                      <th className="p-2.5 text-right">Debit (بل)</th>
                      <th className="p-2.5 text-right">Credit (وصولی)</th>
                      <th className="p-2.5 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {customerInvoices.length === 0 && customerPayments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400 font-sans">
                          No transactions yet.
                        </td>
                      </tr>
                    ) : (
                      <>
                        {customerInvoices.map((inv) => (
                          <tr key={`inv-${inv.id}`} className="hover:bg-slate-50/50">
                            <td className="p-2 text-slate-500 font-sans">{inv.invoice_date}</td>
                            <td className="p-2 font-bold font-sans">Invoice #{inv.invoice_no}</td>
                            <td className="p-2 text-right font-bold text-slate-900">
                              Rs {inv.gross_total.toFixed(2)}
                            </td>
                            <td className="p-2 text-right text-emerald-700">
                              {inv.cash_received > 0 ? `Rs ${inv.cash_received.toFixed(2)}` : "-"}
                            </td>
                            <td className="p-2 text-right font-bold text-slate-900">
                              Rs {inv.total_balance.toFixed(2)}
                            </td>
                          </tr>
                        ))}

                        {customerPayments.map((pay: any) => (
                          <tr key={`pay-${pay.id}`} className="bg-emerald-50/30 hover:bg-emerald-50/50">
                            <td className="p-2 text-slate-500 font-sans">{pay.payment_date}</td>
                            <td className="p-2 font-bold text-emerald-800 font-sans">
                              Cash Recovery {pay.notes ? `(${pay.notes})` : ""}
                            </td>
                            <td className="p-2 text-right">-</td>
                            <td className="p-2 text-right font-bold text-emerald-700">
                              Rs {pay.amount.toFixed(2)}
                            </td>
                            <td className="p-2 text-right font-bold text-slate-500">-</td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsLedgerModalOpen(false)}
                className="w-full py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-xl"
              >
                Close / بند کریں
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
