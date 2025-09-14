import { env } from '$env/dynamic/private';

const API_BASE_URL = env.API_BASE_URL || 'http://localhost:8080/api/v1';

export interface ApiError {
	error: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	user: {
		id: string;
		email: string;
		name: string;
		username?: string;
		created_at: string;
		updated_at: string;
	};
	token: string;
}

export interface RegisterRequest {
	email: string;
	name: string;
	username?: string;
	password: string;
}

export interface RegisterResponse {
	id: string;
	email: string;
	name: string;
	username?: string;
	created_at: string;
	updated_at: string;
}

export interface UserProfile {
	id: string;
	email: string;
	name: string;
	username?: string;
	created_at: string;
	updated_at: string;
}

class ApiClient {
	private baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		
		try {
			const response = await fetch(url, {
				headers: {
					'Content-Type': 'application/json',
					...options.headers,
				},
				...options,
			});

			if (!response.ok) {
				let errorMessage = 'An unexpected error occurred';
				
				try {
					const errorData = await response.json();
					if (errorData && typeof errorData === 'object' && 'error' in errorData) {
						errorMessage = errorData.error;
					} else if (typeof errorData === 'string') {
						errorMessage = errorData;
					}
				} catch (parseError) {
					// If JSON parsing fails, use status text
					errorMessage = response.statusText || `HTTP ${response.status}`;
				}
				
				throw new Error(errorMessage);
			}

			return response.json();
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error('Network error occurred');
		}
	}

	async login(credentials: LoginRequest): Promise<LoginResponse> {
		return this.request<LoginResponse>('/users/login', {
			method: 'POST',
			body: JSON.stringify(credentials),
		});
	}

	async register(userData: RegisterRequest): Promise<RegisterResponse> {
		return this.request<RegisterResponse>('/users/register', {
			method: 'POST',
			body: JSON.stringify(userData),
		});
	}

	async getProfile(token: string): Promise<UserProfile> {
		return this.request<UserProfile>('/users/profile', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
	}

	async getUserById(id: string, token: string): Promise<UserProfile> {
		return this.request<UserProfile>(`/users/${id}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
	}
}

export const apiClient = new ApiClient(API_BASE_URL);
