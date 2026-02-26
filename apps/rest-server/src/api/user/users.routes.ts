import type { Routes } from '@api/routes.js';
import { userCreationSchema } from './users.schema.js';
import { ContextProvider } from '@repo/core/context';
import type { ServerContext } from '@domain/model/context.model.js';
import type { UserInput } from '@domain/model/users.model.js';
import { CreateUserUseCase } from '@domain/users/create-user.use-case.js';
import type { AuthCredentials } from '@domain/model/auth.model.js';
import { authSchema } from './auth.schema.js';

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

];
