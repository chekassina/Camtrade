import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

interface WhatsAppWidgetProps {
  phone?: string;
  message?: string;
}

export default function WhatsAppWidget({ phone = "237681188242", message }: WhatsAppWidgetProps) {
  const [pulsed, setPulsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPulsed(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    const text = message ? encodeURIComponent(message) : "";
    window.open(`https://wa.me/${phone}${text ? `?text=${text}` : ""}`, "_blank");
  };

  return (
    <motion.button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-[1050] w-[60px] h-[60px] bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(37,211,102,0.4)] cursor-pointer"
      whileHover={{ scale: 1.08 }}
      animate={!pulsed ? { scale: [1, 1.1, 1] } : {}}
      transition={!pulsed ? { duration: 2, times: [0, 0.5, 1] } : {}}
      title="Chat on WhatsApp"
    >
      <MessageCircle size={28} className="text-white" fill="white" />
      <span className="absolute -top-10 right-0 bg-white text-black text-xs px-2 py-1 rounded shadow opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat on WhatsApp
      </span>
    </motion.button>
  );
}
