"use client";

import React, { useRef } from "react";
import { Printer, X, Share2, MessageSquare, Download } from "lucide-react";

interface InvoiceItem {
  id?: number;
  product_name: string;
  rate_pcs: number;
  rate_ctn: number;
  ctn: number;
  pcs: number;
  bns: number;
  tr_offer: number;
  disc_pct: number;
  gst_pct: number;
  line_total: number;
}

interface InvoiceData {
  id: number;
  invoice_no: string;
  invoice_date: string;
  customer_code: string;
  customer_name: string;
  customer_area?: string;
  customer_phone?: string;
  salesman?: string;
  previous_balance: number;
  gross_total: number;
  invoice_disc_pct: number;
  invoice_disc_val: number;
  freight: number;
  cash_received: number;
  current_balance: number;
  total_balance: number;
  items: InvoiceItem[];
  company?: {
    company_name: string;
    company_name_urdu?: string;
    address: string;
    phone: string;
    currency?: string;
    receipt_footer?: string;
  };
}

interface Props {
  invoice: InvoiceData | null;
  onClose: () => void;
}

export default function InvoicePrintModal({ invoice, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const companyName = invoice.company?.company_name || "DISTRIBUTION TRADERS";
  const companyAddress = invoice.company?.address || "Main Market Road";
  const companyPhone = invoice.company?.phone || "0300-1234567";
  const receiptFooter = invoice.company?.receipt_footer || "Thanks for your business / شکریہ، آپ کے تعاون کا بہت شکریہ";

  const handleWhatsAppShare = () => {
    const lines = [
      `*${companyName}*`,
      `*BILL INVOICE / بل رسید*`,
      `Invoice #: ${invoice.invoice_no}`,
      `Date: ${invoice.invoice_date}`,
      `Customer: ${invoice.customer_name} (${invoice.customer_code})`,
      `---------------------------------`,
      `*ITEMS / اشیاء:*`,
      ...invoice.items.map(
        (it) => `• ${it.product_name}: ${it.ctn} Ctn ${it.pcs > 0 ? `+ ${it.pcs} Pcs` : ""} = Rs ${it.line_total.toFixed(2)}`
      ),
      `---------------------------------`,
      `*Gross Total / کل بل:* Rs ${Number(invoice.gross_total).toLocaleString("en-PK", { minimumFractionDigits: 2 })}`,
      `*Previous Khata / سابقہ بقایا:* Rs ${Number(invoice.previous_balance).toLocaleString("en-PK", { minimumFractionDigits: 2 })}`,
      `*Cash Received / وصولی:* Rs ${Number(invoice.cash_received).toLocaleString("en-PK", { minimumFractionDigits: 2 })}`,
      `*TOTAL BALANCE DUE / کل نیا بقایا:* Rs ${Number(invoice.total_balance).toLocaleString("en-PK", { minimumFractionDigits: 2 })}`,
      `---------------------------------`,
      `Salesman: ${invoice.salesman || "Sales Representative"}`,
    ];

    const message = encodeURIComponent(lines.join("\n"));
    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
  };

  const totalCtn = invoice.items.reduce((sum, it) => sum + (Number(it.ctn) || 0), 0);
  const totalPcs = invoice.items.reduce((sum, it) => sum + (Number(it.pcs) || 0), 0);
  const totalBns = invoice.items.reduce((sum, it) => sum + (Number(it.bns) || 0), 0);
  const totalTrOffer = invoice.items.reduce((sum, it) => sum + (Number(it.tr_offer) || 0), 0);
  const totalDisc = invoice.items.reduce((sum, it) => {
    const base = (it.ctn * it.rate_ctn) + (it.pcs * it.rate_pcs);
    return sum + (base * (it.disc_pct / 100));
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden">
        
        {/* Modal Action Bar (Hidden on print) */}
        <div className="print:hidden flex items-center justify-between p-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">Invoice #{invoice.invoice_no} / بل رسید</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              Ready to Print
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-95 transition"
              title="Share on WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp / واٹس ایپ</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-95 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill / پرنٹ</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Slip */}
        <div className="overflow-y-auto p-4 sm:p-6 print:p-0 print:overflow-visible font-mono text-[11px] leading-tight text-black bg-white">
          <div id="printable-invoice" ref={printRef} className="max-w-[700px] mx-auto border border-black/40 print:border-none p-4 rounded-sm">
            
            {/* Header */}
            <div className="text-center pb-2 border-b-2 border-black">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider">{companyName}</h1>
              {invoice.company?.company_name_urdu && (
                <p className="text-sm font-bold text-slate-700 print:text-black">{invoice.company.company_name_urdu}</p>
              )}
              <p className="text-[10px] sm:text-[11px] font-bold mt-0.5">{companyAddress}</p>
              <p className="text-[10px] sm:text-[11px] font-bold">Ph: {companyPhone}</p>
            </div>

            {/* Bill Details */}
            <div className="grid grid-cols-2 gap-2 py-2 border-b border-black text-[11px]">
              <div>
                <div className="flex">
                  <span className="w-20 font-bold">Code:</span>
                  <span className="font-semibold">{invoice.customer_code}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-bold">M/s:</span>
                  <span className="font-black uppercase">{invoice.customer_name}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-bold">City/Area:</span>
                  <span className="truncate">{invoice.customer_area || "N/A"}</span>
                </div>
              </div>
              <div className="text-right sm:text-left sm:pl-4">
                <div className="flex justify-between sm:justify-start">
                  <span className="font-bold sm:w-24">Invoice No #:</span>
                  <span className="font-black">{invoice.invoice_no}</span>
                </div>
                <div className="flex justify-between sm:justify-start">
                  <span className="font-bold sm:w-24">Invoice Date:</span>
                  <span>{invoice.invoice_date}</span>
                </div>
                <div className="flex justify-between sm:justify-start">
                  <span className="font-bold sm:w-24">Salesman:</span>
                  <span className="font-semibold">{invoice.salesman || "Sales Representative"}</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left my-2 border-collapse text-[10px] sm:text-[11px]">
              <thead>
                <tr className="border-b-2 border-t border-black uppercase text-[10px] font-bold">
                  <th className="py-1">Particulars</th>
                  <th className="py-1 text-right">Rate Pcs</th>
                  <th className="py-1 text-right">Rate Ctn</th>
                  <th className="py-1 text-center">Ctn</th>
                  <th className="py-1 text-center">Pcs</th>
                  <th className="py-1 text-center">Bns</th>
                  <th className="py-1 text-right">Tr.Offer</th>
                  <th className="py-1 text-right">Disc %</th>
                  <th className="py-1 text-right">GST %</th>
                  <th className="py-1 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-200 print:border-gray-300">
                    <td className="py-1 font-bold pr-1 uppercase">{item.product_name}</td>
                    <td className="py-1 text-right">{item.rate_pcs > 0 ? item.rate_pcs.toFixed(2) : "-"}</td>
                    <td className="py-1 text-right">{item.rate_ctn.toFixed(2)}</td>
                    <td className="py-1 text-center font-black">{item.ctn}</td>
                    <td className="py-1 text-center">{item.pcs}</td>
                    <td className="py-1 text-center">{item.bns}</td>
                    <td className="py-1 text-right">{item.tr_offer > 0 ? item.tr_offer.toFixed(2) : "0.00"}</td>
                    <td className="py-1 text-right">{item.disc_pct > 0 ? item.disc_pct.toFixed(2) : "0.00"}</td>
                    <td className="py-1 text-right">{item.gst_pct > 0 ? item.gst_pct.toFixed(2) : "0.00"}</td>
                    <td className="py-1 text-right font-black">{item.line_total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Row */}
            <div className="py-1.5 border-t-2 border-b-2 border-black flex flex-wrap items-center justify-between font-bold text-[10px] sm:text-[11px]">
              <span>Products (s) : {invoice.items.length}</span>
              <div className="flex gap-2 sm:gap-3">
                <span>Ctn: {totalCtn}</span>
                <span>Pcs: {totalPcs}</span>
                <span>Bns: {totalBns}</span>
                <span>Disc: {totalDisc.toFixed(2)}</span>
                <span className="font-black">Total: {invoice.gross_total.toLocaleString("en-PK", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Financial Box */}
            <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t border-black text-[11px]">
              <div className="border border-black p-2 rounded-xs">
                <div className="flex justify-between py-0.5">
                  <span className="font-bold">Previous Balance:</span>
                  <span className="font-semibold">{Number(invoice.previous_balance).toLocaleString("en-PK", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="font-bold">Current Balance:</span>
                  <span className="font-semibold">{Number(invoice.current_balance).toLocaleString("en-PK", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-0.5 border-t border-dashed border-black mt-1 pt-1 font-black">
                  <span>Total Balance:</span>
                  <span className="text-sm">{Number(invoice.total_balance).toLocaleString("en-PK", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="border border-black p-2 rounded-xs">
                <div className="flex justify-between py-0.5">
                  <span className="font-bold">G.Total:</span>
                  <span className="font-semibold">{Number(invoice.gross_total).toLocaleString("en-PK", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>Invoice Disc {invoice.invoice_disc_pct}%:</span>
                  <span>{Number(invoice.invoice_disc_val).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-0.5 border-t border-dotted border-black mt-0.5">
                  <span className="font-bold">Cash Received:</span>
                  <span className="font-bold">{Number(invoice.cash_received).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-0.5 border-t border-black mt-0.5 font-black">
                  <span>Current Balance:</span>
                  <span>{Number(invoice.current_balance).toLocaleString("en-PK", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-3 pt-2 border-t border-dashed border-gray-400 text-center text-[9px] text-gray-700 print:text-black">
              <p>{receiptFooter}</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
