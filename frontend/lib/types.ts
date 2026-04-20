// Tipos compartilhados entre frontend e backend.
// Sempre atualizar junto com qualquer mudança no contrato REST.

export interface CycleSetup {
  strain_name: string;
  start_date: string;
  tent_dimensions: string;
  light_model: string;
  substrate: string;
  nutrients: string;
}

export interface Cycle {
  id: string;
  setup: CycleSetup;
  status: "active" | "completed" | "paused";
  created_at: string;
}

export interface IrrigationLog {
  id: string;
  cycle_id: string;
  logged_at: string;
  water_ml: number;
  runoff_ppm?: number;
  feed_ppm?: number;
  notes?: string;
  photo_url?: string;
}

export interface CoachDiagnosis {
  visual_summary?: string;
  alerts: Alert[];
  actions_24h: string[];
  actions_3_5d: string[];
  yield_estimate_g?: number;
}

export interface Alert {
  severity: "info" | "warning" | "danger";
  message: string;
}

export interface ApiError {
  error: string;
  message: string;
}
