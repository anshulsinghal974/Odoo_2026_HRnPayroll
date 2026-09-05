// Auth and application state store skeleton

export interface AuthState {
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  } | null;
  token: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  token: null,
};
