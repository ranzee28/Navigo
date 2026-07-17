import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, Info, TrafficCone, ShieldAlert, CheckCircle2 } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'traffic' | 'closure' | 'info' | 'success';
  title: string;
  message: string;
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgClass = '';
          let borderClass = '';
          let textClass = '';
          let icon = null;

          switch (toast.type) {
            case 'traffic':
              bgClass = 'bg-amber-50/95 dark:bg-amber-950/90 backdrop-blur-md';
              borderClass = 'border-amber-200 dark:border-amber-800';
              textClass = 'text-amber-800 dark:text-amber-200';
              icon = <TrafficCone className="w-5 h-5 text-amber-500 flex-shrink-0 animate-bounce" />;
              break;
            case 'closure':
              bgClass = 'bg-rose-50/95 dark:bg-rose-950/90 backdrop-blur-md';
              borderClass = 'border-rose-200 dark:border-rose-800';
              textClass = 'text-rose-800 dark:text-rose-200';
              icon = <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0 animate-pulse" />;
              break;
            case 'success':
              bgClass = 'bg-emerald-50/95 dark:bg-emerald-950/90 backdrop-blur-md';
              borderClass = 'border-emerald-200 dark:border-emerald-800';
              textClass = 'text-emerald-800 dark:text-emerald-200';
              icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
              break;
            case 'info':
            default:
              bgClass = 'bg-indigo-50/95 dark:bg-indigo-950/90 backdrop-blur-md';
              borderClass = 'border-indigo-200 dark:border-indigo-800';
              textClass = 'text-indigo-800 dark:text-indigo-200';
              icon = <Info className="w-5 h-5 text-indigo-500 flex-shrink-0" />;
              break;
          }

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex gap-3 p-4 rounded-2xl border ${borderClass} ${bgClass} shadow-xl relative overflow-hidden`}
            >
              {/* Left Color Indicator Accent bar */}
              <div 
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  toast.type === 'traffic' ? 'bg-amber-500' :
                  toast.type === 'closure' ? 'bg-rose-500' :
                  toast.type === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'
                }`} 
              />
              
              <div className="pl-1.5 flex gap-3 w-full">
                {icon}
                <div className="flex-1">
                  <h4 className={`text-xs font-bold leading-tight ${textClass}`}>
                    {toast.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                    {toast.message}
                  </p>
                </div>
                <button
                  onClick={() => onDismiss(toast.id)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-lg transition-colors cursor-pointer self-start"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
