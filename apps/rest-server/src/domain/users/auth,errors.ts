export const AuthErrors = {
  Credentials: { code: 'ATH_01', message: 'auth.error.credentials' },
  InvalidSession: { code: 'ATH_02', message: 'auth.error.invalid-session' },
  SessionNotFound: { code: 'ATH_03', message: 'auth.error.not-found' },
} as const;
