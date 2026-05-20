import { Link } from "react-router-dom";
import { Star, Eye } from "lucide-react";
import { motion } from "framer-motion";
import PriceDisplay from "./PriceDisplay";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    priceFcfa: number;
    priceUsd: string;
    comparePrice: number | null;
    featuredImage: string | null;
    rating: string | null;
    reviewCount: number | null;
    isFeatured: boolean | null;
    stockQuantity: number | null;
  };
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const getImageUrl = (path: string | null) => {
    if (!path) return `https://placehold.co/400x400/D4A843/FFFFFF?text=${encodeURIComponent(product.name.substring(0, 15))}`;
    return path;
  };

  const stock = product.stockQuantity ?? 0;
  const reviews = product.reviewCount ?? 0;
  const featured = product.isFeatured ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link to={`/product/${product.slug}`}>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden group hover:border-[#D4A843] hover:shadow-[0_4px_16px_rgba(212,168,67,0.12)] hover:-translate-y-0.5 transition-all duration-300">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <img
              src={getImageUrl(product.featuredImage)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://placehold.co/400x400/D4A843/FFFFFF?text=${encodeURIComponent(product.name.substring(0, 15))}`;
              }}
            />
            {product.comparePrice && product.comparePrice > product.priceFcfa && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{Math.round((1 - product.priceFcfa / product.comparePrice) * 100)}%
              </span>
            )}
            {featured && (
              <span className="absolute top-2 right-2 bg-[#D4A843] text-white text-xs font-bold px-2 py-1 rounded">
                Featured
              </span>
            )}
            {/* Quick view */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#D4A843] text-white text-center py-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-1">
              <Eye size={14} />
              Quick View
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
              {product.name}
            </h3>

            <PriceDisplay
              fcfa={product.priceFcfa}
              usd={String(product.priceUsd)}
              comparePrice={product.comparePrice}
              size="sm"
            />

            <div className="flex items-center gap-1 mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    className={
                      star <= Math.round(Number(product.rating || 0))
                        ? "text-[#D4A843] fill-[#D4A843]"
                        : "text-gray-200 fill-gray-200"
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">({reviews})</span>
              <span className={`ml-auto text-xs font-medium ${stock > 0 ? "text-green-600" : "text-red-500"}`}>
                {stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
