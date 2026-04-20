// Tipos compartilhados entre frontend e backend.
// Sempre atualizar junto com qualquer mudança no contrato REST.

export interface CycleSetup {
  tent_height_cm: number;
  tent_width_cm: number;
  tent_depth_cm: number;
  light_watts: number;
  photoperiod_on_hours: number;
  substrate: string;
  pot: string;
  nutrient_line: string;
  runoff_target_ec_min: number;
  runoff_target_ec_max: number;
}

export interface Cycle {
  cycle_id: string;
  strain: string;
  start_date: string;
  flip_date: string;
  status: "active" | "completed" | "paused";
  updated_at: string;
  setup: CycleSetup;
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
