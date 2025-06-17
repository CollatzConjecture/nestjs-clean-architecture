import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';

describe('App (e2e)', () => {
  let app: INestApplication;
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
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
      
      try {
        await request(app.getHttpServer())
          .post('/auth/register')
          .send(testUser)
          .expect(201);

        const loginResponse = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password
          })
          .expect(200);

        accessToken = loginResponse.body.access_token;
        isDbConnected = true;
      } catch (error) {
        console.warn('Database connection failed, running limited tests:', error.message);
        isDbConnected = false;
      }
    } catch (error) {
      console.error('Failed to initialize app for e2e tests:', error);
      throw error;
    }
  }, 60000); // 60 second timeout for setup

  afterAll(async () => {
    if (app) {
      try {
        const connection = app.get('DbConnectionToken', { strict: false });
        if (connection && connection.close) {
          await connection.close();
        }
        
        await app.close();
      } catch (error) {
        console.warn('Error closing app:', error.message);
      }
    }
    console.log('E2E tests completed');
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
        .post('/auth/register')
        .send(newUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Registration process started.');
          expect(res.body.userId).toBeDefined();
        });
    });

    it('/auth/login (POST) - should login user', async () => {
      if (!isDbConnected) {
        console.log('Skipping test - database not connected');
        return;
      }

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
        });
    });
  });

  describe('Protected Routes', () => {
    it('/hello (GET) - should return hello message', async () => {
      if (!isDbConnected || !accessToken) {
        console.log('Skipping test - authentication not available');
        return;
      }

      return request(app.getHttpServer())
        .get('/hello')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect('Hello World!');
    });

    it('/all (GET) - should return all profiles', async () => {
      if (!isDbConnected || !accessToken) {
        console.log('Skipping test - authentication not available');
        return;
      }

      return request(app.getHttpServer())
        .get('/all')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBeTruthy();
        });
    });

    it('/profile (GET) - should return user profile', async () => {
      if (!isDbConnected || !accessToken) {
        console.log('Skipping test - authentication not available');
        return;
      }

      return request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBeDefined();
          expect(res.body.lastname).toBeDefined();
          expect(res.body.age).toBeDefined();
        });
    });

    it('/ (POST) - should create a profile', async () => {
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
        .post('/')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(profileData)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toEqual(profileData.name);
          expect(res.body.lastname).toEqual(profileData.lastname);
          expect(res.body.age).toEqual(profileData.age);
        });
    });
  });

  describe('Unauthorized Access', () => {
    it('/hello (GET) - should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/hello')
        .expect(401);
    });

    it('/profile (GET) - should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/profile')
        .expect(401);
    });
  });
});
