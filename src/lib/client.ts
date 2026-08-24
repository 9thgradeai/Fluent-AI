"use client";

import { useEffect, useState } from "react";
import type { UserProfile } from "./types";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** JSON fetch with cookies (same-origin) and RFC 7807 error decoding. */
export async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "same-origin",
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body?.detail ?? detail;
    } catch {
      // ignore
    }
    throw new ApiError(detail, res.status);
  }
  const ct = res.headers.get("content-type") ?? "";
  return ct.includes("json") ? ((await res.json()) as T) : ("" as T);
}

type AuthState = { user: UserProfile | null; loading: boolean; error: string | null };

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    api<{ user: UserProfile }>("/api/auth/me")
      .then((res) => {
        if (active) setState({ user: res.user, loading: false, error: null });
      })
      .catch((e) => {
        if (active) {
          setState({
            user: null,
            loading: false,
            error: e instanceof ApiError && e.status === 401 ? null : String(e),
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
