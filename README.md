# Auth Microservice

A NestJS-based authentication microservice for managing user registration and login with JWT tokens and HttpOnly cookie support.

## Endpoints

### Public Endpoints

- `POST /auth/login` - Authenticate user and set HttpOnly cookie with access token

### Admin Endpoints (Admin Only)

- `POST /auth/register` - Register new staff member (admin access required)

## Installation (Dev)

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database and JWT secret
```

3. Run database migrations:
```bash
npx prisma migrate dev
```

## Usage (Dev)

Start the development server:
```bash
npm run start:dev
```

The service will be available at `http://localhost:3000` (or the port specified in your `.env` file).