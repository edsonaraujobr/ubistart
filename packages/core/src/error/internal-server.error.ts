import { BaseError, type ErrorFields } from './base.error.js';
import { GlobalErrors } from './global.error.js';

export class InternalServerError<T> extends BaseError<T> {
  constructor(fields: ErrorFields = GlobalErrors.Generic) {
    super({ ...fields, status: 500 });
  }
}
