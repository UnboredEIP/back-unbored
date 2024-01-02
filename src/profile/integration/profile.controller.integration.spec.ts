import { AppModule } from '../../app.module';
import { Test } from '@nestjs/testing';
import { DatabaseService } from '../../database/database.service';
import { Connection, Mongoose, Types, Model } from 'mongoose';
import * as request from 'supertest';
import { Gender, Role, User } from '../../auth/schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { HttpStatus } from '@nestjs/common';
// import { EventModule } from "src/event/event.module";
import { ProfileModule } from '../profile.module';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { ConfigModule } from '@nestjs/config';

const User1 = {
  username: 'testusername',
  email: 'testemail@email.com',
  password: 'password',
  gender: Gender.HOMME,
  number: '0606060606',
  birthdate: new Date('2002-05-05'),
  preferences: ['basket', 'foot'],
};

const User2 = {
  username: 'testusername123',
  email: 'testemail123@email.com',
  password: 'password',
  gender: Gender.HOMME,
  number: '0606060607',
  birthdate: new Date('2002-05-05'),
  preferences: ['basket', 'foot'],
};

describe('ProfileController', () => {
  let dbConnection: Connection;
  let httpServer: any;
  let app: any;
  let bearerUser1: string;
  let bearerUser2: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ProfileModule,
        AuthModule,
        DatabaseModule.forRoot(
          `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_USER_PASS}@localhost:27017/unboredProfileEnv`,
        ),
      ],
      providers: [{ provide: getModelToken(User.name), useValue: {} }],
    }).compile();

    app = await moduleRef.createNestApplication();
    await app.init();
    dbConnection = moduleRef
      .get<DatabaseService>(DatabaseService)
      .getDbHandle();
    httpServer = await app.getHttpServer();
    await dbConnection.collection('users').deleteMany({});
  }, 10000);

  afterAll(async () => {
    await dbConnection.collection('users').deleteMany({});
  }, 10000);

  describe('getAllUsers', () => {
    beforeEach(async () => {
      await request(httpServer).post('/auth/register').send(User1);
      bearerUser1 = (await request(httpServer).post('/auth/login').send(User1))
        .body.token;
      if (bearerUser1 === undefined) {
        bearerUser1 = (
          await request(httpServer).post('/auth/login').send(User1)
        ).body.token;
      }
    }, 10000);

    afterEach(async () => {
      await dbConnection.collection('users').deleteMany({});
    }, 10000);

    it('should return all users', async () => {
      const response = await request(httpServer)
        .get('/profile/all')
        .set('Authorization', 'Bearer ' + bearerUser1);
      expect(response.status).toBe(200);
    });
  });

  describe('getUsers', () => {
    beforeEach(async () => {
      await request(httpServer).post('/auth/register').send(User1);
      await request(httpServer).post('/auth/register').send(User2);
      bearerUser1 = (await request(httpServer).post('/auth/login').send(User1))
        .body.token;
      bearerUser2 = (await request(httpServer).post('/auth/login').send(User2))
        .body.token;
      if (bearerUser1 === undefined) {
        bearerUser1 = (
          await request(httpServer).post('/auth/login').send(User1)
        ).body.token;
      }
    }, 10000);

    afterEach(async () => {
      await dbConnection.collection('users').deleteMany({});
    }, 10000);

    /* Route /profile */
    it('should return user profile', async () => {
      const response = await request(httpServer)
        .get('/profile')
        .set('Authorization', 'Bearer ' + bearerUser1);
      expect(response.status).toBe(HttpStatus.OK);
    });

    it('should send me unauthorized', async () => {
      const response = await request(httpServer).get('/profile');
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('get users profile', () => {
    beforeEach(async () => {
      await request(httpServer).post('/auth/register').send(User1);
      await request(httpServer).post('/auth/register').send(User2);
      bearerUser1 = (await request(httpServer).post('/auth/login').send(User1))
        .body.token;
      bearerUser2 = (await request(httpServer).post('/auth/login').send(User2))
        .body.token;
      if (bearerUser1 === undefined) {
        bearerUser1 = (
          await request(httpServer).post('/auth/login').send(User1)
        ).body.token;
      }
    }, 10000);

    afterEach(async () => {
      await dbConnection.collection('users').deleteMany({});
    }, 10000);
    /* get users profile by id */
    it('should send me user 2 informations using user 1 bearer token', async () => {
      const iduser2 = await request(httpServer)
        .get('/profile')
        .set('Authorization', 'Bearer ' + bearerUser2);
      const response = await request(httpServer)
        .post('/profile?id=' + iduser2.body.user._id)
        .set('Authorization', 'Bearer ' + bearerUser2);
      expect(response.status).toBe(HttpStatus.OK);
    });

    it('should return me an error (invalid id)', async () => {
      const response = await request(httpServer)
        .post('/profile?id=' + 'badId')
        .set('Authorization', 'Bearer ' + bearerUser2);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('update users profile', () => {
    beforeEach(async () => {
      await request(httpServer).post('/auth/register').send(User1);
      await request(httpServer).post('/auth/register').send(User2);
      bearerUser1 = (await request(httpServer).post('/auth/login').send(User1))
        .body.token;
      bearerUser2 = (await request(httpServer).post('/auth/login').send(User2))
        .body.token;
      if (bearerUser1 === undefined) {
        bearerUser1 = (
          await request(httpServer).post('/auth/login').send(User1)
        ).body.token;
      }
    }, 10000);

    afterEach(async () => {
      await dbConnection.collection('users').deleteMany({});
    }, 10000);
    /* Update user */
    const updateDto = {
      preferences: ['ping-pong', 'jeu-video'],
    };
    const badUpdateDto = {
      username: 'testusername123',
      email: 'testemail123@email.com',
    };
    it('should update user1 information', async () => {
      const response = await request(httpServer)
        .put('/profile/update')
        .set('Authorization', 'Bearer ' + bearerUser1)
        .send(updateDto);
      const userprofile = await request(httpServer)
        .get('/profile')
        .set('Authorization', 'Bearer ' + bearerUser1);
      expect(response.status).toBe(HttpStatus.OK);
      expect(userprofile.body.user.preferences).toMatchObject(
        updateDto.preferences,
      );
    });

    it('should return me an error (already used email/username)', async () => {
      const response = await request(httpServer)
        .put('/profile/update')
        .set('Authorization', 'Bearer ' + bearerUser1)
        .send(badUpdateDto);
      expect(response.status).toBe(HttpStatus.CONFLICT);
    });

    it('should return me an error (invalid id)', async () => {
      const response = await request(httpServer)
        .put('/profile/update')
        .send(updateDto);
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
    it('should return me an error (trying to change role)', async () => {
      const updateDto = {
        role: Role.EVENTADDER,
      };
      const response = await request(httpServer)
        .put('/profile/update')
        .set('Authorization', 'Bearer ' + bearerUser1)
        .send(updateDto);
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('user avatar', () => {
    beforeEach(async () => {
      await request(httpServer).post('/auth/register').send(User1);
      await request(httpServer).post('/auth/register').send(User2);
      bearerUser1 = (await request(httpServer).post('/auth/login').send(User1))
        .body.token;
      bearerUser2 = (await request(httpServer).post('/auth/login').send(User2))
        .body.token;
      if (bearerUser1 === undefined) {
        bearerUser1 = (
          await request(httpServer).post('/auth/login').send(User1)
        ).body.token;
      }
    }, 10000);

    afterEach(async () => {
      await dbConnection.collection('users').deleteMany({});
    }, 10000);

    /* Avatar */
    it('should return me user avatar', async () => {
      const response = await request(httpServer)
        .get('/profile/avatar')
        .set('Authorization', 'Bearer ' + bearerUser1);
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should return me an error (no bearer token)', async () => {
      const response = await request(httpServer).get('/profile/avatar');
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    /* Avatars */

    it('should return me user unlocked avatar', async () => {
      const response = await request(httpServer)
        .get('/profile/avatars')
        .set('Authorization', 'Bearer ' + bearerUser1);
      expect(response.status).toBe(HttpStatus.OK);
    });
    it('should return me an error (no bearer token)', async () => {
      const response = await request(httpServer).get('/profile/avatars');
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    /* Update avatar */
    it('should return me new avatar', async () => {
      const updateavatardto = {
        style: {
          head: '1',
          body: '2',
          pants: '2',
          shoes: '1',
        },
      };
      const response = await request(httpServer)
        .post('/profile/avatar')
        .set('Authorization', 'Bearer ' + bearerUser1)
        .send(updateavatardto);
      const userprofile = await request(httpServer)
        .get('/profile/avatar')
        .set('Authorization', 'Bearer ' + bearerUser1);
      expect(response.status).toBe(HttpStatus.OK);
      expect(userprofile.body.style).toMatchObject(updateavatardto.style);
    });

    it('should return me an error (no bearer token)', async () => {
      const updateavatardto = {
        style: {
          head: '1',
          body: '2',
          pants: '2',
          shoes: '1',
        },
      };
      const response = await request(httpServer)
        .post('/profile/avatar')
        .send(updateavatardto);
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('user filters', () => {
    const User1 = {
      username: 'IdrissaFall',
      email: 'testemail@email.com',
      password: 'password',
      gender: Gender.HOMME,
      number: '0606060606',
      birthdate: new Date('2002-05-05'),
      preferences: ['basket', 'foot'],
    };

    const User2 = {
      username: 'RemiSaleh',
      email: 'testemail123@email.com',
      password: 'password',
      gender: Gender.HOMME,
      number: '0606060607',
      birthdate: new Date('2002-05-05'),
      preferences: ['basket', 'foot'],
    };
    beforeEach(async () => {
      await request(httpServer).post('/auth/register').send(User1);
      await request(httpServer).post('/auth/register').send(User2);
      bearerUser1 = (await request(httpServer).post('/auth/login').send(User1))
        .body.token;
      bearerUser2 = (await request(httpServer).post('/auth/login').send(User2))
        .body.token;
      if (bearerUser1 === undefined) {
        bearerUser1 = (
          await request(httpServer).post('/auth/login').send(User1)
        ).body.token;
      }
    }, 10000);
    it('should return me all users', async () => {
      const response = await request(httpServer)
        .get('/profile/all')
        .set('Authorization', 'Bearer ' + bearerUser1);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.users.length).toBe(2);
      // console.log(response.body.users.size);
    });
    it('should return me user1 information', async () => {
      const response = await request(httpServer)
        .get('/profile/all?username=Idriss')
        .set('Authorization', 'Bearer ' + bearerUser1);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.users.length).toBe(1);
      expect(response.body.users[0].username).toBe(User1.username);
    });
    it('should return me user2 information', async () => {
      const response = await request(httpServer)
        .get('/profile/all?username=RemiSa')
        .set('Authorization', 'Bearer ' + bearerUser1);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.users.length).toBe(1);
      expect(response.body.users[0].username).toBe(User2.username);
    });

    it('should return me user1 and user2 information', async () => {
      const response = await request(httpServer)
        .get('/profile/all?email=testemail')
        .set('Authorization', 'Bearer ' + bearerUser1);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.users.length).toBe(2);
    });
  });
});
