import type { ErrorBody } from '@api/error.global-middleware.js';
import { dbClient } from '@data/db.client';
import { TokenType } from '@domain/model/auth.model.js';
import type { UserTokenData } from '@domain/model/users.model';
import { Env } from '@env';
import { faker } from '@faker-js/faker';
import { HttpClient, type HttpClientOptions, type HttpClientResponse } from '@repo/core/data';
import { JwtService } from '@repo/core/security';
import { expect } from 'chai';
import { addDays } from 'date-fns';
import FormData from 'form-data';
import fs from 'node:fs';

type RestBody<T> = T & { errors: ErrorBody[] };
export type HttpResponse<T> = HttpClientResponse<RestBody<T>>;

interface RequestOptions {
  endpoint: string;
  expectedStatus?: number;
  headers?: any;
  body?: any;
  query?: any;
}

interface MultipartRequestOptions extends RequestOptions {
  files?: Record<string, string>; 
}

interface TokenParams {
  userId: string;
  sessionId?: string;
  tokenType?: TokenType;
}

export class RequestMaker<T> {
  private readonly baseOptions: Partial<HttpClientOptions<T>> = {
    baseURL: `http://127.0.0.1:${Env.PORT}`,
    skipStatusValidation: true,
  };

  private token: string | null = null;

  async auth({ userId, sessionId, tokenType = TokenType.TOKEN }: TokenParams): Promise<void> {
    let session: any;
    if (!sessionId) {
      session = await dbClient.session.create({
        data: {
          id: faker.string.uuid(),
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresIn: addDays(new Date(), 4),
        },
      });
    }
    this.token = JwtService.sign<UserTokenData>({ payload: { userId, sessionId: sessionId ? sessionId : session.id, tokenType: tokenType } });
  }

  logout(): void {
    this.token = null;
  }

  post({ endpoint, expectedStatus = 201, body, query, headers }: RequestOptions): Promise<HttpResponse<T>> {
    return this.request({ method: 'POST', url: endpoint, body, query, headers, responseSchema: null }, expectedStatus);
  }

  get({ endpoint, expectedStatus = 200, query, headers }: RequestOptions): Promise<HttpResponse<T>> {
    return this.request({ method: 'GET', url: endpoint, query, headers, responseSchema: null }, expectedStatus);
  }

  put({ endpoint, expectedStatus = 200, body, query }: RequestOptions): Promise<HttpResponse<T>> {
    return this.request({ method: 'PUT', url: endpoint, body, query, responseSchema: null }, expectedStatus);
  }

  patch({ endpoint, expectedStatus = 200, body, query }: RequestOptions): Promise<HttpResponse<T>> {
    return this.request({ method: 'PATCH', url: endpoint, body: body ?? {}, query, responseSchema: null }, expectedStatus);
  }

  delete({ endpoint, expectedStatus = 200, body, query }: RequestOptions): Promise<HttpResponse<T>> {
    return this.request({ method: 'DELETE', url: endpoint, body, query, responseSchema: null }, expectedStatus);
  }

  private async request(options: HttpClientOptions<RestBody<T>>, expectedStatus = 200): Promise<HttpResponse<T>> {
    options = { ...this.baseOptions, ...options, responseSchema: null };

    if (this.token) {
      options.headers = { 
        ...options.headers, 
        authorization: this.token 
      };
    }

    const response = await HttpClient.request<RestBody<T>>(options);

    this.token = null;
    const expectMessage = `Expected status ${expectedStatus}: ${JSON.stringify(response.data)}`;

    expect(response.status).to.be.eq(expectedStatus, expectMessage);

    return response;
  }

  async patchMultipart({
    endpoint,
    expectedStatus = 200,
    body = {},
    files,
  }: MultipartRequestOptions ): Promise<HttpResponse<T>> {
    const formData = new FormData();
  
    // adiciona campos normais do body
    if (body) {
      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as any);
        }
      });
    }
  
    // adiciona arquivos (key = nome do campo, value = caminho do arquivo)
    if (files) {
      for (const [field, filePath] of Object.entries(files)) {
        formData.append(field, fs.createReadStream(filePath));
      }
    }
  
    return this.request(
      {
        method: 'PATCH',
        url: endpoint,
        body: formData,
        headers: {
          ...formData.getHeaders(),
        },
        responseSchema: null,
      },
      expectedStatus,
    );
  }
}
