import { BaseError, type ErrorFields } from './base.error.js';
import { GlobalErrors } from './global.error.js';

export class ForbiddenError<T = unknown> extends BaseError<T> {
  constructor(fields: ErrorFields = GlobalErrors.Forbidden) {
    super({ ...fields, status: 403 });
  }
}
