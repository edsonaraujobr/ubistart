import type { Routes } from '@api/routes.js';
import { loginInputSchema, userCreationSchema } from './users.schema.js';
import { ContextProvider } from '@repo/core/context';
import type { ServerContext } from '@domain/model/context.model.js';
import type { UserInput, UserLoginInput } from '@domain/model/users.model.js';
import { CreateUserUseCase } from '@domain/users/create-user.use-case.js';
import type { AuthCredentials } from '@domain/model/auth.model.js';
import { authSchema } from './auth.schema.js';
import { LoginUseCase } from '@domain/users/login.use.case.js';

export const UsersRoutes: Routes[] = [
  {
    base: '/users',
    post: {
      endpoint: '/',
      schema: {
        body: userCreationSchema,
        response: { 201: authSchema },
        tags: ['users'],
        description: 'Cria um novo usuário na plataforma e retorna as credenciais de autenticação',
        summary: 'Cria um novo usuário na plataforma e retorna as credenciais de autenticação',
      },
      handler: ({ body }: { body: UserInput }): Promise<AuthCredentials> => {
        const ip = ContextProvider.getInstance<ServerContext>().get().ip;
        return CreateUserUseCase.exec({ ...body, ip });
      },
    },
  },

  {
    base: '/users',
    post: {
      endpoint: '/login',
      schema: { 
        response: { 201: authSchema }, 
        tags: ['users'], 
        body: loginInputSchema,
        description: 'Realiza login de um usuário existente e retorna as credenciais de autenticação',
        summary: 'Realiza login de um usuário existente e retorna as credenciais de autenticação',
      },
      handler: ({ body }: { body: UserLoginInput }): Promise<AuthCredentials> => LoginUseCase.exec(body),
    },
  }

];
