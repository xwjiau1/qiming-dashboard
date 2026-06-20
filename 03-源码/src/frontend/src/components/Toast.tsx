import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
};

const colors = {
  success: 'bg-green-500/10 border-green-500/30 text-green-400',
  error: 'bg-red-500/10 border-red-500/30 text-red-400',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
};

let toastIdCounter = 0;
const listeners: Set<(toasts: Toast[]) => void> = new Set();
let currentToasts: Toast[] = [];

function notifyListeners() {
  listeners.forEach((fn) => fn([...currentToasts]));
}

export function toast(type: Toast['type'], message: string, duration = 3000) {
  const id = `toast-${++toastIdCounter}`;
  const t: Toast = { id, type, message, duration };
  currentToasts = [...currentToasts, t];
  notifyListeners();
  setTimeout(() => {
    currentToasts = currentToasts.filter((item) => item.id !== id);
    notifyListeners();
  }, duration);
  return id;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.add(setToasts);
    return () => { listeners.delete(setToasts); };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border backdrop-blur-sm shadow-lg ${colors[t.type]}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{t.message}</span>
              <button
                onClick={() => {
                  currentToasts = currentToasts.filter((item) => item.id !== t.id);
                  notifyListeners();
                }}
                className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
