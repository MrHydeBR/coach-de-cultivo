"use client";

import { useEffect, useState } from "react";
import { getActiveCycle } from "@/lib/api";
import { Cycle } from "@/lib/types";
import { Leaf, AlertCircle, Loader2 } from "lucide-react";

export default function HomePage() {
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getActiveCycle()
      .then(setCycle)
      .catch((err: Error) => {
        // 404 é esperado — ainda não há ciclo cadastrado
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-bark-400">
        <Loader2 className="animate-spin w-8 h-8 text-canopy-500" />
        <p className="text-sm">Carregando dados do cultivo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-amber-800/50 bg-amber-950/30 p-6 flex gap-4 items-start mt-8">
        <AlertCircle className="w-6 h-6 text-amber-400 mt-0.5 shrink-0" />
        <div>
          <h2 className="font-semibold text-amber-300 mb-1">
            Nenhum ciclo ativo encontrado
          </h2>
          <p className="text-sm text-amber-200/70">
            {error.includes("No active cycle")
              ? "Inicie um novo ciclo para começar a acompanhar seu cultivo."
              : error}
          </p>
          <button
            className="mt-4 px-4 py-2 rounded-lg bg-canopy-700 hover:bg-canopy-600 text-canopy-50 text-sm font-medium transition-colors"
            tabIndex={0}
            aria-label="Criar novo ciclo de cultivo"
            onClick={() => alert("Em breve: tela de criação de ciclo!")}
            onKeyDown={(e) => e.key === "Enter" && alert("Em breve!")}
          >
            + Novo Ciclo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header do ciclo */}
      <div className="rounded-xl bg-bark-900 border border-bark-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-canopy-900 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-canopy-400" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-bark-50">
              {cycle?.setup.strain_name ?? "Ciclo Ativo"}
            </h1>
            <p className="text-xs text-bark-400">
              Iniciado em{" "}
              {cycle?.created_at
                ? new Date(cycle.created_at).toLocaleDateString("pt-BR")
                : "—"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-bark-800/50 p-3">
            <p className="text-bark-400 text-xs mb-1">Tenda</p>
            <p className="text-bark-100 font-medium">
              {cycle?.setup.tent_dimensions ?? "—"}
            </p>
          </div>
          <div className="rounded-lg bg-bark-800/50 p-3">
            <p className="text-bark-400 text-xs mb-1">Iluminação</p>
            <p className="text-bark-100 font-medium">
              {cycle?.setup.light_model ?? "—"}
            </p>
          </div>
          <div className="rounded-lg bg-bark-800/50 p-3">
            <p className="text-bark-400 text-xs mb-1">Substrato</p>
            <p className="text-bark-100 font-medium">
              {cycle?.setup.substrate ?? "—"}
            </p>
          </div>
          <div className="rounded-lg bg-bark-800/50 p-3">
            <p className="text-bark-400 text-xs mb-1">Nutrientes</p>
            <p className="text-bark-100 font-medium">
              {cycle?.setup.nutrients ?? "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Coach CTA */}
      <div className="rounded-xl bg-canopy-950/60 border border-canopy-800/50 p-6 text-center">
        <p className="text-canopy-300 text-sm">
          Registre a rega do dia para receber o diagnóstico do Coach! 🌿
        </p>
        <button
          className="mt-4 w-full py-3 rounded-lg bg-canopy-600 hover:bg-canopy-500 text-white font-semibold transition-colors"
          tabIndex={0}
          aria-label="Registrar rega do dia"
          onClick={() => alert("Em breve: tela de registro de rega!")}
          onKeyDown={(e) => e.key === "Enter" && alert("Em breve!")}
        >
          Registrar Rega + Foto
        </button>
      </div>
    </div>
  );
}
