"use client";

import { useEffect, useState } from "react";
import { getActiveCycle, getLogs } from "@/lib/api";
import { IrrigationLog } from "@/lib/types";
import { Loader2, AlertCircle, Droplets } from "lucide-react";

function fmt(val: number | null | undefined, decimals = 1) {
  return val != null ? val.toFixed(decimals) : "—";
}

function LogRow({ log }: { log: IrrigationLog }) {
  const phOk =
    log.runoff_ph != null && log.runoff_ph >= 5.8 && log.runoff_ph <= 6.5;
  const phBad = log.runoff_ph != null && (log.runoff_ph < 5.5 || log.runoff_ph > 6.8);
  const ecOk = log.runoff_ec != null;

  return (
    <div className="rounded-xl bg-bark-900 border border-bark-800 p-4 space-y-3">
      {/* Day + date + phase */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-canopy-950 border border-canopy-800 flex items-center justify-center text-xs font-bold text-canopy-400">
            {log.day}
          </span>
          <div>
            <p className="text-sm font-medium text-bark-100">
              {new Date(log.date + "T12:00:00").toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}
            </p>
            <p className="text-xs text-bark-500 capitalize">{log.phase}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-bark-400">
          <Droplets className="w-3.5 h-3.5" />
          {log.volume_ml} mL
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="rounded-lg bg-bark-800/50 p-2">
          <p className="text-bark-500 mb-0.5">pH ent.</p>
          <p className="text-bark-100 font-medium">{fmt(log.ph_in)}</p>
        </div>
        <div className="rounded-lg bg-bark-800/50 p-2">
          <p className="text-bark-500 mb-0.5">EC ent.</p>
          <p className="text-bark-100 font-medium">{fmt(log.ec_in)}</p>
        </div>
        <div
          className={`rounded-lg p-2 ${
            phBad
              ? "bg-red-950/40 border border-red-800/40"
              : phOk
              ? "bg-canopy-950/40 border border-canopy-800/40"
              : "bg-bark-800/50"
          }`}
        >
          <p className="text-bark-500 mb-0.5">pH saída</p>
          <p
            className={`font-medium ${
              phBad ? "text-red-400" : phOk ? "text-canopy-400" : "text-bark-400"
            }`}
          >
            {fmt(log.runoff_ph)}
          </p>
        </div>
        <div className={`rounded-lg p-2 ${ecOk ? "bg-bark-800/50" : "bg-bark-800/30"}`}>
          <p className="text-bark-500 mb-0.5">EC saída</p>
          <p className="text-bark-100 font-medium">{fmt(log.runoff_ec)}</p>
        </div>
      </div>

      {log.notes && (
        <p className="text-xs text-bark-400 italic border-t border-bark-800 pt-2">
          {log.notes}
        </p>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<IrrigationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getActiveCycle()
      .then((cycle) => getLogs(cycle.cycle_id))
      .then(setLogs)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Loader2 className="animate-spin w-7 h-7 text-canopy-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-amber-800/50 bg-amber-950/30 p-5 flex gap-3 items-start mt-4">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-200/80">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-lg text-bark-50">Histórico de Regas</h1>
        <span className="text-xs text-bark-400">{logs.length} registros</span>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-xl border border-bark-800 bg-bark-900 p-8 text-center">
          <Droplets className="w-10 h-10 text-bark-600 mx-auto mb-3" />
          <p className="text-bark-400 text-sm">Nenhuma rega registrada ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <LogRow key={log.day} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}
