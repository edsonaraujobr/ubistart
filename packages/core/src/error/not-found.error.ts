import { BaseError, type ErrorFields } from './base.error.js';
import { GlobalErrors } from './global.error.js';

export class NotFoundError<T = unknown> extends BaseError<T> {
  constructor(fields: ErrorFields = GlobalErrors.NotFound) {
    super({ ...fields, status: 404 });
  }
}
