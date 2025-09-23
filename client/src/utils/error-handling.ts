import { supabase } from '@/supabase';

export interface ApiErrorData {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

export interface ApiErrorResponse {
  error: ApiErrorData;
}

// Generic API request function with error handling for our custom backend
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const config = { ...defaultOptions, ...options };
  config.headers = { ...defaultOptions.headers, ...options.headers };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      if (contentType?.includes('application/json')) {
        const errorData: ApiErrorResponse = await response.json();
        throw new ApiError(errorData.error?.code || 'UNKNOWN_ERROR', errorData.error?.message || 'An error occurred', errorData.error?.fieldErrors);
      } else {
        const textError = await response.text();
        throw new ApiError('HTTP_ERROR', textError || `HTTP ${response.status}: ${response.statusText}`);
      }
    }
    
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else {
      return response as unknown as T;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new ApiError('NETWORK_ERROR', 'Could not connect to the server. Please check your internet connection.');
    }
    throw new ApiError('UNKNOWN_ERROR', error instanceof Error ? error.message : 'An unknown error occurred');
  }
}

// Custom ApiError class
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Parse API error from various sources
export function parseApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  if (error instanceof Error) {
    return new ApiError('UNKNOWN_ERROR', error.message);
  }
  return new ApiError('UNKNOWN_ERROR', 'An unknown error occurred');
}

// Extract user-friendly error message
export function getErrorMessage(error: ApiError): string {
  const errorMessages: Record<string, string> = {
    'VALIDATION_ERROR': 'The data provided is invalid.',
    'AUTHENTICATION_ERROR': 'Invalid credentials. Please check your email and password.',
    'AUTHORIZATION_ERROR': 'You do not have permission to perform this action.',
    'NOT_FOUND_ERROR': 'The requested resource was not found.',
    'DUPLICATE_ERROR': 'A record with this information already exists.',
    'RATE_LIMIT_ERROR': 'Too many requests. Please wait a moment.',
    'NETWORK_ERROR': 'Network error. Please check your connection.',
    'FILE_UPLOAD_ERROR': 'Error uploading file.',
    'SERVER_ERROR': 'Internal server error. Please try again.',
  };
  return errorMessages[error.code] || error.message || 'An unknown error occurred';
}

// Extract field errors for forms
export function getFieldErrors(error: ApiError): Record<string, string> {
  return error.fieldErrors || {};
}

// Check if error is authentication related
export function isAuthError(error: ApiError): boolean {
  return error.code === 'AUTHENTICATION_ERROR' || error.code === 'AUTHORIZATION_ERROR';
}

// Helper for setting form errors in react-hook-form
export function setFormErrors(
  setError: (name: string, error: { message: string }) => void,
  fieldErrors: Record<string, string>
): void {
  Object.entries(fieldErrors).forEach(([field, message]) => {
    setError(field, { message });
  });
}

// Helper to focus first invalid field
export function focusFirstInvalidField(): void {
  setTimeout(() => {
    const firstErrorElement = document.querySelector('[aria-invalid="true"]') as HTMLElement;
    if (firstErrorElement) {
      firstErrorElement.focus();
    }
  }, 100);
}
