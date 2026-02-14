export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'broker' | 'client' | 'analyst';
  is_active: boolean;
  avatar_url?: string;
  phone?: string;
  department?: string;
  created_at?: string;
}

export interface Client {
  id: number;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  industry?: string;
  company_size?: string;
  annual_revenue?: number;
  risk_score: number;
  retention_risk: 'low' | 'medium' | 'high';
  status: string;
  assigned_broker_id?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Policy {
  id: number;
  policy_number: string;
  client_id: number;
  carrier_id?: number;
  type: string;
  status: string;
  premium: number;
  deductible: number;
  coverage_limit: number;
  effective_date?: string;
  expiration_date?: string;
  description?: string;
  created_at?: string;
}

export interface Claim {
  id: number;
  claim_number: string;
  policy_id: number;
  client_id: number;
  type?: string;
  status: string;
  amount_claimed: number;
  amount_approved: number;
  amount_paid: number;
  date_filed?: string;
  date_of_loss?: string;
  date_resolved?: string;
  description?: string;
  fraud_risk_score: number;
  adjuster_notes?: string;
  created_at?: string;
}

export interface Carrier {
  id: number;
  name: string;
  code?: string;
  am_best_rating?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  api_integrated: boolean;
  integration_status: string;
  claims_ratio: number;
  avg_response_time_days: number;
  specialties?: string;
  status: string;
  notes?: string;
  created_at?: string;
}

export interface Renewal {
  id: number;
  policy_id: number;
  client_id: number;
  status: string;
  due_date: string;
  premium_current: number;
  premium_proposed: number;
  premium_change_pct: number;
  assigned_to?: number;
  priority: string;
  notes?: string;
  last_contacted?: string;
  created_at?: string;
}

export interface Certificate {
  id: number;
  certificate_number: string;
  client_id: number;
  policy_id: number;
  holder_name: string;
  holder_address?: string;
  status: string;
  issued_date?: string;
  expiration_date?: string;
  requested_by?: string;
  notes?: string;
  created_at?: string;
}

export interface Document {
  id: number;
  name: string;
  file_path: string;
  file_type?: string;
  file_size: number;
  category?: string;
  client_id?: number;
  policy_id?: number;
  claim_id?: number;
  uploaded_by?: number;
  description?: string;
  version: number;
  status: string;
  created_at?: string;
}

export interface Workflow {
  id: number;
  name: string;
  type?: string;
  status: string;
  trigger?: string;
  description?: string;
  steps_json?: string;
  created_by?: number;
  created_at?: string;
}

export interface WorkflowTask {
  id: number;
  workflow_id: number;
  title: string;
  description?: string;
  status: string;
  assigned_to?: number;
  priority: string;
  due_date?: string;
  completed_at?: string;
  created_at?: string;
}

export interface DashboardKPIs {
  total_clients: number;
  active_policies: number;
  pending_claims: number;
  total_premium_revenue: number;
  retention_rate: number;
}

export interface Alert {
  type: 'info' | 'warning' | 'danger';
  message: string;
}

export interface Notification {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  entity_id: number;
  date: string;
}
