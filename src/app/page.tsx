"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Store,
  ShoppingBag,
  Package,
  Users,
  FileText,
  Settings as SettingsIcon,
  Search,
  Plus,
  Minus,
  X,
  Printer,
  MessageSquare,
  Check,
  Edit2,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Phone,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Storage, Product, Customer, Invoice, CompanySettings } from "@/lib/storage";

type ScreenType = "booker" | "loadsheet" | "khata" | "products" | "history";

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>("booker");

  // Storage states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(Storage.getSettings());

  // Order Booker state
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [cart, setCart] = useState<{ [productId: number]: number }>({}); // productId -> cartons
  const [cashReceived, setCashReceived] = useState<string>("");
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  // Modals
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [isNewShopModalOpen, setIsNewShopModalOpen] = useState(false);
  const [isEditShopModalOpen, setIsEditShopModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [recoveryCustomer, setRecoveryCustomer] = useState<Customer | null>(null);
  const [recoveryAmount, setRecoveryAmount] = useState("");

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Shop Form state
  const [shopName, setShopName] = useState("");
  const [shopArea, setShopArea] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [shopBalance, setShopBalance] = useState("");

  // Product Form state
  const [prodName, setProdName] = useState("");
  const [prodRateCtn, setProdRateCtn] = useState("");
  const [prodCtnSize, setProdCtnSize] = useState("12");
  const [prodRetail, setProdRetail] = useState("");

  // Load and refresh state
  const refreshAll = () => {
    const custs = Storage.getCustomers();
    setCustomers(custs);
    if (!selectedCustomerId && custs.length > 0) {
      setSelectedCustomerId(custs[0].id);
    }
    setProducts(Storage.getProducts());
    setInvoices(Storage.getInvoices());
    setSettings(Storage.getSettings());
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Cart operations
  const setCartons = (productId: number, count: number) => {
    const val = Math.max(0, count);
    setCart((prev) => {
      if (val === 0) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: val };
    });
  };

  const changeCartons = (productId: number, delta: number) => {
    const current = cart[productId] || 0;
    setCartons(productId, current + delta);
  };

  // Cart calculations
  const cartEntries = useMemo(() => {
    return Object.entries(cart)
      .map(([pId, ctn]) => {
        const prod = products.find((p) => p.id === Number(pId));
        if (!prod || ctn <= 0) return null;
        const lineTotal = ctn * prod.rate_ctn;
        return { product: prod, ctn, lineTotal };
      })
      .filter((item): item is { product: Product; ctn: number; lineTotal: number } => item !== null);
  }, [cart, products]);

  const totalCartons = useMemo(() => {
    return cartEntries.reduce((sum, item) => sum + item.ctn, 0);
  }, [cartEntries]);

  const grossBill = useMemo(() => {
    return cartEntries.reduce((sum, item) => sum + item.lineTotal, 0);
  }, [cartEntries]);

  const cashRec = Number(cashReceived) || 0;
  const oldKhata = selectedCustomer?.balance || 0;
  const newKhata = oldKhata + grossBill - cashRec;

  // Make and Save Bill
  const handleCreateBill = () => {
    if (!selectedCustomer) {
      alert("براہ کرم پہلے دکان منتخب کریں!\nPlease select a shop first.");
      return;
    }
    if (cartEntries.length === 0) {
      alert("براہ کرم کم از کم ایک سامان کا کاٹن منتخب کریں!\nPlease select at least 1 item carton.");
      return;
    }

    const newInvoice = Storage.createInvoice({
      customer_id: selectedCustomer.id,
      salesman: settings.salesman_name,
      cash_received: cashRec,
      items: cartEntries.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        ctn_size: item.product.ctn_size,
        rate_ctn: item.product.rate_ctn,
        rate_pcs: item.product.rate_pcs,
        ctn: item.ctn,
        pcs: 0,
        bns: 0,
        tr_offer: 0,
        disc_pct: 0,
        gst_pct: 0,
      })),
    });

    setCart({});
    setCashReceived("");
    setViewInvoice(newInvoice);
    refreshAll();
  };

  // Shop Handlers
  const handleSaveNewShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) return;

    const created = Storage.saveCustomer({
      name: shopName.toUpperCase().trim(),
      phone: shopPhone.trim(),
      address: shopArea.trim(),
      balance: Number(shopBalance) || 0,
      code: "",
      credit_limit: 50000,
    });

    setShopName("");
    setShopArea("");
    setShopPhone("");
    setShopBalance("");
    setIsNewShopModalOpen(false);
    refreshAll();
    setSelectedCustomerId(created.id);
  };

  const handleUpdateShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !shopName.trim()) return;

    Storage.saveCustomer({
      id: editingCustomer.id,
      name: shopName.toUpperCase().trim(),
      phone: shopPhone.trim(),
      address: shopArea.trim(),
      balance: Number(shopBalance) || 0,
      code: editingCustomer.code,
      credit_limit: 50000,
    });

    setEditingCustomer(null);
    setIsEditShopModalOpen(false);
    refreshAll();
  };

  const handleDeleteShop = (id: number) => {
    if (confirm("کیا آپ واقعی اس دکان کو ڈیلیٹ کرنا چاہتے ہیں؟")) {
      Storage.deleteCustomer(id);
      refreshAll();
    }
  };

  // Product Handlers
  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodRateCtn) return;

    const rate = parseFloat(prodRateCtn) || 0;
    const ctnSize = parseInt(prodCtnSize) || 12;

    Storage.saveProduct({
      code: "",
      name: prodName.toUpperCase().trim(),
      category: "General",
      retail_price: Number(prodRetail) || 0,
      ctn_size: ctnSize,
      rate_ctn: rate,
      rate_pcs: Math.round((rate / ctnSize) * 100) / 100,
      stock_ctn: 100,
      stock_pcs: 0,
      min_stock_alert: 5,
      default_disc: 0,
    });

    setProdName("");
    setProdRateCtn("");
    setProdRetail("");
    setIsNewProductModalOpen(false);
    refreshAll();
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !prodName.trim() || !prodRateCtn) return;

    const rate = parseFloat(prodRateCtn) || 0;
    const ctnSize = parseInt(prodCtnSize) || 12;

    Storage.saveProduct({
      id: editingProduct.id,
      code: editingProduct.code,
      name: prodName.toUpperCase().trim(),
      category: editingProduct.category,
      retail_price: Number(prodRetail) || 0,
      ctn_size: ctnSize,
      rate_ctn: rate,
      rate_pcs: Math.round((rate / ctnSize) * 100) / 100,
      stock_ctn: editingProduct.stock_ctn,
      stock_pcs: 0,
      min_stock_alert: 5,
      default_disc: 0,
    });

    setEditingProduct(null);
    setIsEditProductModalOpen(false);
    refreshAll();
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm("کیا آپ واقعی اس سامان کو ڈیلیٹ کرنا چاہتے ہیں؟")) {
      Storage.deleteProduct(id);
      refreshAll();
    }
  };

  // Cash Recovery Handler
  const handleSaveRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCustomer || !recoveryAmount) return;

    Storage.recordCustomerPayment(recoveryCustomer.id, Number(recoveryAmount), "Cash Recovery");
    setIsRecoveryModalOpen(false);
    setRecoveryCustomer(null);
    setRecoveryAmount("");
    refreshAll();
  };

  // WhatsApp share generator
  const sendInvoiceWhatsApp = (inv: Invoice) => {
    const textLines = [
      `*${settings.company_name}*`,
      `بل نمبر / Invoice #: ${inv.invoice_no}`,
      `دکان / Customer: ${inv.customer_name}`,
      `تاریخ / Date: ${inv.invoice_date}`,
      `---------------------------------`,
      ...inv.items.map((it) => `• ${it.product_name} (${it.ctn} کاٹن @ Rs ${it.rate_ctn}) = Rs ${it.line_total.toLocaleString("en-PK")}`),
      `---------------------------------`,
      `*آج کا بل / Today's Bill: Rs ${inv.gross_total.toLocaleString("en-PK")}*`,
      `پچھلا ادھار / Old Khata: Rs ${inv.previous_balance.toLocaleString("en-PK")}`,
      `وصولی کیش / Cash Paid: Rs ${inv.cash_received.toLocaleString("en-PK")}`,
      `*کل بقایا ادھار / Total Balance Due: Rs ${inv.total_balance.toLocaleString("en-PK")}*`,
      `---------------------------------`,
      `شکریہ! ${settings.phone}`,
    ];
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textLines.join("\n"))}`, "_blank");
  };

  // Godown summary data
  const godownSummary = Storage.getGodownSummary();

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.address && c.address.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans pb-28 select-none">
      
      {/* ============================================================== */}
      {/* TOP APP HEADER                                                 */}
      {/* ============================================================== */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xs font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-base text-slate-900 leading-tight">
                {settings.company_name}
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                سیلز بکنگ و بل سسٹم (Order & Invoicing)
              </p>
            </div>
          </div>

          {/* Quick Settings Icon */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="سیٹنگز اور بیک اپ"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* SCREEN 1: ORDER BOOKER / NEW BILL (آرڈر اور نیا بل)           */}
      {/* ============================================================== */}
      {activeScreen === "booker" && (
        <main className="max-w-xl mx-auto w-full p-3 space-y-3 flex-1">
          
          {/* STEP 1: SELECT SHOP CARD */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>1. دکان منتخب کریں (Select Shop):</span>
              </span>
              <button
                onClick={() => {
                  setShopName("");
                  setShopArea("");
                  setShopPhone("");
                  setShopBalance("");
                  setIsNewShopModalOpen(true);
                }}
                className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>نئی دکان</span>
              </button>
            </div>

            {/* Shop Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedCustomerId || ""}
                onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-inner"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.address ? `📍 ${c.address}` : ""} (باقی: Rs {c.balance.toLocaleString("en-PK")})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Shop Info Card */}
            {selectedCustomer && (
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    {selectedCustomer.name}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {selectedCustomer.address || "علاقہ سیٹ نہیں"} {selectedCustomer.phone ? `• 📞 ${selectedCustomer.phone}` : ""}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">پچھلا ادھار (Old Khata)</span>
                  <span className="text-sm font-black font-mono text-amber-700">
                    Rs {selectedCustomer.balance.toLocaleString("en-PK")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: SELECT ITEMS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>2. سامان کے کاٹن درج کریں (Enter Cartons):</span>
              </span>
              <button
                onClick={() => {
                  setProdName("");
                  setProdRateCtn("");
                  setProdRetail("");
                  setIsNewProductModalOpen(true);
                }}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>نیا سامان</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="سامان تلاش کریں (Search item)..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
              {productSearch && (
                <button
                  onClick={() => setProductSearch("")}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Product Cards with BIG TOUCH BUTTONS & DIRECT NUMERIC INPUT */}
            <div className="space-y-2.5 pt-1">
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold">کوئی سامان نہیں ملا</p>
                  <button
                    onClick={() => setIsNewProductModalOpen(true)}
                    className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    + نیا سامان شامل کریں
                  </button>
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const cartons = cart[p.id] || 0;
                  const isSelected = cartons > 0;
                  const itemTotal = cartons * p.rate_ctn;

                  return (
                    <div
                      key={p.id}
                      className={`bg-white rounded-2xl p-3 border transition ${
                        isSelected
                          ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 shadow-sm"
                          : "border-slate-200 shadow-xs hover:border-slate-300"
                      }`}
                    >
                      {/* Item Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-sm text-slate-900 leading-snug">
                            {p.name}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            <span className="font-mono font-bold text-slate-800">
                              Rs {p.rate_ctn.toLocaleString("en-PK")} <span className="text-[10px] text-slate-500 font-normal">/ کاٹن</span>
                            </span>
                            {p.retail_price > 0 && (
                              <span className="text-[11px] text-slate-400">
                                MRP: Rs {p.retail_price}
                              </span>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="text-right">
                            <span className="text-xs font-black font-mono text-emerald-700 block">
                              Rs {itemTotal.toLocaleString("en-PK")}
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                              {cartons} کاٹن
                            </span>
                          </div>
                        )}
                      </div>

                      {/* BIG TOUCH STEPPER & DIRECT NUMERIC INPUT */}
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1.5">
                        <span className="text-xs font-bold text-slate-700 pl-2">
                          کاٹن تعداد (Cartons):
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Minus Button */}
                          <button
                            type="button"
                            onClick={() => changeCartons(p.id, -1)}
                            disabled={cartons === 0}
                            className={`w-10 h-10 rounded-xl font-black text-lg flex items-center justify-center transition active:scale-90 ${
                              cartons > 0
                                ? "bg-white border border-slate-300 text-slate-800 shadow-xs"
                                : "bg-slate-100 text-slate-300 cursor-not-allowed"
                            }`}
                          >
                            <Minus className="w-5 h-5" />
                          </button>

                          {/* Direct Editable Input */}
                          <input
                            type="number"
                            min="0"
                            value={cartons === 0 ? "" : cartons}
                            placeholder="0"
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setCartons(p.id, val);
                            }}
                            className="w-14 h-10 text-center font-black font-mono text-base bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-inner"
                          />

                          {/* Plus Button */}
                          <button
                            type="button"
                            onClick={() => changeCartons(p.id, 1)}
                            className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white font-black text-lg flex items-center justify-center shadow-xs transition"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* STEP 3: FLOATING BOTTOM ACTION BAR */}
          {cartEntries.length > 0 && (
            <div className="fixed bottom-16 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl z-40">
              <div className="max-w-xl mx-auto space-y-2">
                {/* Cash Received on Spot */}
                <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700">موقع پر وصولی کیش (Cash Received):</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="0"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="w-24 text-right bg-white border border-slate-300 rounded-lg p-1.5 font-bold font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setCashReceived(Math.round(grossBill).toString())}
                      className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-bold text-[11px]"
                    >
                      پورا کیش
                    </button>
                  </div>
                </div>

                {/* Big Green Confirm Button */}
                <button
                  onClick={handleCreateBill}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black rounded-2xl text-base shadow-lg flex items-center justify-between px-4 transition"
                >
                  <div className="text-left">
                    <span className="text-[11px] uppercase tracking-wider block opacity-90">
                      {totalCartons} کاٹن بک ہوئے
                    </span>
                    <span className="font-mono text-lg font-black leading-none">
                      Rs {grossBill.toLocaleString("en-PK")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm bg-emerald-800/40 px-3.5 py-2 rounded-xl">
                    <span>بل بنائیں اور پرنٹ کریں</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ============================================================== */}
      {/* SCREEN 2: GODOWN LOAD SHEET (گاڑی کا سامان / لوڈ شیٹ)         */}
      {/* ============================================================== */}
      {activeScreen === "loadsheet" && (
        <main className="max-w-xl mx-auto w-full p-3 space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                گاڑی کا سامان / لوڈ شیٹ
              </h2>
              <p className="text-xs text-slate-500">
                گودام سے ٹوٹل کتنے کاٹن لوڈ کرنے ہیں
              </p>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  const summaryLines = [
                    `*${settings.company_name} - لوڈ شیٹ (Load Sheet)*`,
                    `کل کاٹن: ${godownSummary.totalCartons} Cartons`,
                    `کل دکانیں: ${godownSummary.totalInvoices} Shops`,
                    `---------------------------------`,
                    ...godownSummary.itemsSummary.map((it) => `• ${it.product_name}: *${it.total_ctn} کاٹن*`),
                    `---------------------------------`,
                  ];
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(summaryLines.join("\n"))}`, "_blank");
                }}
                className="px-2.5 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-2.5 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>پرنٹ</span>
              </button>
            </div>
          </div>

          {/* Quick Counter */}
          <div className="bg-emerald-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs block opacity-90">کل کاٹن (Total Cartons):</span>
              <span className="text-3xl font-black font-mono">{godownSummary.totalCartons} کاٹن</span>
            </div>
            <div className="text-right">
              <span className="text-xs block opacity-90">کل دکانیں (Total Shops):</span>
              <span className="text-3xl font-black font-mono">{godownSummary.totalInvoices}</span>
            </div>
          </div>

          {/* Summary Items List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {godownSummary.itemsSummary.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                ابھی تک کوئی آرڈر بک نہیں ہوا
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-2.5 px-3 text-left">سامان کا نام (Item)</th>
                    <th className="py-2.5 px-3 text-center">کاٹن تعداد (Cartons)</th>
                    <th className="py-2.5 px-3 text-right">کل رقم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {godownSummary.itemsSummary.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold font-sans text-slate-900 text-xs">
                        {item.product_name}
                      </td>
                      <td className="py-3 px-3 text-center font-black text-emerald-700 text-sm">
                        {item.total_ctn} کاٹن
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">
                        Rs {item.total_amount.toLocaleString("en-PK")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* SCREEN 3: SHOPS & KHATA (دکانیں اور کھاتہ)                      */}
      {/* ============================================================== */}
      {activeScreen === "khata" && (
        <main className="max-w-xl mx-auto w-full p-3 space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                دکانیں اور کھاتہ (Shops & Khata)
              </h2>
              <p className="text-xs text-slate-500">
                تمام دکانوں کا بقایا ادھار اور وصولی
              </p>
            </div>
            <button
              onClick={() => {
                setShopName("");
                setShopArea("");
                setShopPhone("");
                setShopBalance("");
                setIsNewShopModalOpen(true);
              }}
              className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>نئی دکان</span>
            </button>
          </div>

          {/* Search Shops */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="دکان تلاش کریں (Search shop or area)..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          {/* Shop List */}
          <div className="space-y-2">
            {filteredCustomers.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between gap-2"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{c.name}</h3>
                    <button
                      onClick={() => {
                        setEditingCustomer(c);
                        setShopName(c.name);
                        setShopArea(c.address || "");
                        setShopPhone(c.phone || "");
                        setShopBalance(c.balance.toString());
                        setIsEditShopModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                      title="ایڈٹ کریں"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    📍 {c.address || "علاقہ سیٹ نہیں"} {c.phone ? `• 📞 ${c.phone}` : ""}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black font-mono text-amber-700 block">
                    Rs {c.balance.toLocaleString("en-PK")}
                  </span>
                  <button
                    onClick={() => {
                      setRecoveryCustomer(c);
                      setRecoveryAmount("");
                      setIsRecoveryModalOpen(true);
                    }}
                    className="mt-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200 transition"
                  >
                    + وصولی درج کریں
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* SCREEN 4: PRODUCTS & RATES (سامان اور ریٹ)                     */}
      {/* ============================================================== */}
      {activeScreen === "products" && (
        <main className="max-w-xl mx-auto w-full p-3 space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                سامان اور ریٹ لسٹ (Products)
              </h2>
              <p className="text-xs text-slate-500">
                پراڈکٹس شامل کریں، ریٹ تبدیل کریں
              </p>
            </div>
            <button
              onClick={() => {
                setProdName("");
                setProdRateCtn("");
                setProdRetail("");
                setIsNewProductModalOpen(true);
              }}
              className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>نیا سامان</span>
            </button>
          </div>

          <div className="space-y-2">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between gap-2"
              >
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{p.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      Rs {p.rate_ctn.toLocaleString("en-PK")} / کاٹن
                    </span>
                    {p.retail_price > 0 && (
                      <span className="text-[11px] text-slate-400">
                        MRP: Rs {p.retail_price}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setProdName(p.name);
                      setProdRateCtn(p.rate_ctn.toString());
                      setProdCtnSize(p.ctn_size.toString());
                      setProdRetail(p.retail_price > 0 ? p.retail_price.toString() : "");
                      setIsEditProductModalOpen(true);
                    }}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                    title="ایڈٹ کریں"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition"
                    title="ڈیلیٹ کریں"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* SCREEN 5: INVOICE HISTORY (پرانے بل)                           */}
      {/* ============================================================== */}
      {activeScreen === "history" && (
        <main className="max-w-xl mx-auto w-full p-3 space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 leading-tight">
              تمام پرانے بل (Past Invoices)
            </h2>
            <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full font-bold">
              {invoices.length} بلز
            </span>
          </div>

          <div className="space-y-2">
            {invoices.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs border border-slate-200">
                ابھی تک کوئی بل نہیں بنا
              </div>
            ) : (
              invoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setViewInvoice(inv)}
                  className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs cursor-pointer hover:border-emerald-500 transition flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-xs font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md">
                      #{inv.invoice_no}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">{inv.customer_name}</h3>
                    <p className="text-[11px] text-slate-400">{inv.invoice_date}</p>
                  </div>

                  <div className="text-right">
                    <span className="font-bold font-mono text-slate-900 text-sm block">
                      Rs {inv.gross_total.toLocaleString("en-PK")}
                    </span>
                    <span className="text-xs text-emerald-700 font-bold mt-1 inline-flex items-center gap-0.5">
                      <span>دیکھیں / پرنٹ</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR                                   */}
      {/* ============================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 shadow-lg px-2 py-1.5">
        <div className="max-w-xl mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveScreen("booker")}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
              activeScreen === "booker"
                ? "text-emerald-700 font-black"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <div className={`p-1 rounded-lg ${activeScreen === "booker" ? "bg-emerald-100" : ""}`}>
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">نیا بل</span>
          </button>

          <button
            onClick={() => setActiveScreen("loadsheet")}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
              activeScreen === "loadsheet"
                ? "text-emerald-700 font-black"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <div className={`p-1 rounded-lg ${activeScreen === "loadsheet" ? "bg-emerald-100" : ""}`}>
              <Package className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">لوڈ شیٹ</span>
          </button>

          <button
            onClick={() => setActiveScreen("khata")}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
              activeScreen === "khata"
                ? "text-emerald-700 font-black"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <div className={`p-1 rounded-lg ${activeScreen === "khata" ? "bg-emerald-100" : ""}`}>
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">کھاتہ</span>
          </button>

          <button
            onClick={() => setActiveScreen("products")}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
              activeScreen === "products"
                ? "text-emerald-700 font-black"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <div className={`p-1 rounded-lg ${activeScreen === "products" ? "bg-emerald-100" : ""}`}>
              <Store className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">سامان / ریٹ</span>
          </button>

          <button
            onClick={() => setActiveScreen("history")}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
              activeScreen === "history"
                ? "text-emerald-700 font-black"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <div className={`p-1 rounded-lg ${activeScreen === "history" ? "bg-emerald-100" : ""}`}>
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">پرانے بل</span>
          </button>
        </div>
      </nav>

      {/* ============================================================== */}
      {/* POPUP 1: INVOICE SLIP (EXACT MATCH WITH PAPER DISTRIBUTION BILL)*/}
      {/* ============================================================== */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[96vh] overflow-hidden text-black">
            
            {/* Action Bar */}
            <div className="print:hidden p-3 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-sm">بل رسید #{viewInvoice.invoice_no}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => sendInvoiceWhatsApp(viewInvoice)}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>پرنٹ کریں</span>
                </button>

                <button
                  onClick={() => setViewInvoice(null)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bill Receipt Body */}
            <div className="p-4 overflow-y-auto font-mono text-[11px] leading-tight print:p-0">
              <div className="border border-black p-3 max-w-[650px] mx-auto print:border-none">
                <div className="text-center pb-2 border-b border-black">
                  <h2 className="text-xl font-black uppercase tracking-wide">{settings.company_name}</h2>
                  <p className="text-[10px] font-bold">{settings.address}</p>
                  <p className="text-[10px] font-bold">Ph: {settings.phone}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 py-2 border-b border-black text-[11px]">
                  <div>
                    <p><span className="font-bold">M/s:</span> {viewInvoice.customer_name}</p>
                    <p><span className="font-bold">Area:</span> {viewInvoice.customer_area || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <p><span className="font-bold">Invoice #:</span> {viewInvoice.invoice_no}</p>
                    <p><span className="font-bold">Date:</span> {viewInvoice.invoice_date}</p>
                  </div>
                </div>

                {/* Table */}
                <table className="w-full text-left my-2 border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-t border-black font-bold">
                      <th className="py-1">Particulars</th>
                      <th className="py-1 text-center">Ctn</th>
                      <th className="py-1 text-right">Rate</th>
                      <th className="py-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewInvoice.items.map((it, idx) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="py-1 font-bold">{it.product_name}</td>
                        <td className="py-1 text-center font-black">{it.ctn}</td>
                        <td className="py-1 text-right">{it.rate_ctn.toFixed(2)}</td>
                        <td className="py-1 text-right font-black">{it.line_total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black">
                  <div className="border border-black p-2">
                    <p className="flex justify-between">
                      <span>پچھلا کھاتہ:</span>
                      <span className="font-bold">Rs {viewInvoice.previous_balance.toFixed(2)}</span>
                    </p>
                    <p className="flex justify-between font-black text-xs pt-1 border-t border-dashed mt-1">
                      <span>نیا کل بقایا:</span>
                      <span>Rs {viewInvoice.total_balance.toFixed(2)}</span>
                    </p>
                  </div>

                  <div className="border border-black p-2">
                    <p className="flex justify-between">
                      <span>آج کا بل:</span>
                      <span className="font-bold">Rs {viewInvoice.gross_total.toFixed(2)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>وصولی (Cash):</span>
                      <span className="font-bold">Rs {viewInvoice.cash_received.toFixed(2)}</span>
                    </p>
                  </div>
                </div>

                <p className="text-center text-[9px] text-gray-500 mt-3">
                  شکریہ! آپ کے تعاون کا بہت شکریہ
                </p>
              </div>
            </div>

            {/* Bottom Done Button */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 print:hidden text-center">
              <button
                onClick={() => setViewInvoice(null)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm"
              >
                ٹھیک ہے (Done)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* POPUP 2: NEW / EDIT SHOP MODAL                                 */}
      {/* ============================================================== */}
      {(isNewShopModalOpen || isEditShopModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl text-xs space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900">
                {isEditShopModalOpen ? "دکان کی معلومات تبدیل کریں" : "نئی دکان کا اندراج"}
              </h3>
              <button
                onClick={() => {
                  setIsNewShopModalOpen(false);
                  setIsEditShopModalOpen(false);
                }}
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={isEditShopModalOpen ? handleUpdateShop : handleSaveNewShop} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">دکان یا کسٹمر کا نام *</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: مدینہ کریانہ اسٹور"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full border rounded-xl p-2.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">علاقہ یا بازار (Area / Market)</label>
                <input
                  type="text"
                  placeholder="مثلاً: چاندنی چوک"
                  value={shopArea}
                  onChange={(e) => setShopArea(e.target.value)}
                  className="w-full border rounded-xl p-2.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">فون نمبر (Phone)</label>
                <input
                  type="tel"
                  placeholder="0300..."
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                  className="w-full border rounded-xl p-2.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">پہلے سے موجود ادھار (Old Khata)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={shopBalance}
                  onChange={(e) => setShopBalance(e.target.value)}
                  className="w-full border rounded-xl p-2.5 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewShopModalOpen(false);
                    setIsEditShopModalOpen(false);
                  }}
                  className="w-1/2 py-2.5 border rounded-xl font-bold text-slate-600"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  سیو کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* POPUP 3: NEW / EDIT PRODUCT MODAL                              */}
      {/* ============================================================== */}
      {(isNewProductModalOpen || isEditProductModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl text-xs space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900">
                {isEditProductModalOpen ? "سامان کی معلومات تبدیل کریں" : "نیا سامان شامل کریں"}
              </h3>
              <button
                onClick={() => {
                  setIsNewProductModalOpen(false);
                  setIsEditProductModalOpen(false);
                }}
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={isEditProductModalOpen ? handleUpdateProduct : handleSaveNewProduct} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">سامان کا نام (Item Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: COCONUT OIL 100ML"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">کاٹن ریٹ (Rate per Carton Rs) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="1080.00"
                  value={prodRateCtn}
                  onChange={(e) => setProdRateCtn(e.target.value)}
                  className="w-full border rounded-xl p-2.5 font-mono text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">پیک سائز (Ctn Size)</label>
                  <input
                    type="number"
                    placeholder="12"
                    value={prodCtnSize}
                    onChange={(e) => setProdCtnSize(e.target.value)}
                    className="w-full border rounded-xl p-2.5 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">پرنٹ ریٹ (MRP)</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={prodRetail}
                    onChange={(e) => setProdRetail(e.target.value)}
                    className="w-full border rounded-xl p-2.5 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewProductModalOpen(false);
                    setIsEditProductModalOpen(false);
                  }}
                  className="w-1/2 py-2.5 border rounded-xl font-bold text-slate-600"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  سیو کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* POPUP 4: CASH RECOVERY MODAL                                   */}
      {/* ============================================================== */}
      {isRecoveryModalOpen && recoveryCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl text-xs space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-900">پیسے وصول کیے (Cash Received)</h3>
                <p className="text-xs text-emerald-700 font-bold">{recoveryCustomer.name}</p>
              </div>
              <button onClick={() => setIsRecoveryModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl flex justify-between font-mono">
              <span className="text-slate-500">پچھلا ادھار:</span>
              <strong className="text-amber-700">Rs {recoveryCustomer.balance.toLocaleString("en-PK")}</strong>
            </div>

            <form onSubmit={handleSaveRecovery} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">وصول شدہ رقم (Rs) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={recoveryAmount}
                  onChange={(e) => setRecoveryAmount(e.target.value)}
                  className="w-full border rounded-xl p-2.5 font-mono text-base font-bold text-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecoveryModalOpen(false)}
                  className="w-1/2 py-2.5 border rounded-xl font-bold text-slate-600"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  وصولی سیو کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* POPUP 5: SETTINGS & BACKUP MODAL                               */}
      {/* ============================================================== */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl text-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900">سیٹنگز و ڈیٹا بیک اپ</h3>
              <button onClick={() => setIsSettingsModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-slate-700">کمپنی / ڈسٹری بیوٹر نام:</label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => {
                  const updated = { ...settings, company_name: e.target.value };
                  setSettings(updated);
                  Storage.saveSettings(updated);
                }}
                className="w-full border rounded-xl p-2 text-sm font-bold"
              />

              <label className="block font-bold text-slate-700">فون نمبر:</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => {
                  const updated = { ...settings, phone: e.target.value };
                  setSettings(updated);
                  Storage.saveSettings(updated);
                }}
                className="w-full border rounded-xl p-2 text-sm"
              />
            </div>

            {/* Backup and Restore Buttons */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={() => {
                  const data = Storage.exportBackup();
                  const blob = new Blob([data], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `mustafai_backup_${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>ڈیٹا بیک اپ ڈاؤن لوڈ کریں</span>
              </button>

              <button
                onClick={() => {
                  if (confirm("کیا آپ واقعی تمام ڈیٹا اصلی حالت پر ری سیٹ کرنا چاہتے ہیں؟")) {
                    Storage.resetToDefault();
                    refreshAll();
                    setIsSettingsModalOpen(false);
                  }
                }}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>تمام ڈیٹا ری سیٹ کریں</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
