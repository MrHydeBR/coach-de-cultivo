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
  doc_id: string;
  day: number;
  date: string;
  phase: "veg" | "flower";
  ph_in: number;
  ec_in: number;
  volume_ml: number;
  runoff_ph?: number | null;
  runoff_ec?: number | null;
  notes?: string;
  photo_url?: string | null;
  created_at: string;
}

export interface LogInput {
  cycle_id: string;
  date: string;
  ph_in: number;
  ec_in: number;
  volume_ml: number;
  runoff_ph?: number;
  runoff_ec?: number;
  notes?: string;
}

export interface CoachAlert {
  code: string;
  severity: "info" | "warning" | "danger";
  message: string;
  actions_24h: string[];
  actions_5d: string[];
}

export interface CoachDiagnosis {
  cycle_id: string;
  log_day: number;
  log_date: string;
  phase: "veg" | "flower";
  alerts: CoachAlert[];
  generated_at: string;
}

export interface VisionResult {
  visual_summary: string;
  issues: string[];
  positives: string[];
}

export interface ApiError {
  error: string;
  message: string;
}
