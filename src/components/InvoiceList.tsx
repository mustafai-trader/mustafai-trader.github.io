"use client";

import React, { useState, useEffect } from "react";
import { Printer, Search, FileText, Trash2 } from "lucide-react";
import { Storage, Invoice } from "@/lib/storage";

interface Props {
  onSelectInvoice: (invoice: Invoice) => void;
}

export default function InvoiceList({ onSelectInvoice }: Props) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");

  const refreshInvoices = () => {
    setInvoices(Storage.getInvoices());
  };

  useEffect(() => {
    refreshInvoices();
  }, []);

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to cancel this invoice? Customer khata balance will be reverted and stock restored to warehouse. / کیا آپ یہ بل ڈیلیٹ کرنا چاہتے ہیں؟ کھاتہ اور گودام اسٹاک خودکار واپس ہو جائے گا۔")) return;
    Storage.deleteInvoice(id);
    refreshInvoices();
  };

  const filteredInvoices = invoices.filter((inv) => {
    const q = search.toLowerCase();
    return (
      inv.invoice_no.toLowerCase().includes(q) ||
      inv.customer_name.toLowerCase().includes(q) ||
      (inv.customer_code && inv.customer_code.toLowerCase().includes(q)) ||
      (inv.customer_area && inv.customer_area.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-3 sm:p-5 max-w-4xl mx-auto pb-28 text-slate-900">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>Invoices & Receipts History</span>
            <span className="text-sm font-normal text-slate-500">/ تمام بل و رسیدیں</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View, print thermal slips or cancel booked customer bills
          </p>
        </div>
        <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full border border-slate-200">
          {invoices.length} Bills
        </span>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Invoice #, customer name or route / بل نمبر یا دکان تلاش کریں..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
        />
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl p-6">
          <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <h3 className="font-bold text-slate-700 text-base">No Invoices Found / کوئی بل نہیں ملا</h3>
          <p className="text-xs text-slate-400 mt-1">Book an order to generate your first invoice.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((inv) => (
            <div
              key={inv.id}
              onClick={() => onSelectInvoice(inv)}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 shadow-xs cursor-pointer transition active:scale-[0.99] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                    Invoice #{inv.invoice_no}
                  </span>
                  <span className="text-xs text-slate-400 font-sans">{inv.invoice_date}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 uppercase truncate">{inv.customer_name}</h3>
                <div className="text-xs text-slate-500 truncate mt-0.5">{inv.customer_area || "N/A"}</div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-none border-slate-100">
                <div className="text-left sm:text-right">
                  <div className="font-mono font-bold text-base text-slate-900">
                    Rs {Number(inv.gross_total).toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    Khata Balance: Rs {Number(inv.total_balance).toLocaleString("en-PK")}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectInvoice(inv);
                    }}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Bill / پرنٹ</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(e, inv.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition"
                    title="Cancel Invoice & Restore Stock"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
