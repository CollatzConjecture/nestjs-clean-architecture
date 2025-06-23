# NestJS Clean Architecture with DDD, CQRS & Event Sourcing

This is an advanced boilerplate project implementing **Domain-Driven Design (DDD)**, **Clean Architecture**, **CQRS (Command Query Responsibility Segregation)**, and **Event Sourcing** with NestJS. It provides a robust foundation for building scalable and maintainable enterprise-level applications.

If you want more documentation about NestJS, click here [Nest](https://github.com/nestjs/nest) 

[A quick introduction to clean architecture](https://www.freecodecamp.org/news/a-quick-introduction-to-clean-architecture-990c014448d2/)

![Clean Architecture](https://cdn-media-1.freecodecamp.org/images/oVVbTLR5gXHgP8Ehlz1qzRm5LLjX9kv2Zri6)

## 🚀 Features

### Core Architecture
- **Clean Architecture**: Enforces separation of concerns with Domain, Application, and Infrastructure layers.
- **Domain-Driven Design (DDD)**: Encapsulates complex business logic using Aggregates and Domain Events.
- **CQRS**: Segregates read (Queries) and write (Commands) operations for optimized performance and scalability.
- **Event Sourcing**: Uses an event-driven approach with sagas for orchestrating complex business processes.
- **Aggregate Pattern**: Ensures data consistency and enforces business rules within domain aggregates.

### Security
- **JWT Authentication**: Implements secure, token-based authentication with refresh token rotation.
- **Role-Based Access Control (RBAC) Foundation**: Includes protected routes and strategies, ready for role implementation.
- **Secure Password Storage**: Hashes passwords using `bcrypt`.
- **Sensitive Data Encryption**: Encrypts sensitive fields (e.g., user emails) at rest in the database using AES-256-CBC.
- **Blind Indexing**: Allows for securely querying encrypted data without decrypting it first.

### Infrastructure & Operations
- **MongoDB Integration**: Utilizes Mongoose for structured data modeling with a NoSQL database.
- **Containerized Environment**: Full Docker and Docker Compose setup for development and production.
- **Health Checks**: Provides application health monitoring endpoints via Terminus.
- **Logging**: Includes a middleware for detailed request/response logging.
- **Application Metrics**: Exposes performance metrics for Prometheus.
- **Data Visualization**: Comes with a pre-configured Grafana dashboard for visualizing metrics.

### Testing
- **Unit & Integration Tests**: A suite of tests for domain, application, and infrastructure layers.
- **E2E Tests**: End-to-end tests to ensure API functionality from request to response.
- **High Test Coverage**: Configured to report and maintain high code coverage.
- **Mocking**: Clear patterns for mocking database and service dependencies.

## Getting Started

```bash
git clone https://github.com/CollatzConjecture/nestjs-clean-architecture
cd nestjs-clean-architecture
```

### 📁 Project Structure
```
.
├── doc/
│   ├── common.http              # Common API requests
│   └── users.http               # User-specific API requests
├── src/
│   ├── application/
│   │   ├── __test__/
│   │   │   └── *.spec.ts        # Application layer tests
│   │   ├── auth/
│   │   │   ├── command/         # Auth commands & handlers
│   │   │   ├── events/          # Auth domain events
│   │   │   ├── sagas/           # Registration saga
│   │   │   ├── jwt.strategy.ts  # JWT authentication strategy
│   │   │   └── local.strategy.ts # Local authentication strategy
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts    # Authentication endpoints
│   │   │   └── profile.controller.ts # Profile management
│   │   ├── dto/
│   │   │   ├── auth/            # Authentication DTOs
│   │   │   └── *.dto.ts         # Data transfer objects
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts # Request logging
│   │   ├── middlewere/
│   │   │   └── logger.middleware.ts   # HTTP logging
│   │   └── profile/
│   │       ├── command/         # Profile commands & handlers
│   │       └── events/          # Profile domain events
│   ├── domain/
│   │   ├── __test__/
│   │   │   └── *.spec.ts        # Domain layer tests
│   │   ├── aggregates/
│   │   │   └── user.aggregate.ts # User domain aggregate
│   │   ├── entities/
│   │   │   ├── Auth.ts          # Authentication entity
│   │   │   └── Profile.ts       # Profile entity
│   │   └── services/
│   │       ├── auth.service.ts  # Authentication business logic
│   │       ├── logger.service.ts # Logging service
│   │       └── profile.service.ts # Profile business logic
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── database.module.ts    # Database configuration
│   │   │   └── database.providers.ts # Database providers
│   │   ├── health/
│   │   │   └── terminus-options.check.ts # Health check config
│   │   ├── models/
│   │   │   ├── auth.model.ts    # Auth MongoDB model
│   │   │   ├── profile.model.ts # Profile MongoDB model
│   │   │   └── index.ts         # Model exports
│   │   └── repository/
│   │       ├── auth.repository.ts    # Auth data access
│   │       └── profile.repository.ts # Profile data access
│   ├── main.ts                  # Application entry point
│   ├── app.module.ts           # Root application module
│   └── constants.ts            # Application constants
├── test/
│   ├── app.e2e-spec.ts         # End-to-end tests
│   ├── jest-e2e.json           # E2E test configuration
│   └── setup-e2e.ts            # E2E test setup
├── prometheus/
│   └── prometheus.yml          # Prometheus configuration
├── docker-compose.yml          # Main Docker Compose
├── docker-compose.dev.yml      # Development environment
├── docker-compose.prod.yml     # Production environment
└── Dockerfile                  # Container definition
```

## 🏗️ Architecture Overview

### CQRS Implementation
- **Commands**: Handle write operations (Create, Update, Delete). Located in `src/application/*/command`.
- **Queries**: Handle read operations (Find, Get). Located in `src/application/*/query`.
- **Handlers**: Process commands and queries separately.
- **Events**: Publish domain events for side effects and inter-module communication.

### Event-Driven Flow
1. **User Registration**:
   ```
   RegisterCommand → CreateAuthUser → AuthUserCreated Event → 
   RegistrationSaga → CreateProfile → ProfileCreated
   ```

2. **Authentication**:
   ```
   LoginCommand → ValidateUser → JWT Token Generation
   ```

3. **Error Handling**:
   ```
   ProfileCreationFailed Event → RegistrationSaga → 
   DeleteAuthUser (Compensating Transaction)
   ```

## 📋 Prerequisites

- Node.js 18+
- Docker and Docker Compose
- MongoDB (included in Docker Compose)

## 🐳 Running with Docker Compose

The project is configured to run seamlessly with Docker. Use the npm scripts from `package.json` for convenience.

```bash
# Build and start containers in detached mode for development
$ npm run docker:dev

# Build and start containers for production
$ npm run docker:prod

# View logs for the API service
$ npm run docker:logs

# Stop all running containers
$ npm run docker:down

# Restart the development environment
$ npm run docker:restart
```

### 🌐 Service Access
- **Application**: http://localhost:4000
- **MongoDB**: localhost:27017
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)

## 📦 Installation

```bash
$ npm install
```

## 🚀 Running the Application

```bash
# Development
$ npm run start

# Watch mode (recommended for development)
$ npm run start:dev

# Production mode
$ npm run start:prod

# Debug mode
$ npm run start:debug
```

## 🧪 Testing

```bash
# Unit tests
$ npm run test

# E2E tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov

# Watch mode
$ npm run test:watch
```

## 🔐 API Endpoints

### Authentication
```http
POST /auth/register    # User registration
POST /auth/login       # User login
POST /auth/refresh-token # Token refresh
```

### Profile Management (Protected)
```http
GET  /profile         # Get current user's profile
GET  /profile/all     # Get all user profiles (Requires Admin Role)
GET  /hello           # Health check
POST /profile         # Create a new profile
```
**Note**: Endpoints like `/profile/all` are intended for administrative use and should be protected with a Role-Based Access Control (RBAC) guard in a production environment.

### Example Usage
```bash
# Register a new user
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "lastname": "Doe",
    "age": 30,
    "email": "john@example.com",
    "password": "securePassword123"
  }'

# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'

# Access protected route
curl -X GET http://localhost:4000/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🛠️ Built With

### Core Framework
- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript

### Architecture & Patterns
- **[@nestjs/cqrs](https://docs.nestjs.com/recipes/cqrs)** - CQRS implementation
- **[@nestjs/event-emitter](https://docs.nestjs.com/techniques/events)** - Event handling

### Authentication & Security
- **[@nestjs/jwt](https://docs.nestjs.com/security/authentication)** - JWT implementation
- **[@nestjs/passport](https://docs.nestjs.com/security/authentication)** - Authentication strategies
- **[bcrypt](https://www.npmjs.com/package/bcrypt)** - Password hashing

### Database & Storage
- **[Mongoose](https://mongoosejs.com/)** - MongoDB object modeling
- **[MongoDB](https://www.mongodb.com/)** - Document database

### Monitoring & Health
- **[@nestjs/terminus](https://docs.nestjs.com/recipes/terminus)** - Health checks
- **[Prometheus](https://prometheus.io/)** - Metrics collection
- **[Grafana](https://grafana.com/)** - Metrics visualization

### Testing
- **[Jest](https://jestjs.io/)** - Testing framework
- **[Supertest](https://www.npmjs.com/package/supertest)** - HTTP assertion library

### Development Tools
- **[Nodemon](https://nodemon.io/)** - Development server
- **[Docker](https://www.docker.com/)** - Containerization

## 🏛️ Domain-Driven Design

### Bounded Contexts
- **Authentication Context**: User login, registration, tokens
- **Profile Context**: User profile management, personal data

### Aggregates
- **UserAggregate**: Manages user lifecycle and events

### Domain Events
- `AuthUserCreatedEvent`: Triggered after successful user creation
- `ProfileCreationFailedEvent`: Triggered when profile creation fails

### Sagas
- **RegistrationSaga**: Orchestrates user registration process
  - Handles profile creation after auth user creation
  - Implements compensating transactions for failures

## 📈 Monitoring

### Health Checks
- Database connectivity
- Memory usage
- Disk space

### Metrics (Prometheus)
- HTTP request duration
- Request count by endpoint
- Error rates
- Database connection pool

### Dashboards (Grafana)
- Application performance metrics
- Database statistics
- Error tracking
- Response time analysis

## 👨‍💻 Authors

- **Jerry Lucas** - *Current Maintainer* - [GitHub](https://github.com/CollatzConjecture)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Edwin Caminero** - Inspiration for this project
- Clean Architecture principles by Robert C. Martin
- Domain-Driven Design concepts by Eric Evans
- CQRS and Event Sourcing patterns
- NestJS framework and community

## 📚 Further Reading

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- [NestJS Documentation](https://docs.nestjs.com/)

## ⚙️ Configuration

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/CollatzConjecture/nestjs-clean-architecture
    cd nestjs-clean-architecture
    ```

2.  **Create an environment file:**

    Create a file named `.env` in the root of the project by copying the example file.
    ```bash
    cp .env.example .env
    ```

3.  **Generate Secrets:**

    Your `.env` file requires several secret keys to run securely. Use the following command to generate a cryptographically strong secret:
    ```bash
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```
    Run this command for each of the following variables in your `.env` file and paste the result:
    - `JWT_SECRET`
    - `JWT_REFRESH_SECRET`
    - `EMAIL_ENCRYPTION_KEY`
    - `EMAIL_BLIND_INDEX_SECRET`

    **Do not use the same value for different keys.**
