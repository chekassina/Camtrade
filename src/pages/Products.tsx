import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Grid3x3, List, SlidersHorizontal, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import ProductCard from "@/components/ProductCard";
import { trpc } from "@/providers/trpc";

export default function Products() {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const { data: categoriesData } = trpc.category.list.useQuery();
  const { data: productsData, isLoading } = trpc.product.list.useQuery({
    categoryId: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 10000000 ? priceRange[1] : undefined,
    minRating: minRating > 0 ? minRating : undefined,
    sortBy,
    page,
    limit: 20,
  });

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < 10000000) count++;
    if (minRating > 0) count++;
    return count;
  }, [selectedCategories, priceRange, minRating]);

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 10000000]);
    setMinRating(0);
    setPage(1);
  };

  const pricePresets = [
    { label: "Under 50k", min: 0, max: 50000 },
    { label: "50k-200k", min: 50000, max: 200000 },
    { label: "200k-500k", min: 200000, max: 500000 },
    { label: "500k+", min: 500000, max: 10000000 },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <div className="bg-gray-50 py-10">
        <div className="container-main">
          <nav className="text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-[#D4A843]">Home</Link>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-700">Products</span>
          </nav>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
            All Products
          </h1>
          <p className="text-gray-500 mt-2">
            Browse our complete catalog of quality products
          </p>
        </div>
      </div>

      <div className="container-main py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-[260px] flex-shrink-0">
            <div className="sticky top-[100px] space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-[#D4A843] hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Categories</h4>
                <div className="space-y-2">
                  {(categoriesData || []).map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#D4A843] focus:ring-[#D4A843]"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-[#D4A843] transition-colors">
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Price Range (FCFA)</h4>
                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    placeholder="Min"
                    className="w-full h-9 px-2 border border-gray-200 rounded text-sm focus:border-[#D4A843] focus:outline-none"
                  />
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    placeholder="Max"
                    className="w-full h-9 px-2 border border-gray-200 rounded text-sm focus:border-[#D4A843] focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {pricePresets.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => setPriceRange([p.min, p.max])}
                      className="px-2 py-1 text-xs border border-gray-200 rounded hover:border-[#D4A843] hover:text-[#D4A843] transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Minimum Rating</h4>
                <div className="space-y-1">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                      className={`flex items-center gap-1 w-full px-2 py-1 rounded text-sm transition-colors ${
                        minRating === rating ? "bg-[#D4A843]/10 text-[#D4A843]" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          className={s <= rating ? "text-[#D4A843] fill-[#D4A843]" : "text-gray-300"}
                        />
                      ))}
                      <span className="ml-1">& Up</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                Showing {productsData?.products?.length || 0} of {productsData?.total || 0} products
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-1 text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded"
                >
                  <SlidersHorizontal size={14} />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="w-4 h-4 bg-[#D4A843] text-white text-[10px] rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-9 px-3 border border-gray-200 rounded text-sm focus:border-[#D4A843] focus:outline-none"
                >
                  <option value="featured">Sort by: Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Best Rated</option>
                </select>
                <div className="hidden sm:flex border border-gray-200 rounded overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-[#D4A843] text-white" : "text-gray-500 hover:bg-gray-50"}`}
                  >
                    <Grid3x3 size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-[#D4A843] text-white" : "text-gray-500 hover:bg-gray-50"}`}
                  >
                    <List size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden mb-6 bg-gray-50 p-4 rounded-lg"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(categoriesData || []).map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#D4A843]"
                      />
                      <span className="text-sm">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-lg animate-pulse aspect-[3/4]" />
                ))}
              </div>
            ) : productsData?.products?.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No products found</p>
                <button onClick={clearFilters} className="btn-primary mt-4">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 md:gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-1"
              }`}>
                {(productsData?.products || []).map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {productsData && productsData.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-200 rounded text-sm disabled:opacity-50 hover:border-[#D4A843]"
                >
                  Previous
                </button>
                {Array.from({ length: productsData.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded text-sm font-medium transition-colors ${
                      p === page ? "bg-[#D4A843] text-white" : "border border-gray-200 hover:border-[#D4A843]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(productsData.totalPages, page + 1))}
                  disabled={page === productsData.totalPages}
                  className="px-4 py-2 border border-gray-200 rounded text-sm disabled:opacity-50 hover:border-[#D4A843]"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppWidget />
    </div>
  );
}
