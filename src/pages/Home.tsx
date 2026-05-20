import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Truck, ShieldCheck, MessageCircle, CreditCard,
  Monitor, Laptop, Printer, Shirt, Baby, Smartphone,
  Sparkles, BookOpen, Bike, Sofa, HardHat, Refrigerator,
  ArrowRight, MessageCircle as MsgIcon
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import ProductCard from "@/components/ProductCard";
import { trpc } from "@/providers/trpc";

const categoryIcons: Record<string, React.ElementType> = {
  Monitor, Laptop, Printer, Shirt, Baby, Smartphone,
  Sparkles, BookOpen, Bike, Sofa, HardHat, Refrigerator,
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function Home() {
  const { data: categoriesData } = trpc.category.list.useQuery();
  const { data: featuredProducts } = trpc.product.featured.useQuery({ limit: 10 });
  const [cartCount] = useState(0);

  // Get cart count from localStorage
  useEffect(() => {
    const _cart = JSON.parse(localStorage.getItem("cart") || "[]");
    void _cart;
  }, []);

  const features = [
    { icon: Truck, title: "Free Delivery", desc: "Free shipping across major cities in Cameroon. Fast and reliable." },
    { icon: ShieldCheck, title: "Quality Guaranteed", desc: "All products verified for quality. 100% satisfaction guaranteed." },
    { icon: MessageCircle, title: "WhatsApp Support", desc: "Chat directly with us on WhatsApp for instant assistance and orders." },
    { icon: CreditCard, title: "Secure Payment", desc: "Multiple payment options. Mobile money, bank transfer, and cash on delivery." },
  ];

  return (
    <div className="min-h-screen">
      <Navbar cartCount={cartCount} />

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-108px)] flex items-center justify-center overflow-hidden bg-[#1A1A1A]">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] via-[#2D2418] to-[#1A1A1A]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,168,67,0.08)_0%,transparent_70%)]" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#D4A843] rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block text-[#D4A843] text-sm font-semibold tracking-[0.2em] uppercase mb-4">
              Cameroon's #1 Marketplace
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 text-shadow"
          >
            Quality Materials,
            <br />
            <span className="text-[#D4A843]">Trusted Prices</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 mb-10 max-w-xl mx-auto"
          >
            Cameroon's premier marketplace for construction materials, electronics, fashion, and more. Direct from suppliers to your doorstep.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/products" className="btn-primary !px-10 !py-4 text-base">
              Shop Now
            </Link>
            <Link
              to="/products"
              className="border-2 border-white text-white px-10 py-4 rounded font-semibold text-base hover:bg-white hover:text-black transition-all duration-300"
            >
              View Products
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Why Choose CamerTrade
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Premium quality, unbeatable prices, reliable delivery
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white border border-gray-200 rounded-lg p-8 text-center hover:border-[#D4A843] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(212,168,67,0.12)] transition-all duration-300"
              >
                <f.icon size={48} className="text-[#D4A843] mx-auto mb-4" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="section-padding bg-white">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Explore Categories
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Browse our wide range of products across all major categories
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6"
          >
            {(categoriesData || []).map((cat) => {
              const IconComp = categoryIcons[cat.icon] || Monitor;
              return (
                <motion.div
                  key={cat.id}
                  variants={itemVariants}
                  className="group"
                >
                  <Link
                    to={`/products?category=${cat.id}`}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center block hover:bg-white hover:border-[#D4A843] hover:shadow-[0_8px_24px_rgba(212,168,67,0.12)] transition-all duration-300"
                  >
                    <IconComp size={40} className="text-[#D4A843] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-sm text-gray-900 mb-1">{cat.name}</h3>
                    <p className="text-xs text-gray-500">{cat.productCount || 0} products</p>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-main">
          <div className="flex items-center justify-between mb-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
                Trending Now
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link
                to="/products"
                className="flex items-center gap-1 text-[#D4A843] font-medium hover:underline text-sm"
              >
                View All Products
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {(featuredProducts || []).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="relative py-16 md:py-20 bg-gradient-to-r from-[#1A1A1A] to-[#2D2418] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(212,168,67,0.1)_0%,transparent_60%)]" />
        <div className="container-main relative z-10 text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Order Directly on WhatsApp
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Get personalized assistance, negotiate prices, and place orders instantly. Our team is ready to help you find exactly what you need.
            </p>
            <a
              href="https://wa.me/237674871651"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 btn-primary !px-10 !py-4"
            >
              <MsgIcon size={18} />
              Chat on WhatsApp
            </a>
            <p className="text-[#D4A843] font-semibold mt-4 text-lg">+237 674871651</p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-padding bg-white">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Get in Touch
            </h2>
            <p className="text-gray-500">We're here to help you with any questions</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: MessageCircle, title: "WhatsApp", value: "+237 674871651", link: "https://wa.me/237674871651" },
              { icon: MsgIcon, title: "Email", value: "mugherick@gmail.com", link: "mailto:mugherick@gmail.com" },
              { icon: Truck, title: "Location", value: "Yaounde, Cameroon", link: "#" },
            ].map((item, i) => (
              <motion.a
                key={i}
                href={item.link}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center hover:border-[#D4A843] hover:shadow-lg transition-all"
              >
                <item.icon size={32} className="text-[#D4A843] mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.value}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppWidget />
    </div>
  );
}
