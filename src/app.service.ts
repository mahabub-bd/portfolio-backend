import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): Record<string, any> {
    return {
      message: 'Welcome to the Mahabub API!',
      description: 'This API powers the backend for api.mahabub.me.',
      version: '1.0.0',
      documentation: 'https://api.mahabub.me/docs',
      endpoints: [
        {
          method: 'POST',
          path: '/api/auth/register',
          description: 'Register a new user',
        },
        {
          method: 'POST',
          path: '/api/auth/login',
          description: 'Authenticate a user and return a token',
        },
        {
          method: 'GET',
          path: '/api/auth/users',
          description: 'Fetch all registered users (protected)',
        },
      ],
    };
  }
}
