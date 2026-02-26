import { BaseError, type ErrorFields } from './base.error.js';
import { GlobalErrors } from './global.error.js';

export class InvalidDataError<T = unknown> extends BaseError<T> {
  constructor(fields: ErrorFields = GlobalErrors.InvalidData) {
    super({ ...fields, status: 400 });
  }
}
