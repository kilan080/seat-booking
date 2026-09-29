import { useAuthStore } from "@/store/auth-store";

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return null;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    useAuthStore.getState().logout();
    return null;
  }

  const data = await res.json();
  useAuthStore.getState().setAccessToken(data.accessToken);
  return data.accessToken;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = useAuthStore.getState().accessToken;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status !== 401) {
    return res;
  }

  const newAccessToken = await refreshAccessToken();
  if (!newAccessToken) {
    return res; // refresh failed, return the original 401
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${newAccessToken}`,
    },
  });
}