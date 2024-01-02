import { Test } from '@nestjs/testing';
import { DatabaseService } from '../../database/database.service';
import { Connection, Mongoose, Types, Model } from 'mongoose';
import * as request from 'supertest';
import { Gender, Role, User } from '../../auth/schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { HttpStatus } from '@nestjs/common';
import { EventModule } from '../event.module';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { ConfigModule } from '@nestjs/config';

const User1 = {
  username: 'testusernameevent',
  email: 'testemailevent@email.com',
  password: 'password',
  gender: Gender.HOMME,
  number: '0606060606',
  birthdate: new Date('2002-05-05'),
  preferences: ['basket', 'foot'],
};

const fakeUser = {
  username: 'fakeuserevent',
  email: 'fakeuserevent@email.com',
  password: 'password',
  gender: Gender.HOMME,
  number: '0706060606',
  birthdate: new Date('2002-05-05'),
  preferences: ['basket', 'foot'],
};

describe('EventController', () => {
  let dbConnection: Connection;
  let httpServer: any;
  let app: any;
  let eventUserBearer: string;
  let fakeUserBearer: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        EventModule,
        AuthModule,
        DatabaseModule.forRoot(
          `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_USER_PASS}@localhost:27017/unboredEventEnv`,
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
    await dbConnection.collection('events').deleteMany({});
  }, 10000);

  beforeEach(async () => {
    await request(httpServer).post('/auth/register').send(User1);
    await request(httpServer).post('/auth/register').send(fakeUser);

    eventUserBearer = (
      await request(httpServer).post('/auth/login').send(User1)
    ).body.token;
    fakeUserBearer = (
      await request(httpServer).post('/auth/login').send(fakeUser)
    ).body.token;
    await dbConnection
      .collection('users')
      .deleteOne({ username: fakeUser.username });
  }, 10000);

  afterEach(async () => {
    await dbConnection.collection('users').deleteMany({});
    await dbConnection.collection('events').deleteMany({});
  }, 10000);

  afterAll(async () => {
    await dbConnection.collection('users').deleteMany({});
    await dbConnection.collection('events').deleteMany({});
  }, 10000);

  describe('user reservations', () => {
    const events = ['123', 'dsqdqs', 'mddd'];
    const deletedEventRes = ['mddd'];
    it('should add reservations to user1', async () => {
      const response = await request(httpServer)
        .post('/event/add')
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send({ events: ['123', '123', 'dsqdqs', 'mddd'] });
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.reservations).toMatchObject(events);
    });
    it('should return me user1 reservations', async () => {
      await request(httpServer)
        .post('/event/add')
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send({ events: ['123', '123', 'dsqdqs', 'mddd'] });
      const response = await request(httpServer)
        .get('/event')
        .set('Authorization', 'Bearer ' + eventUserBearer);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.reservations).toMatchObject(events);
    });

    it('should delete users reservations', async () => {
      await request(httpServer)
        .post('/event/add')
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send({ events: ['123', '123', 'dsqdqs', 'mddd'] });
      const response = await request(httpServer)
        .delete('/event/delete')
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send({ events: ['123', '123', 'dsqdqs'] });
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.reservations).toMatchObject(deletedEventRes);
    });
  });

  describe('get event information', () => {
    const createEventDto = {
      name: 'testevent',
      address: 'test event 93300',
      categories: ['test', 'test2'],
    };

    it('should return me an event', async () => {
      const create = await request(httpServer)
        .post('/event/createevent')
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send(createEventDto);
      const response = await request(httpServer)
        .get('/event/show?id=' + create.body.event._id)
        .set('Authorization', 'Bearer ' + eventUserBearer);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body);
    });

    it('should not return me an event (bad id)', async () => {
      const badID = new Types.ObjectId();
      const response = await request(httpServer)
        .get('/event/show?id=' + badID)
        .set('Authorization', 'Bearer ' + eventUserBearer);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe('Invalid Id');
    });

    it('should not return me an event (id is not an ObjectId)', async () => {
      const badID = 'hehe';
      const response = await request(httpServer)
        .get('/event/show?id=' + badID)
        .set('Authorization', 'Bearer ' + eventUserBearer);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toMatch('Invalid Id');
    });
  });

  describe('creating and deleting event', () => {
    const createEventDto = {
      name: 'testevent',
      address: 'test event 93300',
      categories: ['test', 'test2'],
    };

    it('should create an event', async () => {
      const response = await request(httpServer)
        .post('/event/createevent')
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send(createEventDto);
      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it('should return me conflict', async () => {
      await request(httpServer)
        .post('/event/createevent')
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send(createEventDto);
      const response = await request(httpServer)
        .post('/event/createevent')
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send(createEventDto);
      expect(response.status).toBe(HttpStatus.CONFLICT);
    });

    it('should delete an event', async () => {
      const create = await request(httpServer)
        .post('/event/createevent')
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send(createEventDto);
      const response = await request(httpServer)
        .delete('/event/deleteevent?id=' + create.body.event._id)
        .set('Authorization', 'Bearer ' + eventUserBearer);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.message).toMatch('Succefully deleted !');
    });

    it('should me return an error (bad id)', async () => {
      const badID = new Types.ObjectId();
      const response = await request(httpServer)
        .delete('/event/deleteevent?id=' + badID)
        .set('Authorization', 'Bearer ' + eventUserBearer);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toMatch('Could not find this event');
    });

    it('should not return me an event (id is not an ObjectId)', async () => {
      const badID = 'hehe';
      const response = await request(httpServer)
        .delete('/event/deleteevent?id=' + badID)
        .set('Authorization', 'Bearer ' + eventUserBearer);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.message).toMatch('Invalid Id');
    });
  });

  describe('events manipulation', () => {
    const createEventDto = {
      name: 'testevent',
      address: 'test event 93300',
      categories: ['test', 'test2'],
    };
    const create2EventDto = {
      name: 'testevent1',
      address: 'test event 93300',
      categories: ['test', 'test2'],
    };
    it('should edit event', async () => {
      const eventRes = await request(httpServer)
        .post('/event/createevent')
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send(createEventDto);
      const modifiedEvent = {
        _id: eventRes.body.event._id,
        name: 'Hehe',
        address: 'test event 93300',
        rate: [],
        pictures: [],
        categories: ['test', 'test2'],
      };
      const response = await request(httpServer)
        .put('/event/editevent?id=' + eventRes.body.event._id)
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send({ name: 'Hehe' });
      expect(response.body.event).toMatchObject(modifiedEvent);
    });
    it('should not edit event (bad id)', async () => {
      const response = await request(httpServer)
        .put('/event/editevent?id=' + 'falseid')
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send({ name: 'Hehe' });
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
    it('should not edit event (not existing id)', async () => {
      const badId = new Types.ObjectId();
      const response = await request(httpServer)
        .put('/event/editevent?id=' + badId._id)
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send({ name: 'Hehe' });
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should not edit event (duplicate key (name)', async () => {
      await request(httpServer)
        .post('/event/createevent')
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send(createEventDto);
      const eventRes = await request(httpServer)
        .post('/event/createevent')
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send(create2EventDto);
      const response = await request(httpServer)
        .put('/event/editevent?id=' + eventRes.body.event._id)
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send({ name: 'testevent' });
      expect(response.status).toBe(HttpStatus.CONFLICT);
    });
  });

  describe('add / delete event rate', () => {
    const rateEventDto = {
      stars: '2.5',
      comments: 'bieng',
    };
    const createEventDto = {
      name: 'testevent',
      address: 'test event 93300',
      categories: ['test', 'test2'],
    };
    it('should create rate in event db', async () => {
      const eventRes = await request(httpServer)
        .post('/event/createevent')
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send(createEventDto);
      const eventId = eventRes.body.event._id;
      const response = await request(httpServer)
        .post('/event/rateevent?id=' + eventId)
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send(rateEventDto);
      expect(response.body.event.rate[0]).toMatchObject(rateEventDto);
      expect(response.status).toBe(HttpStatus.OK);
    });

    it('should return me an error (invalid id)', async () => {
      const response = await request(httpServer)
        .post('/event/rateevent?id=' + 'badId')
        .set('Authorization', 'Bearer ' + eventUserBearer);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return me an error (not existing id)', async () => {
      const badId = new Types.ObjectId();
      const response = await request(httpServer)
        .post('/event/rateevent?id=' + badId._id)
        .set('Authorization', 'Bearer ' + eventUserBearer);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should delete the rate i posted', async () => {
      const eventRes = await request(httpServer)
        .post('/event/createevent')
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send(createEventDto);
      const eventId = eventRes.body.event._id;
      const rateId = await request(httpServer)
        .post('/event/rateevent?id=' + eventId)
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send(rateEventDto);
      const response = await request(httpServer)
        .delete('/event/removerate')
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send({ rateId: rateId.body.event.rate[0].id });
      expect(response.body.rates).toMatchObject([]);
      expect(response.status).toBe(HttpStatus.OK);
    });

    it('should return me an error (Not existing rate id)', async () => {
      const response = await request(httpServer)
        .delete('/event/removerate')
        .set('Authorization', 'Bearer ' + eventUserBearer)
        .send({ rateId: 'nothing' });
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
