import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="container-main py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#D4A843] rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold tracking-tight">
                CAMER<span className="text-[#D4A843]">TRADE</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Cameroon's trusted marketplace for quality products since 2023.
            </p>
            <div className="flex gap-4 mt-6">
              {[Facebook, Instagram, Twitter, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-[#D4A843] hover:bg-white/20 transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-base mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {["Home", "About Us", "Products", "Categories", "Contact"].map((link) => (
                <li key={link}>
                  <Link to={link === "Home" ? "/" : `/${link.toLowerCase().replace(" ", "-")}`} className="text-gray-400 text-sm hover:text-[#D4A843] transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-base mb-4">Categories</h3>
            <ul className="space-y-3">
              {["Building Materials", "Electronics", "Fashion", "Phones", "Furniture", "Home Appliances"].map((cat) => (
                <li key={cat}>
                  <Link to="/products" className="text-gray-400 text-sm hover:text-[#D4A843] transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-base mb-4">Contact Us</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>WhatsApp: +237 674 871 651</p>
              <p>Email: mugherick@gmail.com</p>
              <p>Yaounde, Cameroon</p>
            </div>
            <div className="mt-6">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 h-10 px-3 bg-white/10 border border-white/20 rounded text-sm text-white placeholder-gray-500 focus:border-[#D4A843] focus:outline-none"
                />
                <button className="btn-primary !py-2 !px-4 text-xs">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="container-main py-5 text-center text-gray-500 text-sm">
          &copy; 2026 CamerTrade. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
