import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  cartCount?: number;
}

export default function Navbar({ cartCount = 0 }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Categories", href: "/#categories" },
    { label: "New Arrivals", href: "/products?sort=newest" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[#D4A843] text-white text-center py-2 text-xs md:text-sm font-medium">
        Free Delivery Across Cameroon | WhatsApp: +237 674871651
      </div>

      {/* Navbar */}
      <nav
        className={`sticky top-0 z-[1000] bg-white transition-shadow duration-300 ${
          scrolled ? "shadow-md" : "border-b border-gray-200"
        }`}
      >
        <div className="container-main">
          <div className="flex items-center justify-between h-[72px]">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#D4A843] rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold tracking-tight">
                CAMER<span className="text-[#D4A843]">TRADE</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm font-medium text-gray-700 hover:text-[#D4A843] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <button
                className="p-2 text-gray-500 hover:text-[#D4A843] transition-colors"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search size={22} />
              </button>
              <Link to="/products" className="p-2 text-gray-500 hover:text-[#D4A843] transition-colors relative">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4A843] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                to="/admin/login"
                className="hidden md:block btn-secondary !py-2 !px-5 text-xs"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-gray-200 bg-gray-50"
            >
              <form onSubmit={handleSearch} className="container-main py-3 flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for tiles, electronics, fashion..."
                    className="w-full h-12 pl-10 pr-4 bg-white border border-gray-200 rounded-lg focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn-primary !h-12">
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[2000]"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-white z-[2001] shadow-xl"
            >
              <div className="p-4 flex justify-between items-center border-b">
                <span className="font-bold text-lg">
                  CAMER<span className="text-[#D4A843]">TRADE</span>
                </span>
                <button onClick={() => setMobileOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="py-3 px-4 text-gray-700 hover:text-[#D4A843] hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t mt-4 pt-4">
                  <Link
                    to="/admin/login"
                    onClick={() => setMobileOpen(false)}
                    className="py-3 px-4 text-gray-700 hover:text-[#D4A843] font-medium block"
                  >
                    Admin Login
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
