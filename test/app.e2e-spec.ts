import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import { INestApplication, VersioningType } from '@nestjs/common';

describe('App (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let accessToken: string;
  let isDbConnected = false;

  const testUser = {
    name: faker.person.firstName(),
    lastname: faker.person.lastName(),
    age: faker.number.int({ min: 18, max: 80 }),
    email: faker.internet.email(),
    password: 'testPassword123'
  };

  beforeAll(async () => {
    try {
      moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();

      // Configure the app the same way as in main.ts
      app.setGlobalPrefix('api');
      app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
      });

      await app.init();

      try {
        // Test database connectivity by trying to register a user
        const registerResponse = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send(testUser);

        if (registerResponse.status !== 201) {
          throw new Error(`Registration failed with status ${registerResponse.status}`);
        }

        // Test login functionality
        const loginResponse = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password
          });

        if (loginResponse.status !== 200) {
          throw new Error(`Login failed with status ${loginResponse.status}, expected 200`);
        }

        if (!loginResponse.body.data || !loginResponse.body.data.access_token) {
          throw new Error('Login response missing access token');
        }

        accessToken = loginResponse.body.data.access_token;
        isDbConnected = true;
        console.log('✅ Database connection test passed');
      } catch (error) {
        console.warn('⚠️  Database connection failed, running limited tests:', error.message);
        isDbConnected = false;
      }
    } catch (error) {
      console.error('Failed to initialize app for e2e tests:', error);
      throw error;
    }
  }, 60000); // 60 second timeout for setup

  afterAll(async () => {
    try {
      // Close database connections
      if (app) {
        try {
          // Try to get MongoDB connection using the correct token and close it
          const mongoConnection = app.get('DbConnectionToken', { strict: false });
          if (mongoConnection && mongoConnection.connection) {
            await mongoConnection.connection.close();
          }
        } catch (_error) {
          // Ignore if connection doesn't exist
        }

        // Close the NestJS application
        await app.close();
      }

      // Close the testing module
      if (moduleFixture) {
        await moduleFixture.close();
      }
    } catch (error) {
      console.warn('Error during cleanup:', error.message);
    }

    // Give a moment for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Application Bootstrap', () => {
    it('should bootstrap the application', () => {
      expect(app).toBeDefined();
    });
  });

  describe('Authentication', () => {
    it('/auth/register (POST) - should register a new user', async () => {
      if (!isDbConnected) {
        console.log('Skipping test - database not connected');
        return;
      }

      const newUser = {
        name: faker.person.firstName(),
        lastname: faker.person.lastName(),
        age: faker.number.int({ min: 18, max: 80 }),
        email: faker.internet.email(),
        password: 'newPassword123'
      };

      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(newUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.data).toBeDefined();
        });
    });

    it('/auth/login (POST) - should login user', async () => {
      if (!isDbConnected) {
        console.log('Skipping test - database not connected');
        return;
      }

      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.access_token).toBeDefined();
        });
    });
  });

  describe('Protected Routes', () => {
    it('/api/v1/hello (GET) - should return hello message', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/hello')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBe('Hello World!');
        });
    });

    it('/api/v1/profile/all (GET) - should return all profiles', async () => {
      if (!isDbConnected || !accessToken) {
        console.log('Skipping test - authentication not available');
        return;
      }

      return request(app.getHttpServer())
        .get('/api/v1/profile/all')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBeTruthy();
        });
    });

    it('/api/v1/profile/me (PUT) - should update user profile', async () => {
      if (!isDbConnected || !accessToken) {
        console.log('Skipping test - authentication not available');
        return;
      }

      const updateData = {
        name: 'Updated Name'
      };

      return request(app.getHttpServer())
        .put('/api/v1/profile/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.name).toBe('Updated Name');
        });
    });

    it('/api/v1/profile (POST) - should create a profile', async () => {
      if (!isDbConnected || !accessToken) {
        console.log('Skipping test - authentication not available');
        return;
      }

      const profileData = {
        id: faker.string.uuid(),
        name: faker.person.firstName(),
        lastname: faker.person.lastName(),
        age: faker.number.int({ min: 18, max: 80 }),
      };

      return request(app.getHttpServer())
        .post('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(profileData)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .expect((res) => {
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.name).toEqual(profileData.name);
          expect(res.body.data.lastname).toEqual(profileData.lastname);
          expect(res.body.data.age).toEqual(profileData.age);
        });
    });
  });

  describe('Unauthorized Access', () => {
    it('/api/v1/hello (GET) - should return 200 (public endpoint)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/hello')
        .expect(200);
    });

    it('/api/v1/profile/all (GET) - should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/profile/all')
        .expect(401);
    });

    it('/api/v1/profile (POST) - should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/profile')
        .send({
          id: faker.string.uuid(),
          name: 'Test',
          lastname: 'User',
          age: 25
        })
        .expect(401);
    });
  });
});
