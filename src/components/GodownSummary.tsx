"use client";

import React, { useState, useEffect } from "react";
import { Package, Printer, RefreshCw } from "lucide-react";
import { Storage } from "@/lib/storage";

export default function GodownSummary() {
  const [data, setData] = useState<any>(null);

  const refreshSummary = () => {
    setData(Storage.getGodownSummary());
  };

  useEffect(() => {
    refreshSummary();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-3 sm:p-5 max-w-4xl mx-auto pb-28 text-slate-900">
      {/* Header */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            <span>Warehouse Load Sheet & Dispatch Summary</span>
            <span className="text-sm font-normal text-slate-500">/ گودام لوڈ شیٹ</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidated list of all booked items to pick and pack from warehouse for delivery
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshSummary}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
            title="Refresh Summary"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold rounded-xl text-sm shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet / پرنٹ شیٹ</span>
          </button>
        </div>
      </div>

      {!data || data.itemsSummary.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl p-6">
          <Package className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <h3 className="font-bold text-slate-700 text-base">No Items to Dispatch / گودام سے لوڈ کرنے کے لیے کوئی آرڈر نہیں</h3>
          <p className="text-xs text-slate-400 mt-1">Book customer orders to automatically generate the dispatch load sheet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Quick Metrics */}
          <div className="print:hidden grid grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl text-center shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Total Cartons / کل کاٹن</span>
              <span className="text-2xl font-bold text-blue-600 mt-1 block font-mono">{data.totalCartons} Ctn</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl text-center shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Loose Pieces / کھلے پیس</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block font-mono">{data.totalPieces} Pcs</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl text-center shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Total Shops / کل دکانیں</span>
              <span className="text-2xl font-bold text-emerald-700 mt-1 block font-mono">{data.totalInvoices}</span>
            </div>
          </div>

          {/* Printable Sheet */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs print:border-none print:shadow-none">
            <div className="p-4 bg-slate-50 border-b border-slate-200 print:bg-white print:border-b-2 print:border-black text-center">
              <h1 className="text-base font-bold uppercase tracking-wider text-slate-900 print:text-black">
                WAREHOUSE DISPATCH LOAD SHEET / گودام ڈسپیچ لوڈ شیٹ
              </h1>
              <p className="text-xs text-slate-500 print:text-black mt-0.5 font-mono">
                Date: {new Date().toLocaleDateString("en-PK")} | Total Cartons: {data.totalCartons} | Total Orders: {data.totalInvoices}
              </p>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 print:border-black font-semibold text-slate-700 print:text-black">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Product Name / آئٹم کا نام</th>
                  <th className="py-2.5 px-3 text-center bg-blue-50/50 print:bg-transparent font-bold text-blue-900 print:text-black">
                    Cartons / کاٹن (Ctn)
                  </th>
                  <th className="py-2.5 px-3 text-center">Loose Pieces / پیس (Pcs)</th>
                  <th className="py-2.5 px-3 text-center">Bonus / بونس</th>
                  <th className="py-2.5 px-3 text-right">Total Amount / رقم</th>
                  <th className="py-2.5 px-3 text-center print:table-cell hidden sm:table-cell">Picked ✓</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-300 font-mono">
                {data.itemsSummary.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 text-slate-400 font-sans">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold font-sans uppercase text-slate-900 print:text-black">
                      {item.product_name}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900 print:text-black text-sm bg-blue-50/30 print:bg-transparent">
                      {item.total_ctn > 0 ? `${item.total_ctn} Ctn` : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-700 print:text-black">
                      {item.total_pcs > 0 ? `${item.total_pcs} Pcs` : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-center text-emerald-700 font-bold">
                      {item.total_bns > 0 ? item.total_bns : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900 print:text-black">
                      Rs {Number(item.total_amount).toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-center print:table-cell hidden sm:table-cell">
                      <div className="w-4 h-4 border border-slate-300 print:border-black rounded-xs mx-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 print:bg-slate-100 font-bold border-t-2 border-slate-300 print:border-black">
                  <td colSpan={2} className="py-3 px-3 uppercase text-right font-sans">
                    Grand Total / کل میزان:
                  </td>
                  <td className="py-3 px-3 text-center text-blue-700 print:text-black font-bold text-sm">
                    {data.totalCartons} Ctn
                  </td>
                  <td className="py-3 px-3 text-center">{data.totalPieces} Pcs</td>
                  <td className="py-3 px-3 text-center">{data.totalBonus} Bns</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 print:text-black">
                    Rs {Number(data.totalSales).toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="hidden sm:table-cell"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
