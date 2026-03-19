import { motion } from 'framer-motion';
import { MapPin, Navigation, Zap, Star, Battery } from 'lucide-react';
import { Station } from '@/data/stations';

interface StationCardProps {
  station: Station;
  onPay: (station: Station) => void;
  delay?: number;
}

const StationCard = ({ station, onPay, delay = 0 }: StationCardProps) => {
  const handleNavigate = () => {
    window.open(`https://www.google.com/maps?q=${station.lat},${station.lng}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:box-glow transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{station.name}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {station.address}
          </p>
        </div>
        <div className="flex items-center gap-1 text-primary text-sm font-mono">
          <Star className="w-3.5 h-3.5 fill-primary" />
          {station.rating}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Battery className="w-4 h-4" />
          {station.type}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Zap className="w-4 h-4" />
          <span className="text-primary font-semibold">₹{station.price}</span>/kWh
        </span>
      </div>

      {/* Availability bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Available</span>
          <span className="text-foreground font-mono">{station.available}/{station.total}</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(station.available / station.total) * 100}%` }}
            transition={{ delay: delay + 0.3, duration: 0.6 }}
            className="h-full gradient-primary rounded-full"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleNavigate}
          className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
        >
          <Navigation className="w-4 h-4" />
          Navigate
        </button>
        <button
          onClick={() => onPay(station)}
          className="flex-1 flex items-center justify-center gap-2 gradient-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Zap className="w-4 h-4" />
          Charge
        </button>
      </div>
    </motion.div>
  );
};

export default StationCard;
