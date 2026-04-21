"use client";

import { useRef, useState } from "react";
import { X, Loader2, AlertTriangle, Info, CheckCircle2, Camera, Eye, ThumbsUp } from "lucide-react";
import { createLog, getCoachDiagnosis, analyzePhoto } from "@/lib/api";
import { LogInput, CoachDiagnosis, CoachAlert, VisionResult } from "@/lib/types";

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
              <li key={i} className="text-xs text-bark-200 before:content-['›'] before:mr-1.5 before:text-bark-500">{a}</li>
            ))}
          </ul>
        </div>
      )}
      {alert.actions_5d.length > 0 && (
        <div>
          <p className="text-xs text-bark-400 mb-1">Próximos 5 dias</p>
          <ul className="space-y-0.5">
            {alert.actions_5d.map((a, i) => (
              <li key={i} className="text-xs text-bark-200 before:content-['›'] before:mr-1.5 before:text-bark-500">{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

async function resizeImage(file: File, maxPx = 1024): Promise<{ b64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      const mimeType = "image/jpeg";
      const b64 = canvas.toDataURL(mimeType, 0.85).split(",")[1];
      resolve({ b64, mimeType });
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function LogForm({ cycleId, onClose, onSuccess }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<CoachDiagnosis | null>(null);
  const [vision, setVision] = useState<VisionResult | null>(null);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(null);
    }
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
      setLoadingMsg("Salvando rega...");
      const saved = await createLog(payload);
      onSuccess?.();

      setLoadingMsg("Gerando diagnóstico...");
      const report = await getCoachDiagnosis(cycleId);
      setDiagnosis(report);

      if (photo) {
        setLoadingMsg("Analisando foto com IA...");
        try {
          const { b64, mimeType } = await resizeImage(photo);
          const visionResult = await analyzePhoto(cycleId, saved.doc_id, b64, mimeType);
          setVision(visionResult);
        } catch {
          // vision is optional — don't block on failure
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
      setLoadingMsg("");
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

        {/* Loading overlay */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-8 text-canopy-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm text-bark-300">{loadingMsg}</p>
          </div>
        )}

        {/* Coach report */}
        {!loading && diagnosis && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-canopy-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Dia {diagnosis.log_day} salvo — {diagnosis.phase === "flower" ? "floração" : "vegetativo"}</span>
            </div>

            {/* Vision result */}
            {vision && (
              <div className="rounded-lg border border-bark-700 bg-bark-900 p-4 space-y-3">
                <div className="flex items-center gap-2 text-bark-300 text-xs font-medium uppercase tracking-wide">
                  <Eye className="w-3.5 h-3.5" />
                  Análise Visual (Gemini)
                </div>
                <p className="text-sm text-bark-200 leading-relaxed">{vision.visual_summary}</p>
                {vision.positives.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-canopy-400 mb-1">
                      <ThumbsUp className="w-3 h-3" /> Positivo
                    </div>
                    <ul className="space-y-0.5">
                      {vision.positives.map((p, i) => (
                        <li key={i} className="text-xs text-canopy-300 before:content-['›'] before:mr-1.5 before:text-canopy-700">{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {vision.issues.length > 0 && (
                  <div>
                    <p className="text-xs text-amber-400 mb-1">Atenção</p>
                    <ul className="space-y-0.5">
                      {vision.issues.map((issue, i) => (
                        <li key={i} className="text-xs text-amber-300 before:content-['›'] before:mr-1.5 before:text-amber-700">{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Deterministic alerts */}
            {diagnosis.alerts.length === 0 && !vision ? (
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
        )}

        {/* Form */}
        {!loading && !diagnosis && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-bark-400 mb-1" htmlFor="log-date">Data *</label>
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
                <label className="block text-xs text-bark-400 mb-1" htmlFor="log-ph-in">pH entrada *</label>
                <input id="log-ph-in" type="number" step="0.1" min="0" max="14" required placeholder="6.0"
                  value={form.ph_in} onChange={(e) => set("ph_in", e.target.value)}
                  className="w-full rounded-lg bg-bark-900 border border-bark-700 text-bark-100 px-3 py-2 text-sm focus:outline-none focus:border-canopy-600" />
              </div>
              <div>
                <label className="block text-xs text-bark-400 mb-1" htmlFor="log-ec-in">EC entrada *</label>
                <input id="log-ec-in" type="number" step="0.1" min="0" required placeholder="1.8"
                  value={form.ec_in} onChange={(e) => set("ec_in", e.target.value)}
                  className="w-full rounded-lg bg-bark-900 border border-bark-700 text-bark-100 px-3 py-2 text-sm focus:outline-none focus:border-canopy-600" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-bark-400 mb-1" htmlFor="log-volume">Volume (mL) *</label>
              <input id="log-volume" type="number" min="1" required placeholder="500"
                value={form.volume_ml} onChange={(e) => set("volume_ml", e.target.value)}
                className="w-full rounded-lg bg-bark-900 border border-bark-700 text-bark-100 px-3 py-2 text-sm focus:outline-none focus:border-canopy-600" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-bark-400 mb-1" htmlFor="log-runoff-ph">pH saída</label>
                <input id="log-runoff-ph" type="number" step="0.1" min="0" max="14" placeholder="5.8"
                  value={form.runoff_ph} onChange={(e) => set("runoff_ph", e.target.value)}
                  className="w-full rounded-lg bg-bark-900 border border-bark-700 text-bark-100 px-3 py-2 text-sm focus:outline-none focus:border-canopy-600" />
              </div>
              <div>
                <label className="block text-xs text-bark-400 mb-1" htmlFor="log-runoff-ec">EC saída</label>
                <input id="log-runoff-ec" type="number" step="0.1" min="0" placeholder="2.0"
                  value={form.runoff_ec} onChange={(e) => set("runoff_ec", e.target.value)}
                  className="w-full rounded-lg bg-bark-900 border border-bark-700 text-bark-100 px-3 py-2 text-sm focus:outline-none focus:border-canopy-600" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-bark-400 mb-1" htmlFor="log-notes">Notas</label>
              <textarea id="log-notes" rows={2} placeholder="Observações opcionais..."
                value={form.notes} onChange={(e) => set("notes", e.target.value)}
                className="w-full rounded-lg bg-bark-900 border border-bark-700 text-bark-100 px-3 py-2 text-sm focus:outline-none focus:border-canopy-600 resize-none" />
            </div>

            {/* Photo upload */}
            <div>
              <label className="block text-xs text-bark-400 mb-2">Foto da planta (opcional)</label>
              <input
                ref={fileRef}
                id="log-photo"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoChange}
                aria-label="Selecionar foto da planta"
              />
              {photoPreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="Preview da planta" className="w-full h-40 object-cover rounded-lg border border-bark-700" />
                  <button
                    type="button"
                    onClick={() => { setPhoto(null); setPhotoPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                    tabIndex={0}
                    aria-label="Remover foto"
                    className="absolute top-2 right-2 p-1 rounded-full bg-bark-950/80 text-bark-300 hover:text-bark-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  tabIndex={0}
                  aria-label="Adicionar foto da planta"
                  onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
                  className="w-full py-3 rounded-lg border border-dashed border-bark-700 text-bark-400 hover:border-canopy-700 hover:text-canopy-400 text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Tirar / Escolher Foto
                </button>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              tabIndex={0}
              aria-label="Salvar registro de rega"
              className="w-full py-3 rounded-lg bg-canopy-600 hover:bg-canopy-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              Salvar Rega{photo ? " + Analisar Foto" : ""}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
