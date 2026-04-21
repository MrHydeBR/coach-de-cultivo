"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { createLog } from "@/lib/api";
import { LogInput } from "@/lib/types";

interface Props {
  cycleId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function LogForm({ cycleId, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    date: today(),
    ph_in: "",
    ec_in: "",
    volume_ml: "",
    runoff_ph: "",
    runoff_ec: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload: LogInput = {
      cycle_id: cycleId,
      date: form.date,
      ph_in: parseFloat(form.ph_in),
      ec_in: parseFloat(form.ec_in),
      volume_ml: parseInt(form.volume_ml, 10),
    };
    if (form.runoff_ph) payload.runoff_ph = parseFloat(form.runoff_ph);
    if (form.runoff_ec) payload.runoff_ec = parseFloat(form.runoff_ec);
    if (form.notes.trim()) payload.notes = form.notes.trim();

    try {
      await createLog(payload);
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-label="Registrar rega"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-md bg-bark-950 border border-bark-800 rounded-t-2xl sm:rounded-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-bark-50 text-lg">Registrar Rega</h2>
          <button
            onClick={onClose}
            tabIndex={0}
            aria-label="Fechar formulário"
            className="p-1 rounded-lg text-bark-400 hover:text-bark-100 hover:bg-bark-800 transition-colors"
            onKeyDown={(e) => e.key === "Enter" && onClose()}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-canopy-400">
            <CheckCircle2 className="w-12 h-12" />
            <p className="font-semibold text-canopy-300">Rega registrada!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Data */}
            <div>
              <label className="block text-xs text-bark-400 mb-1" htmlFor="log-date">
                Data *
              </label>
              <input
                id="log-date"
                type="date"
                required
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className="w-full rounded-lg bg-bark-900 border border-bark-700 text-bark-100 px-3 py-2 text-sm focus:outline-none focus:border-canopy-600"
              />
            </div>

            {/* pH in / EC in */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-bark-400 mb-1" htmlFor="log-ph-in">
                  pH entrada *
                </label>
                <input
                  id="log-ph-in"
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  required
                  placeholder="6.0"
                  value={form.ph_in}
                  onChange={(e) => set("ph_in", e.target.value)}
                  className="w-full rounded-lg bg-bark-900 border border-bark-700 text-bark-100 px-3 py-2 text-sm focus:outline-none focus:border-canopy-600"
                />
              </div>
              <div>
                <label className="block text-xs text-bark-400 mb-1" htmlFor="log-ec-in">
                  EC entrada *
                </label>
                <input
                  id="log-ec-in"
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  placeholder="1.8"
                  value={form.ec_in}
                  onChange={(e) => set("ec_in", e.target.value)}
                  className="w-full rounded-lg bg-bark-900 border border-bark-700 text-bark-100 px-3 py-2 text-sm focus:outline-none focus:border-canopy-600"
                />
              </div>
            </div>

            {/* Volume */}
            <div>
              <label className="block text-xs text-bark-400 mb-1" htmlFor="log-volume">
                Volume (mL) *
              </label>
              <input
                id="log-volume"
                type="number"
                min="1"
                required
                placeholder="500"
                value={form.volume_ml}
                onChange={(e) => set("volume_ml", e.target.value)}
                className="w-full rounded-lg bg-bark-900 border border-bark-700 text-bark-100 px-3 py-2 text-sm focus:outline-none focus:border-canopy-600"
              />
            </div>

            {/* Runoff pH / EC */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-bark-400 mb-1" htmlFor="log-runoff-ph">
                  pH saída
                </label>
                <input
                  id="log-runoff-ph"
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  placeholder="5.8"
                  value={form.runoff_ph}
                  onChange={(e) => set("runoff_ph", e.target.value)}
                  className="w-full rounded-lg bg-bark-900 border border-bark-700 text-bark-100 px-3 py-2 text-sm focus:outline-none focus:border-canopy-600"
                />
              </div>
              <div>
                <label className="block text-xs text-bark-400 mb-1" htmlFor="log-runoff-ec">
                  EC saída
                </label>
                <input
                  id="log-runoff-ec"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="2.0"
                  value={form.runoff_ec}
                  onChange={(e) => set("runoff_ec", e.target.value)}
                  className="w-full rounded-lg bg-bark-900 border border-bark-700 text-bark-100 px-3 py-2 text-sm focus:outline-none focus:border-canopy-600"
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-xs text-bark-400 mb-1" htmlFor="log-notes">
                Notas
              </label>
              <textarea
                id="log-notes"
                rows={2}
                placeholder="Observações opcionais..."
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                className="w-full rounded-lg bg-bark-900 border border-bark-700 text-bark-100 px-3 py-2 text-sm focus:outline-none focus:border-canopy-600 resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              tabIndex={0}
              aria-label="Salvar registro de rega"
              className="w-full py-3 rounded-lg bg-canopy-600 hover:bg-canopy-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Rega"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
