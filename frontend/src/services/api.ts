import type { City, Activity, Trip, Stop, TripCost } from '../types/trip';
import type { UserProfile } from '../contexts/AuthContext';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('gt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json();
}

export const api = {
  // Auth
  auth: {
    login: async (email: string, password: string) => {
      const data = await request<{ access_token: string; user: UserProfile }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.access_token) {
        localStorage.setItem('gt_token', data.access_token);
      }
      return data;
    },
    signup: async (name: string, email: string, password: string) => {
      const data = await request<{ access_token: string; user: UserProfile }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      if (data.access_token) {
        localStorage.setItem('gt_token', data.access_token);
      }
      return data;
    },
    getMe: () => request<UserProfile>('/auth/me'),
    logout: () => {
      localStorage.removeItem('gt_token');
    },
    resetPassword: (email: string) =>
      request<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  },

  // Users
  users: {
    updateProfile: (profile: Partial<UserProfile>) =>
      request<UserProfile>('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      }),
    saveDestination: (cityId: string) =>
      request<UserProfile>(`/users/saved-destinations/${cityId}`, {
        method: 'POST',
      }),
    removeSavedDestination: (cityId: string) =>
      request<UserProfile>(`/users/saved-destinations/${cityId}`, {
        method: 'DELETE',
      }),
    deleteAccount: () =>
      request<void>('/users/me', {
        method: 'DELETE',
      }),
  },

  // Cities
  cities: {
    list: (params?: { query?: string; region?: string; maxBudget?: number }) => {
      const queryParams = new URLSearchParams();
      if (params?.query) queryParams.set('query', params.query);
      if (params?.region && params.region !== 'All regions') queryParams.set('region', params.region);
      if (params?.maxBudget) queryParams.set('maxBudget', params.maxBudget.toString());
      const qs = queryParams.toString();
      return request<City[]>(`/cities${qs ? `?${qs}` : ''}`);
    },
    get: (cityId: string) => request<City>(`/cities/${cityId}`),
  },

  // Activities
  activities: {
    list: (params?: { cityId?: string; category?: string; maxCost?: number; query?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.cityId) queryParams.set('cityId', params.cityId);
      if (params?.category && params.category !== 'All') queryParams.set('category', params.category);
      if (params?.maxCost !== undefined) queryParams.set('maxCost', params.maxCost.toString());
      if (params?.query) queryParams.set('query', params.query);
      const qs = queryParams.toString();
      return request<Activity[]>(`/activities${qs ? `?${qs}` : ''}`);
    },
    get: (activityId: string) => request<Activity>(`/activities/${activityId}`),
  },

  // Trips
  trips: {
    list: () => request<Trip[]>('/trips'),
    get: (tripId: string) => request<Trip>(`/trips/${tripId}`),
    getPublic: (tripId: string) => request<Trip>(`/trips/public/${tripId}`),
    create: (trip: Omit<Trip, 'id'> & { id?: string }) =>
      request<Trip>('/trips', {
        method: 'POST',
        body: JSON.stringify(trip),
      }),
    update: (tripId: string, patch: Partial<Trip>) =>
      request<Trip>(`/trips/${tripId}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      }),
    delete: (tripId: string) =>
      request<void>(`/trips/${tripId}`, {
        method: 'DELETE',
      }),
    duplicate: (tripId: string) =>
      request<Trip>(`/trips/${tripId}/duplicate`, {
        method: 'POST',
      }),
    exportCsvUrl: (tripId: string) => `${API_BASE}/trips/${tripId}/export/csv`,
    exportIcsUrl: (tripId: string) => `${API_BASE}/trips/${tripId}/export/ics`,
  },

  // Stops
  stops: {
    add: (tripId: string, stop: Omit<Stop, 'id'>) =>
      request<Stop>(`/trips/${tripId}/stops`, {
        method: 'POST',
        body: JSON.stringify(stop),
      }),
    update: (tripId: string, stopId: string, patch: Partial<Stop>) =>
      request<Stop>(`/trips/${tripId}/stops/${stop_id_clean(stopId)}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      }),
    remove: (tripId: string, stopId: string) =>
      request<void>(`/trips/${tripId}/stops/${stop_id_clean(stopId)}`, {
        method: 'DELETE',
      }),
    reorder: (tripId: string, stopId: string, direction: -1 | 1) =>
      request<Stop[]>(`/trips/${tripId}/stops/reorder`, {
        method: 'POST',
        body: JSON.stringify({ stopId, direction }),
      }),
    toggleActivity: (tripId: string, stopId: string, activityId: string) =>
      request<Stop>(`/trips/${tripId}/stops/${stop_id_clean(stopId)}/activities/${activityId}/toggle`, {
        method: 'POST',
      }),
  },

  // Budget
  budget: {
    getCost: (tripId: string) => request<TripCost>(`/trips/${tripId}/cost`),
    getOptimization: (tripId: string) =>
      request<{
        tripId: string;
        currentCost: number;
        budgetCap: number;
        isOverBudget: boolean;
        breakdown: { category: string; amount: number; percentage: number }[];
        tips: { title: string; description: string; potentialSavings: number; impact: string }[];
      }>(`/trips/${tripId}/budget-optimization`),
  },

  // AI
  ai: {
    suggestItinerary: (payload: {
      destinationCityId?: string;
      region?: string;
      startDate: string;
      durationDays: number;
      travelers: number;
      budgetCap: number;
      travelStyle?: string;
      interests?: string[];
    }) =>
      request<{
        name: string;
        description: string;
        coverImage: string;
        startDate: string;
        travelers: number;
        budgetCap: number;
        estimatedTotalCost: number;
        stops: {
          cityId: string;
          cityName: string;
          country: string;
          startDate: string;
          endDate: string;
          nights: number;
          notes: string;
          recommendedActivityIds: string[];
          estimatedStopCost: number;
        }[];
        aiRationale: string;
      }>('/ai/suggest-itinerary', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getPackingList: (tripId: string) =>
      request<{
        tripId: string;
        tripName: string;
        season: string;
        destinations: string[];
        weatherSummary: string;
        categories: {
          categoryName: string;
          items: { item: string; essential: boolean; tip?: string }[];
        }[];
      }>(`/ai/packing-list/${tripId}`),
  },

  // Admin
  admin: {
    getMetrics: () =>
      request<{
        totalTrips: number;
        totalUsers: number;
        avgBudgetCap: number;
        registeredCities: number;
        availableActivities: number;
        popularCities: { id: string; name: string; country: string; count: number }[];
      }>('/admin/metrics'),
    getLogs: () =>
      request<{
        id: string;
        user: string;
        userEmail: string;
        action: string;
        details: string;
        time: string;
      }[]>('/admin/logs'),
  },
};

function stop_id_clean(id: string) {
  return encodeURIComponent(id);
}
