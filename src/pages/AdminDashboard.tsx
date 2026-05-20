import { useState, useEffect, useRef } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, Grid3x3, ShoppingCart, MessageSquare,
  Settings, LogOut, Plus, Search, Pencil, Trash2, X, Upload,
  ChevronLeft, ChevronRight, DollarSign, Clock,
  Check, Eye, Menu, Bell
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import toast from "react-hot-toast";

// ---- Sidebar ----
function Sidebar({ active, onNavigate }: { active: string; onNavigate: (path: string) => void }) {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { key: "products", label: "Products", icon: Package, path: "/admin/products" },
    { key: "categories", label: "Categories", icon: Grid3x3, path: "/admin/categories" },
    { key: "orders", label: "Orders", icon: ShoppingCart, path: "/admin/orders" },
    { key: "messages", label: "Messages", icon: MessageSquare, path: "/admin/messages" },
    { key: "settings", label: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[260px] min-h-screen bg-gradient-to-b from-[#1A1A1A] to-[#252525] fixed left-0 top-0 z-[1000]">
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-8 h-8 bg-[#D4A843] rounded flex items-center justify-center">
          <span className="text-white font-bold text-sm">C</span>
        </div>
        <div>
          <span className="text-white font-bold">CAMER<span className="text-[#D4A843]">TRADE</span></span>
          <span className="block text-[10px] text-gray-500 uppercase tracking-wider">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
              active === item.key
                ? "bg-[#D4A843]/15 text-[#D4A843] border-l-[3px] border-[#D4A843]"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => {
            localStorage.removeItem("admin_token");
            window.location.href = "/admin/login";
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

// ---- TopBar ----
function TopBar({ title, onMenuClick }: { title: string; onMenuClick: () => void }) {
  const { data: me } = trpc.admin.me.useQuery(undefined, { retry: false });
  const { data: stats } = trpc.admin.dashboardStats.useQuery(undefined, { enabled: !!me });

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-[100]">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden p-2">
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-[#D4A843]">
          <Bell size={20} />
          {stats && stats.messageCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
              {stats.messageCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#D4A843] rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{(me?.displayName || "A")[0]}</span>
          </div>
          <span className="text-sm font-medium hidden sm:block">{me?.displayName || "Admin"}</span>
        </div>
      </div>
    </header>
  );
}

// ---- Dashboard Overview ----
function DashboardPage() {
  const { data: stats } = trpc.admin.dashboardStats.useQuery();
  const { data: recentOrders } = trpc.order.list.useQuery({ limit: 5 });

  const statCards = [
    { label: "Total Products", value: stats?.productCount ?? 0, icon: Package, color: "bg-[#D4A843]/10 text-[#D4A843]" },
    { label: "Total Orders", value: stats?.orderCount ?? 0, icon: ShoppingCart, color: "bg-blue-100 text-blue-600" },
    { label: "Revenue (FCFA)", value: (stats?.revenue ?? 0).toLocaleString(), icon: DollarSign, color: "bg-green-100 text-green-600" },
    { label: "Pending Orders", value: stats?.pendingOrders ?? 0, icon: Clock, color: "bg-amber-100 text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Order #</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Customer</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Amount</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {(recentOrders?.orders || []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No orders yet</td>
                </tr>
              ) : (
                (recentOrders?.orders || []).map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-6 py-3">{order.customerName}</td>
                    <td className="px-6 py-3">{order.totalAmount.toLocaleString()} FCFA</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.status === "completed" ? "bg-green-100 text-green-700" :
                        order.status === "pending" ? "bg-amber-100 text-amber-700" :
                        order.status === "processing" ? "bg-blue-100 text-blue-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---- Products Management ----
function ProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: productsData, refetch } = trpc.product.list.useQuery({
    search: search || undefined,
    page,
    limit: 10,
  });
  const { data: categoriesData } = trpc.category.list.useQuery();

  const deleteMutation = trpc.product.delete.useMutation({
    onSuccess: () => { toast.success("Product deleted"); refetch(); },
  });

  const createMutation = trpc.product.create.useMutation({
    onSuccess: () => { toast.success("Product created"); setShowModal(false); refetch(); },
  });
  const updateMutation = trpc.product.update.useMutation({
    onSuccess: () => { toast.success("Product updated"); setShowModal(false); refetch(); },
  });

  const [form, setForm] = useState({
    name: "", slug: "", description: "", shortDescription: "", categoryId: "",
    priceFcfa: "", priceUsd: "", comparePrice: "", sku: "", brand: "",
    material: "", dimensions: "", weight: "", origin: "", stockQuantity: "",
    featuredImage: "", isFeatured: false, isActive: true, status: "active" as const,
  });

  const openCreate = () => {
    setEditingProduct(null);
    setForm({
      name: "", slug: "", description: "", shortDescription: "", categoryId: "",
      priceFcfa: "", priceUsd: "", comparePrice: "", sku: "", brand: "",
      material: "", dimensions: "", weight: "", origin: "", stockQuantity: "",
      featuredImage: "", isFeatured: false, isActive: true, status: "active",
    });
    setUploadedImages([]);
    setActiveTab("basic");
    setShowModal(true);
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      categoryId: String(product.categoryId || ""),
      priceFcfa: String(product.priceFcfa),
      priceUsd: String(product.priceUsd),
      comparePrice: product.comparePrice ? String(product.comparePrice) : "",
      sku: product.sku || "",
      brand: product.brand || "",
      material: product.material || "",
      dimensions: product.dimensions || "",
      weight: product.weight || "",
      origin: product.origin || "",
      stockQuantity: String(product.stockQuantity || 0),
      featuredImage: product.featuredImage || "",
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      status: product.status,
    });
    const imgs = product.images ? (typeof product.images === "string" ? JSON.parse(product.images) : product.images) : [];
    setUploadedImages(Array.isArray(imgs) ? imgs : []);
    setActiveTab("basic");
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
      description: form.description || undefined,
      shortDescription: form.shortDescription || undefined,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      priceFcfa: Number(form.priceFcfa) || 0,
      priceUsd: form.priceUsd || String((Number(form.priceFcfa) || 0) / 600),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
      sku: form.sku || undefined,
      brand: form.brand || undefined,
      material: form.material || undefined,
      dimensions: form.dimensions || undefined,
      weight: form.weight || undefined,
      origin: form.origin || undefined,
      stockQuantity: Number(form.stockQuantity) || 0,
      featuredImage: form.featuredImage || undefined,
      images: uploadedImages.length > 0 ? uploadedImages : undefined,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
      status: form.status,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "x-admin-token": localStorage.getItem("admin_token") || "" },
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          setUploadedImages((prev) => [...prev, data.url]);
          if (!form.featuredImage) {
            setForm((f) => ({ ...f, featuredImage: data.url }));
          }
          toast.success("Image uploaded");
        } else {
          toast.error(data.error || "Upload failed");
        }
      } catch {
        toast.error("Upload failed");
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      if (form.featuredImage === prev[index]) {
        setForm((f) => ({ ...f, featuredImage: newImages[0] || "" }));
      }
      return newImages;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
          />
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Image</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Price (FCFA)</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Stock</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Featured</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(productsData?.products || []).map((product) => (
                <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <img
                      src={product.featuredImage || `https://placehold.co/50x50/D4A843/FFFFFF?text=P`}
                      alt=""
                      className="w-10 h-10 rounded object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/50x50/D4A843/FFFFFF?text=P"; }}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium max-w-[200px] truncate">{product.name}</td>
                  <td className="px-4 py-3">{product.priceFcfa.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${(product.stockQuantity ?? 0) <= (product.lowStockThreshold ?? 5) ? "text-red-500" : "text-green-600"}`}>
                      {product.stockQuantity ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {product.isFeatured ? (
                      <span className="text-[#D4A843]"><Check size={16} /></span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(product)} className="p-1.5 text-gray-400 hover:text-[#D4A843] hover:bg-[#D4A843]/10 rounded">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => { if (confirm("Delete this product?")) deleteMutation.mutate({ id: product.id }); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(productsData?.products || []).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {productsData && productsData.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="flex items-center gap-1 text-sm disabled:opacity-50">
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {productsData.totalPages}</span>
            <button onClick={() => setPage(Math.min(productsData.totalPages, page + 1))} disabled={page === productsData.totalPages} className="flex items-center gap-1 text-sm disabled:opacity-50">
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[2000]" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-4 md:inset-10 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-[640px] lg:max-h-[85vh] bg-white rounded-xl shadow-2xl z-[2001] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">{editingProduct ? "Edit Product" : "Add Product"}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b px-6">
                {["basic", "images", "pricing"].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? "border-[#D4A843] text-[#D4A843]" : "border-transparent text-gray-500"}`}>
                    {tab}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                {activeTab === "basic" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                      <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" placeholder="auto-generated-if-empty" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none">
                        <option value="">Select category</option>
                        {(categoriesData || []).map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                      <input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Brand</label><input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">SKU</label><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" /></div>
                    </div>
                  </div>
                )}

                {activeTab === "images" && (
                  <div className="space-y-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-[#D4A843] hover:bg-[#D4A843]/5 transition-all"
                    >
                      <Upload size={32} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Drag & drop or click to upload</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP - Max 5MB each</p>
                      <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} className="hidden" />
                    </div>

                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {uploadedImages.map((img, i) => (
                          <div key={i} className={`relative aspect-square rounded-lg overflow-hidden border-2 ${form.featuredImage === img ? "border-[#D4A843]" : "border-gray-200"}`}>
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                              <X size={10} />
                            </button>
                            <button type="button" onClick={() => setForm((f) => ({ ...f, featuredImage: img }))} className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-[#D4A843] text-white text-[10px] rounded">
                              {form.featuredImage === img ? "Featured" : "Set"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "pricing" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (FCFA) *</label>
                        <input type="number" value={form.priceFcfa} onChange={(e) => setForm({ ...form, priceFcfa: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD) *</label>
                        <input value={form.priceUsd} onChange={(e) => setForm({ ...form, priceUsd: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Compare Price</label><input type="number" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label><input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Material</label><input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label><input value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Weight</label><input value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Origin</label><input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" /></div>
                    </div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-[#D4A843]" />
                        <span className="text-sm">Featured on homepage</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-[#D4A843]" />
                        <span className="text-sm">Active</span>
                      </label>
                    </div>
                  </div>
                )}
              </form>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary !py-2 !px-5">Cancel</button>
                <button type="button" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary !py-2 !px-5 flex items-center gap-2 disabled:opacity-70">
                  {(createMutation.isPending || updateMutation.isPending) && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {editingProduct ? "Update" : "Save"} Product
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Categories Management ----
function CategoriesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", slug: "", icon: "", description: "" });
  const { data: categoriesData, refetch } = trpc.category.list.useQuery();

  const createMutation = trpc.category.create.useMutation({ onSuccess: () => { toast.success("Category created"); setShowModal(false); refetch(); } });
  const updateMutation = trpc.category.update.useMutation({ onSuccess: () => { toast.success("Category updated"); setShowModal(false); refetch(); } });
  const deleteMutation = trpc.category.delete.useMutation({ onSuccess: () => { toast.success("Category deleted"); refetch(); } });

  const openCreate = () => { setEditing(null); setForm({ name: "", slug: "", icon: "", description: "" }); setShowModal(true); };
  const openEdit = (cat: any) => { setEditing(cat); setForm({ name: cat.name, slug: cat.slug, icon: cat.icon, description: cat.description || "" }); setShowModal(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...form });
    } else {
      createMutation.mutate({ ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-") });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Categories</h2>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Icon</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Slug</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Products</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(categoriesData || []).map((cat) => (
              <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-gray-500">{cat.icon}</td>
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                <td className="px-4 py-3">{cat.productCount || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-[#D4A843] hover:bg-[#D4A843]/10 rounded"><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate({ id: cat.id }); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[2000]" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[480px] bg-white rounded-xl shadow-2xl z-[2001]">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">{editing ? "Edit" : "Add"} Category</h2>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" placeholder="auto-generated" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Icon (Lucide name) *</label><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" placeholder="e.g., Monitor, Shirt" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" /></div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary !py-2 !px-5">Cancel</button>
                  <button type="submit" className="btn-primary !py-2 !px-5">{editing ? "Update" : "Create"}</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Orders Page ----
function OrdersPage() {
  const [status, setStatus] = useState<string>("");
  const { data: ordersData } = trpc.order.list.useQuery({ status: status || undefined });
  const updateStatus = trpc.order.updateStatus.useMutation({ onSuccess: () => toast.success("Status updated") });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Order #</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Phone</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(ordersData?.orders || []).map((order) => (
              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                <td className="px-4 py-3">{order.customerName}</td>
                <td className="px-4 py-3">{order.customerPhone}</td>
                <td className="px-4 py-3">{order.totalAmount.toLocaleString()} FCFA</td>
                <td className="px-4 py-3">
                  <select
                    value={order.status ?? "pending"}
                    onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value as "pending" | "processing" | "completed" | "cancelled" })}
                    className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${
                      order.status === "completed" ? "bg-green-100 text-green-700" :
                      order.status === "pending" ? "bg-amber-100 text-amber-700" :
                      order.status === "processing" ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-700"
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button className="p-1.5 text-gray-400 hover:text-[#D4A843]"><Eye size={14} /></button>
                </td>
              </tr>
            ))}
            {(ordersData?.orders || []).length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- Messages Page ----
function MessagesPage() {
  const [filter, setFilter] = useState("");
  const { data: messagesData, refetch } = trpc.message.list.useQuery({ status: filter || undefined });
  const updateStatus = trpc.message.updateStatus.useMutation({ onSuccess: () => { toast.success("Updated"); refetch(); } });
  const deleteMutation = trpc.message.delete.useMutation({ onSuccess: () => { toast.success("Deleted"); refetch(); } });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none">
          <option value="">All Messages</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="space-y-3">
        {(messagesData?.messages || []).map((msg) => (
          <div key={msg.id} className="bg-white rounded-lg border border-gray-100 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900">{msg.customerName}</h4>
                <p className="text-xs text-gray-500">{msg.customerPhone} {msg.customerEmail && `| ${msg.customerEmail}`}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                msg.status === "new" ? "bg-amber-100 text-amber-700" :
                msg.status === "read" ? "bg-blue-100 text-blue-700" :
                msg.status === "replied" ? "bg-green-100 text-green-700" :
                "bg-gray-100 text-gray-600"
              }`}>{msg.status}</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{msg.content}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {msg.status === "new" && (
                  <button onClick={() => updateStatus.mutate({ id: msg.id, status: "read" })} className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Mark Read</button>
                )}
                {msg.status !== "replied" && (
                  <button onClick={() => updateStatus.mutate({ id: msg.id, status: "replied" })} className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">Mark Replied</button>
                )}
                <button onClick={() => updateStatus.mutate({ id: msg.id, status: "archived" })} className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">Archive</button>
              </div>
              <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate({ id: msg.id }); }} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {(messagesData?.messages || []).length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white rounded-lg border border-gray-100">No messages found</div>
        )}
      </div>
    </div>
  );
}

// ---- Settings Page ----
function SettingsPage() {
  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
        <h3 className="font-semibold text-gray-900">Store Settings</h3>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label><input defaultValue="CamerTrade" className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label><input defaultValue="+237 674871651" className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Currency</label><input defaultValue="FCFA" disabled className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">USD Exchange Rate</label><input defaultValue="600" className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none" /></div>
        </div>
        <button onClick={() => toast.success("Settings saved")} className="btn-primary">Save Settings</button>
      </div>
    </div>
  );
}

// ---- Main Admin Dashboard ----
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: me, isLoading, error: meError } = trpc.admin.me.useQuery(undefined, {
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && (!me || meError)) {
      navigate("/admin/login");
    }
  }, [me, isLoading, meError, navigate]);

  const getActiveKey = () => {
    const path = window.location.pathname;
    if (path.includes("/products")) return "products";
    if (path.includes("/categories")) return "categories";
    if (path.includes("/orders")) return "orders";
    if (path.includes("/messages")) return "messages";
    if (path.includes("/settings")) return "settings";
    return "dashboard";
  };

  const getTitle = () => {
    const key = getActiveKey();
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4A843] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!me) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar active={getActiveKey()} onNavigate={(path) => navigate(path)} />

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[999] md:hidden" onClick={() => setMobileMenuOpen(false)} />
            <motion.div initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} className="fixed left-0 top-0 bottom-0 w-[260px] bg-gradient-to-b from-[#1A1A1A] to-[#252525] z-[1000] md:hidden">
              <div className="p-6 flex items-center justify-between border-b border-white/10">
                <span className="text-white font-bold">CAMER<span className="text-[#D4A843]">TRADE</span></span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-white"><X size={20} /></button>
              </div>
              <nav className="p-4 space-y-1">
                {[
                  { key: "dashboard", label: "Dashboard", path: "/admin" },
                  { key: "products", label: "Products", path: "/admin/products" },
                  { key: "categories", label: "Categories", path: "/admin/categories" },
                  { key: "orders", label: "Orders", path: "/admin/orders" },
                  { key: "messages", label: "Messages", path: "/admin/messages" },
                  { key: "settings", label: "Settings", path: "/admin/settings" },
                ].map((item) => (
                  <button key={item.key} onClick={() => { navigate(item.path); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${getActiveKey() === item.key ? "bg-[#D4A843]/15 text-[#D4A843]" : "text-gray-400"}`}>
                    {item.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="md:ml-[260px]">
        <TopBar title={getTitle()} onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
