export interface Memory {
  id?: string;
  input_text?: string;
  content?: string;
  title?: string;
  timestamp?: string;
  createdAt?: string;
  tags?: string[];
  category?: string;
  user_id?: string;
  session_id?: string;
  model_version?: string;
  tokens_input?: number;
}

export interface FilterTag {
  id: string;
  label: string;
}
