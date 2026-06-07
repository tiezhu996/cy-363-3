import { API_BASE_URL } from "../constants/app";
import type {
  OverviewResponse,
  Theme,
  ThemeCreateInput,
  ThemeUpdateInput,
  ThemeListResponse,
  ThemeResponse,
  ThemeTypesResponse,
} from "../types";

export async function fetchOverview(): Promise<OverviewResponse> {
  const response = await fetch(`${API_BASE_URL}/overview`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Overview request failed: ${response.status}`);
  }

  return response.json() as Promise<OverviewResponse>;
}

export async function fetchThemes(): Promise<ThemeListResponse> {
  const response = await fetch(`${API_BASE_URL}/themes`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Fetch themes failed: ${response.status}`);
  }

  return response.json() as Promise<ThemeListResponse>;
}

export async function fetchOnlineThemes(): Promise<ThemeListResponse> {
  const response = await fetch(`${API_BASE_URL}/themes/online`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Fetch online themes failed: ${response.status}`);
  }

  return response.json() as Promise<ThemeListResponse>;
}

export async function fetchThemeTypes(): Promise<ThemeTypesResponse> {
  const response = await fetch(`${API_BASE_URL}/themes/types`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Fetch theme types failed: ${response.status}`);
  }

  return response.json() as Promise<ThemeTypesResponse>;
}

export async function createTheme(input: ThemeCreateInput): Promise<ThemeResponse> {
  const response = await fetch(`${API_BASE_URL}/themes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ errors: ["创建失败"] }));
    throw new Error(error.errors?.join(", ") || `Create theme failed: ${response.status}`);
  }

  return response.json() as Promise<ThemeResponse>;
}

export async function updateTheme(
  id: number,
  input: ThemeUpdateInput,
): Promise<ThemeResponse> {
  const response = await fetch(`${API_BASE_URL}/themes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ errors: ["更新失败"] }));
    throw new Error(error.errors?.join(", ") || `Update theme failed: ${response.status}`);
  }

  return response.json() as Promise<ThemeResponse>;
}

export async function toggleThemeStatus(id: number): Promise<ThemeResponse> {
  const response = await fetch(`${API_BASE_URL}/themes/${id}/toggle`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Toggle theme status failed: ${response.status}`);
  }

  return response.json() as Promise<ThemeResponse>;
}

export async function deleteTheme(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/themes/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Delete theme failed: ${response.status}`);
  }
}
