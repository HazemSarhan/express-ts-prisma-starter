export interface ApiData {
  [key: string]: unknown;
}

export interface ApiResponse<T = ApiData> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiErrorResponse {
  success: false;
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}
