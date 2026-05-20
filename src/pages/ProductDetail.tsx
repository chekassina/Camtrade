import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star, Heart, ShoppingCart, MessageCircle, Minus, Plus,
  ChevronRight, Truck, ShieldCheck, RotateCcw
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import ProductCard from "@/components/ProductCard";
import PriceDisplay from "@/components/PriceDisplay";
import { trpc } from "@/providers/trpc";
import toast from "react-hot-toast";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");
  const [mainImage, setMainImage] = useState(0);

  const { data: product, isLoading } = trpc.product.getBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );
  const { data: relatedProducts } = trpc.product.featured.useQuery(
    { limit: 5 },
    { enabled: !!product }
  );

  const handleAddToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item: { productId: number }) => item.productId === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.priceFcfa,
        quantity,
        image: product.featuredImage,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Added to cart!");
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;
    const message = `Hi! I'm interested in ${product.name} - ${product.priceFcfa.toLocaleString()} FCFA (Quantity: ${quantity})`;
    window.open(`https://wa.me/237681188242?text=${encodeURIComponent(message)}`, "_blank");
  };

  const images: string[] = product?.images
    ? (typeof product.images === "string" ? JSON.parse(product.images) : product.images)
    : [];
  if (product?.featuredImage && !images.includes(product.featuredImage)) {
    images.unshift(product.featuredImage);
  }
  if (images.length === 0) {
    images.push(`https://placehold.co/600x600/D4A843/FFFFFF?text=${encodeURIComponent(product?.name?.substring(0, 20) || "Product")}`);
  }

  const tabs = [
    { key: "description" as const, label: "Description" },
    { key: "specs" as const, label: "Specifications" },
    { key: "reviews" as const, label: "Reviews" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container-main py-20">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-square bg-gray-200 rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container-main py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <button onClick={() => navigate("/products")} className="btn-primary">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const specs = [
    { label: "Brand", value: product.brand },
    { label: "Model / SKU", value: product.sku },
    { label: "Material", value: product.material },
    { label: "Dimensions", value: product.dimensions },
    { label: "Weight", value: product.weight },
    { label: "Origin", value: product.origin },
  ].filter((s) => s.value);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Breadcrumb */}
      <div className="container-main py-4">
        <nav className="text-sm text-gray-500 flex items-center gap-1">
          <Link to="/" className="hover:text-[#D4A843]">Home</Link>
          <ChevronRight size={14} />
          <Link to="/products" className="hover:text-[#D4A843]">Products</Link>
          <ChevronRight size={14} />
          {product.category && (
            <>
              <span className="hover:text-[#D4A843]">{product.category.name}</span>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-gray-700 line-clamp-1">{product.name}</span>
        </nav>
      </div>

      {/* Product Detail */}
      <div className="container-main py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={images[mainImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/600x600/D4A843/FFFFFF?text=${encodeURIComponent(product.name.substring(0, 20))}`;
                }}
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(i)}
                    className={`w-16 h-16 rounded border-2 overflow-hidden ${
                      i === mainImage ? "border-[#D4A843]" : "border-gray-200"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {product.category && (
              <span className="inline-block px-3 py-1 bg-[#D4A843]/10 text-[#D4A843] text-xs font-semibold rounded mb-3">
                {product.category.name}
              </span>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={
                      s <= Math.round(Number(product.rating || 0))
                        ? "text-[#D4A843] fill-[#D4A843]"
                        : "text-gray-200 fill-gray-200"
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            <div className="mb-6">
              <PriceDisplay
                fcfa={product.priceFcfa}
                usd={String(product.priceUsd)}
                comparePrice={product.comparePrice}
                size="lg"
              />
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className={`w-2 h-2 rounded-full ${(product.stockQuantity ?? 0) > 0 ? "bg-green-500" : "bg-red-500"}`} />
              <span className={`text-sm font-medium ${(product.stockQuantity ?? 0) > 0 ? "text-green-600" : "text-red-500"}`}>
                {(product.stockQuantity ?? 0) > 0 ? `In Stock (${product.stockQuantity ?? 0} available)` : "Out of Stock"}
              </span>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {product.shortDescription || product.description?.substring(0, 200)}...
            </p>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={(product.stockQuantity ?? 0) <= 0}
                className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
              <button
                onClick={handleWhatsAppOrder}
                className="bg-[#25D366] text-white px-7 py-3 rounded font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#1da851] transition-all"
              >
                <MessageCircle size={18} />
                Order on WhatsApp
              </button>
              <button className="btn-secondary flex items-center justify-center gap-2">
                <Heart size={18} />
                Add to Wishlist
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-100">
              {[
                { icon: Truck, text: "Free Delivery" },
                { icon: ShieldCheck, text: "Quality Guarantee" },
                { icon: RotateCcw, text: "Easy Returns" },
              ].map((badge) => (
                <div key={badge.text} className="text-center">
                  <badge.icon size={20} className="text-[#D4A843] mx-auto mb-1" />
                  <p className="text-xs text-gray-500">{badge.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mt-12 border-b border-gray-200">
          <div className="flex gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-[#D4A843] text-[#D4A843]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="py-8">
          {activeTab === "description" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description || "No description available."}
              </p>
            </motion.div>
          )}

          {activeTab === "specs" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {specs.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      {specs.map((spec) => (
                        <tr key={spec.label} className="border-b border-gray-100 last:border-0">
                          <td className="px-6 py-3 bg-gray-50 text-sm font-medium text-gray-700 w-1/3">
                            {spec.label}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No specifications available.</p>
              )}
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center py-10">
                <div className="flex justify-center mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={24}
                      className={
                        s <= Math.round(Number(product.rating || 0))
                          ? "text-[#D4A843] fill-[#D4A843]"
                          : "text-gray-200 fill-gray-200"
                      }
                    />
                  ))}
                </div>
                <p className="text-lg font-semibold">{product.rating} out of 5</p>
                <p className="text-gray-500 text-sm">Based on {product.reviewCount} reviews</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-12 mb-16">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {relatedProducts
                .filter((p) => p.id !== product.id)
                .slice(0, 5)
                .map((rp, i) => (
                  <ProductCard key={rp.id} product={rp} index={i} />
                ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
      <WhatsAppWidget phone="237674871651" message={`Hi! I'm interested in ${product.name}`} />
    </div>
  );
}
