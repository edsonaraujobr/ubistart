import { BaseError, type ErrorFields } from './base.error.js';
import { GlobalErrors } from './global.error.js';

export class UnauthorizedError<T = unknown> extends BaseError<T> {
  constructor(fields: ErrorFields = GlobalErrors.Unauthorized) {
    super({ ...fields, status: 401 });
  }
}
