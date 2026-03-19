import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Zap, IndianRupee } from 'lucide-react';

const HistoryPanel = () => {
  const { history } = useAuth();

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        Charging History
      </h3>

      {history.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No charging history yet</p>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {history.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between py-3 px-4 bg-secondary/50 rounded-lg border border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.station_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()} · {item.kwh} kWh
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary font-mono flex items-center gap-0.5">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {item.amount}
                </p>
                <span className="text-xs text-primary/70 capitalize">{item.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
