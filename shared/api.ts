export interface DemoResponse {
  message: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: string;
  timestamp: string;
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  timestamp: string;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;
