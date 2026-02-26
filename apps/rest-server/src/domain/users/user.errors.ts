export const UserErrors = {
  AlreadyRegistered: { code: 'USR_01', message: 'users.error.existing-email' },
  NotFound: { code: 'USR_02', message: 'users.error.not-found' },
  InvalidOldPassword: { code: 'USR_03', message: 'users.error.invalid-old-password' },
  AlreadyActive: { code: 'USR_07', message: 'users.error.already-active' },
  InvalidEmailOrPassword: { code: 'USR_08', message: 'auth.error.credentials' },
  UserNotActive: { code: 'USR_09', message: 'users.error.not-active' },
  PasswordNoMatch: { code: 'USR_10', message: 'users.error.password-no-match' },
  WrongPassword: { code: 'USR_11', message: 'users.error.wrong-password' },
} as const;
