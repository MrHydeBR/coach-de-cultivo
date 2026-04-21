"use client";

import { useState } from "react";
import { X, Loader2, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { createLog, getCoachDiagnosis } from "@/lib/api";
import { LogInput, CoachDiagnosis, CoachAlert } from "@/lib/types";

interface Props {
  cycleId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const severityStyle: Record<CoachAlert["severity"], string> = {
  danger: "border-red-800/60 bg-red-950/30 text-red-300",
  warning: "border-amber-800/60 bg-amber-950/30 text-amber-300",
  info: "border-canopy-800/60 bg-canopy-950/30 text-canopy-300",
};

const severityIcon = {
  danger: <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
  info: <Info className="w-4 h-4 text-canopy-400 shrink-0 mt-0.5" />,
};

function AlertCard({ alert }: { alert: CoachAlert }) {
  return (
    <div className={`rounded-lg border p-3 space-y-2 ${severityStyle[alert.severity]}`}>
      <div className="flex gap-2 items-start">
        {severityIcon[alert.severity]}
        <p className="text-sm font-medium leading-snug">{alert.message}</p>
      </div>
      {alert.actions_24h.length > 0 && (
        <div>
          <p className="text-xs text-bark-400 mb-1">Próximas 24h</p>
          <ul className="space-y-0.5">
            {alert.actions_24h.map((a, i) => (
              <li key={i} className="text-xs text-bark-200 before:content-['›'] before:mr-1.5 before:text-bark-500">
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
      {alert.actions_5d.length > 0 && (
        <div>
          <p className="text-xs text-bark-400 mb-1">Próximos 5 dias</p>
          <ul className="space-y-0.5">
            {alert.actions_5d.map((a, i) => (
              <li key={i} className="text-xs text-bark-200 before:content-['›'] before:mr-1.5 before:text-bark-500">
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
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
  const [diagnosis, setDiagnosis] = useState<CoachDiagnosis | null>(null);

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
      onSuccess?.();
      const report = await getCoachDiagnosis(cycleId);
      setDiagnosis(report);
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
      aria-label={diagnosis ? "Diagnóstico do Coach" : "Registrar rega"}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-md bg-bark-950 border border-bark-800 rounded-t-2xl sm:rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-bark-50 text-lg">
            {diagnosis ? "Diagnóstico do Coach" : "Registrar Rega"}
          </h2>
          <button
            onClick={onClose}
            tabIndex={0}
            aria-label="Fechar"
            className="p-1 rounded-lg text-bark-400 hover:text-bark-100 hover:bg-bark-800 transition-colors"
            onKeyDown={(e) => e.key === "Enter" && onClose()}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Coach report */}
        {diagnosis ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-canopy-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Rega do Dia {diagnosis.log_day} salva — {diagnosis.phase === "flower" ? "floração" : "vegetativo"}</span>
            </div>

            {diagnosis.alerts.length === 0 ? (
              <div className="rounded-lg border border-canopy-800/60 bg-canopy-950/30 p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-canopy-400 mx-auto mb-2" />
                <p className="text-canopy-300 text-sm font-medium">Tudo dentro do ideal!</p>
                <p className="text-bark-400 text-xs mt-1">Nenhum alerta para esta rega.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {diagnosis.alerts.map((alert, i) => (
                  <AlertCard key={i} alert={alert} />
                ))}
              </div>
            )}

            <button
              onClick={onClose}
              tabIndex={0}
              aria-label="Fechar diagnóstico"
              className="w-full py-3 rounded-lg bg-bark-800 hover:bg-bark-700 text-bark-100 font-semibold text-sm transition-colors"
              onKeyDown={(e) => e.key === "Enter" && onClose()}
            >
              Fechar
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
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
