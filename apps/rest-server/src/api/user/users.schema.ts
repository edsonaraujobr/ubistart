import { TypeUser } from '@repo/db';
import { z } from 'zod';

export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\d])(?=.*\S).{8,}$/;

export const FULL_NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ.'-]+(?:\s[A-Za-zÀ-ÖØ-öø-ÿ.'-]+)+$/;

export const emailSchemaField = z.string({ message: 'users.error.invalid-email' }).email('users.error.invalid-email');

const isValidPassword = (password: string) => password.match(PASSWORD_REGEX);

export const userSchema = z.object({
  id: z.string(),
  email: emailSchemaField,
  active: z.boolean(),
  name: z.string(),
  typeUser: z.nativeEnum(TypeUser, { message: 'users.error.invalid-type-user' }),
});

export const userCreationSchema = userSchema
  .omit({
    id: true,
    active: true,
    typeUser: true,
  })
  .extend({
    password: z
      .string({ message: 'users.error.required-password' })
      .refine(isValidPassword, 'users.error.invalid-password'),
    confirmPassword: z
      .string({ message: 'users.error.required-confirm-password' })
      .refine(isValidPassword, 'users.error.invalid-password'),
  });

export const passwordSchemaField = z
  .string({ message: 'users.error.required-password' })
  .nonempty({ message: 'users.error.required-password' });
  
export const loginInputSchema = z.object({
  email: emailSchemaField,
  password: passwordSchemaField,
});
