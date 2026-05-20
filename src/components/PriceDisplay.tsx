interface PriceDisplayProps {
  fcfa: number;
  usd: string;
  comparePrice?: number | null;
  size?: "sm" | "md" | "lg";
}

export default function PriceDisplay({ fcfa, usd, comparePrice, size = "md" }: PriceDisplayProps) {
  const sizeClasses = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  const formatFcfa = (n: number) =>
    n.toLocaleString("en-US");

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className={`font-bold text-[#D4A843] ${sizeClasses[size]}`}>
        {formatFcfa(fcfa)} FCFA
      </span>
      <span className="text-gray-500 text-sm">
        ~${usd}
      </span>
      {comparePrice && comparePrice > fcfa && (
        <span className="text-gray-400 line-through text-sm">
          {formatFcfa(comparePrice)} FCFA
        </span>
      )}
    </div>
  );
}
