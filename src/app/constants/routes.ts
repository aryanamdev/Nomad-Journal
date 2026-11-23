const users = "/api/v2/users";

export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  USER: {
    LOGIN: `${users}/login`,
    REGISTER: `${users}/register`,
    DEMO: `${users}/demo`,
    VIEWER: `${users}/me`,
    LOGOUT: `${users}/logout`,
    VERIFY_EMAIL: `${users}/verifyEmail`,
  },
  JOURNALS: "/api/v2/journal",
  ENTRIES: "/api/v2/entries",
} as const;
