export interface AuthUser {
  name: string;
  email: string;
}

const AUTH_KEY = "adaptive-study-planner.auth";

export const loadAuthUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const saveAuthUser = (user: AuthUser) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
};

export const clearAuthUser = () => {
  localStorage.removeItem(AUTH_KEY);
};
