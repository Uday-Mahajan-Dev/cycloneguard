"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { Send, CheckCircle2, ShieldAlert, X, Radio } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  stormId?: string;
  defaultMessageEn: string;
  defaultMessageLocal?: string;
}

export default function AlertModal({
  isOpen,
  onClose,
  stormId,
  defaultMessageEn,
  defaultMessageLocal,
}: AlertModalProps) {
  const [messageEn, setMessageEn] = useState(defaultMessageEn);
  const [messageLocal, setMessageLocal] = useState(defaultMessageLocal || "");
  const [severity, setSeverity] = useState("CRITICAL");
  const [channel, setChannel] = useState("TELEGRAM");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleDispatch = async () => {
    setLoading(true);
    try {
      const res = await api.dispatchAlert({
        storm_id: stormId,
        alert_type: "CYCLONE_EMERGENCY",
        severity,
        message_en: messageEn,
        message_local: messageLocal,
        target_audience: "PUBLIC_AND_EMERGENCY_SERVICES",
        dispatch_channel: channel,
      });
      setResult(res);
    } catch (err: any) {
      console.error("Alert dispatch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl relative font-sans text-slate-900 dark:text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Emergency Broadcast Dispatch Center
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-channel warning dissemination via Telegram API & Console Monitors
            </p>
          </div>
        </div>

        {result ? (
          <div className="space-y-4 py-4 text-center">
            <div className="inline-flex p-3 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-2">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-base font-bold">
              Broadcast Successfully Dispatched!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Channel: <span className="font-bold text-blue-600 dark:text-cyan-400">{channel}</span> | Status:{" "}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {result.delivery?.status || "Delivered"}
              </span>
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-left text-xs text-slate-700 dark:text-slate-300 space-y-1 max-h-32 overflow-y-auto">
              <div>{messageEn}</div>
              {messageLocal && <div className="text-blue-600 dark:text-cyan-300 pt-1">{messageLocal}</div>}
            </div>
            <button
              onClick={onClose}
              type="button"
              className="mt-4 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
            >
              Close Window
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 dark:text-slate-400 font-bold block mb-1">
                  Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  <option value="CRITICAL">RED ALERT (CRITICAL)</option>
                  <option value="SEVERE">ORANGE ALERT (SEVERE)</option>
                  <option value="ADVISORY">YELLOW ALERT (ADVISORY)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-bold block mb-1">
                  Broadcast Channel
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  <option value="TELEGRAM">Telegram Bot Channel</option>
                  <option value="SMS_GATEWAY">CAP SMS Gateway</option>
                  <option value="ALL_CHANNELS">All Emergency Channels</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 font-bold block mb-1">
                English Advisory Message
              </label>
              <textarea
                value={messageEn}
                onChange={(e) => setMessageEn(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 font-bold block mb-1">
                Local Language Bulletin (ଓଡ଼ିଆ - Odia)
              </label>
              <textarea
                value={messageLocal}
                onChange={(e) => setMessageLocal(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={onClose}
                type="button"
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatch}
                disabled={loading}
                type="button"
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? "DISPATCHING..." : "CONFIRM BROADCAST"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
