"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  Store,
  CheckCircle2,
  Phone,
  MapPin,
  X,
  CreditCard,
  Building2,
  ChevronRight,
  UserPlus,
  AlertCircle
} from "lucide-react";
import { Storage, Product, Customer, CompanySettings, Invoice } from "@/lib/storage";

interface CartItem {
  product: Product;
  ctn: number;
  pcs: number;
  bns: number;
  disc_pct: number;
  tr_offer: number;
  gst_pct: number;
}

interface Props {
  onOrderSuccess: (invoice: Invoice) => void;
}

export default function OrderBooker({ onOrderSuccess }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Cart
  const [cart, setCart] = useState<{ [key: number]: CartItem }>({});

  // UI state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isNewShopModalOpen, setIsNewShopModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Checkout inputs
  const [cashReceived, setCashReceived] = useState<string>("");
  const [invoiceDiscPct, setInvoiceDiscPct] = useState<number>(0);
  const [freight, setFreight] = useState<number>(0);
  const [notes, setNotes] = useState("");

  // New Customer Form
  const [newCustName, setNewCustName] = useState("");
  const [newCustUrdu, setNewCustUrdu] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustRoute, setNewCustRoute] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");
  const [newCustBal, setNewCustBal] = useState("");

  const refreshAll = () => {
    const custs = Storage.getCustomers();
    setCustomers(custs);
    if (custs.length > 0 && selectedCustomerId === null) {
      setSelectedCustomerId(custs[0].id);
    }
    setProducts(Storage.getProducts());
    setCategories(Storage.getCategories());
    setCompanySettings(Storage.getSettings());
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.name_urdu && p.name_urdu.includes(productSearch)) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.code && p.code.toLowerCase().includes(productSearch.toLowerCase()));
      const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, productSearch, selectedCategory]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.name_urdu && c.name_urdu.includes(q)) ||
        (c.route_name && c.route_name.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        c.code.toLowerCase().includes(q)
    );
  }, [customers, customerSearch]);

  const updateQty = (product: Product, field: "ctn" | "pcs", delta: number) => {
    setCart((prev) => {
      const current = prev[product.id] || {
        product,
        ctn: 0,
        pcs: 0,
        bns: 0,
        disc_pct: product.default_disc || 0,
        tr_offer: 0,
        gst_pct: 0,
      };

      const newQty = Math.max(0, (current[field] || 0) + delta);
      const updated = { ...current, [field]: newQty };

      if (updated.ctn === 0 && updated.pcs === 0) {
        const next = { ...prev };
        delete next[product.id];
        return next;
      }
      return { ...prev, [product.id]: updated };
    });
  };

  const addPresetCartons = (product: Product, delta: number) => {
    updateQty(product, "ctn", delta);
  };

  const cartList = Object.values(cart);
  const totalCtn = cartList.reduce((sum, item) => sum + item.ctn, 0);
  const totalPcs = cartList.reduce((sum, item) => sum + item.pcs, 0);

  const grossTotal = useMemo(() => {
    return cartList.reduce((sum, item) => {
      const base = (item.ctn * item.product.rate_ctn) + (item.pcs * item.product.rate_pcs);
      const disc = (base * (item.disc_pct / 100)) + item.tr_offer;
      return sum + Math.max(0, base - disc);
    }, 0);
  }, [cartList]);

  const discAmount = grossTotal * (invoiceDiscPct / 100);
  const netBill = Math.max(0, grossTotal - discAmount + freight);
  const prevBalance = selectedCustomer?.balance || 0;
  const cashRecNum = Number(cashReceived) || 0;
  const currentOrderDue = netBill - cashRecNum;
  const totalBalanceDue = prevBalance + currentOrderDue;

  const handleCreateNewShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const created = Storage.saveCustomer({
      name: newCustName.toUpperCase().trim(),
      name_urdu: newCustUrdu.trim(),
      phone: newCustPhone.trim(),
      route_name: newCustRoute.trim() || "Main Route",
      address: newCustAddress.trim(),
      balance: Number(newCustBal) || 0,
      code: "",
      credit_limit: 50000,
    });

    refreshAll();
    setSelectedCustomerId(created.id);
    setIsNewShopModalOpen(false);
    setIsCustomerModalOpen(false);
    setNewCustName("");
    setNewCustUrdu("");
    setNewCustPhone("");
    setNewCustRoute("");
    setNewCustAddress("");
    setNewCustBal("");
  };

  const handleBookOrder = () => {
    if (!selectedCustomerId) {
      alert("Please select a customer / shop! / برائے مہربانی دکان منتخب کریں");
      return;
    }
    if (cartList.length === 0) {
      alert("Cart is empty! Please add products. / برائے مہربانی پروڈکٹ ایڈ کریں");
      return;
    }

    setIsSubmitting(true);
    try {
      const createdInvoice = Storage.createInvoice({
        customer_id: selectedCustomerId,
        salesman: companySettings?.salesman_name || "Sales Representative",
        invoice_disc_pct: invoiceDiscPct,
        freight,
        cash_received: cashRecNum,
        notes,
        items: cartList.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          ctn_size: item.product.ctn_size,
          rate_ctn: item.product.rate_ctn,
          rate_pcs: item.product.rate_pcs,
          ctn: item.ctn,
          pcs: item.pcs,
          bns: item.bns,
          tr_offer: item.tr_offer,
          disc_pct: item.disc_pct,
          gst_pct: item.gst_pct,
        })),
      });

      setCart({});
      setIsCheckoutOpen(false);
      setCashReceived("");
      setNotes("");
      refreshAll();
      onOrderSuccess(createdInvoice);
    } catch (err: any) {
      alert(err.message || "Failed to book order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const businessTitle = companySettings?.company_name || "MUSTAFAI TRADERS";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 pb-36">
      
      {/* Top Header Card */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight uppercase flex items-center gap-1.5">
              <Store className="w-5 h-5 text-blue-600" />
              <span>{businessTitle}</span>
            </h1>
            <p className="text-xs text-slate-500">
              Order Booker / آرڈر بکنگ • {companySettings?.salesman_name || "Salesman"}
            </p>
          </div>

          <button
            onClick={() => setIsNewShopModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold active:scale-95 transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ New Shop / نئی دکان</span>
          </button>
        </div>

        {/* Customer / Shop Selection Card */}
        <div
          onClick={() => setIsCustomerModalOpen(true)}
          className="mt-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl p-3 cursor-pointer transition active:scale-[0.99] flex items-center justify-between"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-md">
                {selectedCustomer ? selectedCustomer.code : "SELECT"}
              </span>
              <span className="text-xs text-slate-500">Shop / دکان منتخب کریں:</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 mt-0.5 truncate uppercase">
              {selectedCustomer ? selectedCustomer.name : "Tap to Select Shop..."}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{selectedCustomer?.address || selectedCustomer?.route_name || "No location set"}</span>
            </div>
          </div>

          <div className="text-right pl-3 border-l border-slate-200 shrink-0">
            <span className="text-[10px] text-slate-500 font-medium block">Previous Khata / ادھار</span>
            <span className="text-sm font-bold font-mono text-amber-700">
              Rs {selectedCustomer ? selectedCustomer.balance.toLocaleString("en-PK") : "0"}
            </span>
            <span className="text-[10px] text-blue-600 font-semibold flex items-center justify-end gap-0.5 mt-0.5">
              Change <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </header>

      {/* Search & Categories Filter */}
      <div className="sticky top-[125px] z-20 bg-white/95 backdrop-blur-md px-3 pt-2.5 pb-2 border-b border-slate-200 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by name, Urdu, or code / پروڈکٹ تلاش کریں..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          {productSearch && (
            <button
              onClick={() => setProductSearch("")}
              className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition ${
              selectedCategory === "All"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Products / تمام
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products List */}
      <main className="p-3 space-y-2.5 flex-1">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-sm font-semibold">No products found / کوئی پروڈکٹ نہیں ملی</p>
            <p className="text-xs text-slate-400 mt-1">Try another search keyword</p>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const cartItem = cart[p.id];
            const ctn = cartItem?.ctn || 0;
            const pcs = cartItem?.pcs || 0;
            const isSelected = ctn > 0 || pcs > 0;
            const disc = cartItem?.disc_pct ?? p.default_disc;

            const baseAmount = (ctn * p.rate_ctn) + (pcs * p.rate_pcs);
            const lineTotal = baseAmount - (baseAmount * (disc / 100));

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl p-3.5 border transition ${
                  isSelected
                    ? "border-blue-500 ring-1 ring-blue-500 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Product Header */}
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 uppercase">
                        {p.category}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        Stock: <strong className={p.stock_ctn > 0 ? "text-emerald-700" : "text-rose-600"}>{p.stock_ctn} Ctn</strong>
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 mt-1 uppercase tracking-tight">
                      {p.name}
                      {p.name_urdu && <span className="font-normal text-slate-500 text-xs ml-1.5">({p.name_urdu})</span>}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1 font-mono">
                      <span>Rate/Ctn: <strong className="text-slate-900">Rs {p.rate_ctn.toFixed(2)}</strong></span>
                      <span>•</span>
                      <span>Rate/Pcs: Rs {p.rate_pcs.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-center">
                      <span className="text-[9px] text-slate-500 uppercase block font-semibold">MRP</span>
                      <span className="text-xs font-bold text-slate-900 font-mono">Rs {p.retail_price}</span>
                    </div>
                    {isSelected && (
                      <div className="mt-1 text-xs font-bold font-mono text-blue-700 text-right">
                        Rs {lineTotal.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Carton & Piece Controls */}
                <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2.5 border-t border-slate-100">
                  {/* Carton Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 pl-1">Carton / کاٹن:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(p, "ctn", -1)}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold active:scale-90"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-mono font-bold text-sm text-slate-900">
                        {ctn}
                      </span>
                      <button
                        onClick={() => updateQty(p, "ctn", 1)}
                        className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-90 text-white flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Loose Pieces Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 pl-1">Pieces / پیس:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(p, "pcs", -1)}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold active:scale-90"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-mono font-bold text-sm text-slate-900">
                        {pcs}
                      </span>
                      <button
                        onClick={() => updateQty(p, "pcs", 1)}
                        className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-90 text-white flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Add Presets */}
                <div className="flex items-center justify-between gap-1 mt-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => addPresetCartons(p, 1)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 rounded-md border border-slate-200"
                    >
                      +1 Ctn
                    </button>
                    <button
                      onClick={() => addPresetCartons(p, 2)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 rounded-md border border-slate-200"
                    >
                      +2 Ctn
                    </button>
                    <button
                      onClick={() => addPresetCartons(p, 5)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 rounded-md border border-slate-200"
                    >
                      +5 Ctn
                    </button>
                  </div>

                  {disc > 0 && (
                    <span className="text-[10px] text-slate-500 font-mono font-semibold">
                      Disc: {disc}%
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {cartList.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 p-3 z-40 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none">
          <div className="max-w-md mx-auto bg-slate-900 text-white rounded-2xl p-3.5 shadow-xl flex items-center justify-between pointer-events-auto border border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {cartList.length} Items
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {totalCtn} Ctn {totalPcs > 0 ? `+ ${totalPcs} Pcs` : ""}
                </span>
              </div>
              <div className="text-lg font-bold font-mono tracking-tight mt-0.5 text-white">
                Rs {grossTotal.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md flex items-center gap-1.5 transition"
            >
              <span>Review Order / بل فائنل کریں</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Checkout Drawer Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="font-bold text-base text-slate-900">
                  Confirm Order & Generate Bill / آرڈر و بل فائنل سمری
                </h2>
                <p className="text-xs text-blue-700 font-semibold uppercase mt-0.5">
                  {selectedCustomer?.name}
                </p>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5">
                <div className="flex justify-between text-slate-500 font-semibold pb-1 border-b border-slate-200">
                  <span>Selected Products ({cartList.length})</span>
                  <span>Total Cartons: {totalCtn}</span>
                </div>
                {cartList.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-none">
                    <span className="font-semibold text-slate-800 truncate max-w-[200px]">{item.product.name}</span>
                    <span className="font-mono text-slate-700 font-semibold">
                      {item.ctn} Ctn {item.pcs > 0 ? `+ ${item.pcs} Pcs` : ""}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Order Amount / کل بل:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    Rs {grossTotal.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Discount % / اضافی ڈسکاؤنٹ:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={invoiceDiscPct || ""}
                    onChange={(e) => setInvoiceDiscPct(parseFloat(e.target.value) || 0)}
                    className="w-16 text-right bg-white border border-slate-300 rounded-lg p-1 text-slate-900 font-mono"
                  />
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Previous Khata Balance / سابقہ ادھار:</span>
                  <span className="font-mono font-bold text-amber-700">
                    Rs {prevBalance.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Cash Received Now / موقع پر وصول شدہ رقم:
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-slate-400 font-mono">Rs</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white text-emerald-700 text-base font-mono font-bold border-2 border-emerald-500 rounded-xl focus:outline-hidden"
                    />
                  </div>

                  <div className="flex gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => setCashReceived("0")}
                      className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-semibold rounded-lg"
                    >
                      No Cash (ادھار Rs 0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashReceived(Math.round(netBill).toString())}
                      className="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-700 text-[10px] font-bold rounded-lg"
                    >
                      Full Bill (Rs {Math.round(netBill)})
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-xl p-3 flex justify-between items-center mt-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      New Total Balance Due / نیا باقی کھاتہ:
                    </span>
                    <span className="text-xs text-slate-300">Remaining after this invoice</span>
                  </div>
                  <span className="text-base font-bold font-mono text-amber-400">
                    Rs {totalBalanceDue.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-1/3 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl text-xs"
              >
                Back / واپس
              </button>
              <button
                onClick={handleBookOrder}
                disabled={isSubmitting}
                className="w-2/3 py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Saving... / محفوظ ہو رہا ہے</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirm Order & View Bill</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm max-h-[85vh] flex flex-col text-slate-900 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Select Shop / دکان منتخب کریں</h3>
                <p className="text-xs text-slate-500">Pick a registered shopkeeper</p>
              </div>
              <button onClick={() => setIsCustomerModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search shop by name or route..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 text-slate-900 rounded-xl text-xs border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto p-2 space-y-1.5 flex-1 text-xs">
              {filteredCustomers.map((c) => {
                const isCurrent = c.id === selectedCustomerId;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomerId(c.id);
                      setIsCustomerModalOpen(false);
                    }}
                    className={`p-3 rounded-2xl cursor-pointer transition border flex items-center justify-between ${
                      isCurrent
                        ? "bg-blue-50 border-blue-500 text-blue-900"
                        : "bg-white hover:bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-md">
                          {c.code}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 uppercase truncate">{c.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{c.address || c.route_name}</p>
                    </div>

                    <div className="text-right pl-2">
                      <span className="text-[9px] text-slate-400 block font-semibold">Khata / ادھار:</span>
                      <span className="text-xs font-bold font-mono text-amber-700">
                        Rs {c.balance.toLocaleString("en-PK")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsCustomerModalOpen(false);
                  setIsNewShopModalOpen(true);
                }}
                className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Shop / نئی دکان شامل کریں</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Shop Modal */}
      {isNewShopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 text-slate-900 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Add New Shop / نئی دکان</h3>
                <p className="text-xs text-slate-500">Register customer on the go</p>
              </div>
              <button onClick={() => setIsNewShopModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateNewShop} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Shop / Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Madina Karyana Store"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Route / Area (روٹ یا علاقہ)</label>
                <input
                  type="text"
                  placeholder="e.g. Main Stop / Chandani Chowk"
                  value={newCustRoute}
                  onChange={(e) => setNewCustRoute(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Phone Number / فون نمبر</label>
                <input
                  type="tel"
                  placeholder="03001234567"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Opening Balance / سابقہ بقایا ادھار</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newCustBal}
                  onChange={(e) => setNewCustBal(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewShopModalOpen(false)}
                  className="w-1/2 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl"
                >
                  Cancel / منسوخ
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save / محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
