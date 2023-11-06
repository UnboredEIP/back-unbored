import { AppModule } from "../../app.module"
import { Test } from "@nestjs/testing";
import { DatabaseService } from "../../database/database.service";
import { Connection, Mongoose, Types, Model } from "mongoose";
import * as request from "supertest"
import { Gender, Role, User } from "../../auth/schemas/user.schema";
import { getModelToken } from "@nestjs/mongoose";
import { HttpStatus } from "@nestjs/common";
// import { EventModule } from "src/event/event.module";
import { ProfileModule } from "../profile.module";
import { AuthModule } from "../../auth/auth.module";
import { DatabaseModule } from "../../database/database.module";
import { ConfigModule } from "@nestjs/config";

const User1 = {
    username: "testusername",
    email: "testemail@email.com",
    password: "password",
    gender: Gender.HOMME,
    number: "0606060606",
    birthdate: new Date ("2002-05-05"),
    preferences: ["basket", "foot"],
}

const User2 = {
    username: "testusername123",
    email: "testemail123@email.com",
    password: "password",
    gender: Gender.HOMME,
    number: "0606060607",
    birthdate: new Date ("2002-05-05"),
    preferences: ["basket", "foot"]
}

describe('ProfileController', () => {
    var dbConnection: Connection;
    var httpServer: any;
    var app: any;
    var bearerUser1: string;
    var bearerUser2: string;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [ProfileModule, AuthModule, DatabaseModule.forRoot("mongodb://localhost:27017/unboredProfileEnv"), 
                ConfigModule.forRoot({ isGlobal: true})],
            providers: [{provide: getModelToken(User.name), useValue: {}}]
        }).compile();

        app = await moduleRef.createNestApplication();
        await app.init();
        dbConnection = moduleRef.get<DatabaseService>(DatabaseService).getDbHandle();
        httpServer = await app.getHttpServer();
        await dbConnection.collection('users').deleteMany({});
    }, 10000)

    afterAll(async () => {
        await dbConnection.collection('users').deleteMany({});
    }, 10000)

    describe('getUsers', () => {
        beforeEach(async () => {
            await request(httpServer).post('/auth/register').send(User1)
            await request(httpServer).post('/auth/register').send(User2)
            bearerUser1 = (await request(httpServer).post('/auth/login').send(User1)).body.token
            bearerUser2 = (await request(httpServer).post('/auth/login').send(User2)).body.token
            if (bearerUser1 === undefined) {
                bearerUser1 = (await request(httpServer).post('/auth/login').send(User1)).body.token
            }
        }, 10000);

        afterEach(async () => {
            await dbConnection.collection('users').deleteMany({});
        }, 10000)

        /* Route /profile */
        it ('should return user profile', async () => {
            const response = await request(httpServer).get('/profile').set('Authorization', 'Bearer ' + bearerUser1)
            expect(response.status).toBe(200);
        })

        it ('should send me unauthorized', async () => {
            const response = await request(httpServer).get('/profile')
            expect(response.status).toBe(401);
        })
    })

    describe('get users profile', () => {
        beforeEach(async () => {
            await request(httpServer).post('/auth/register').send(User1)
            await request(httpServer).post('/auth/register').send(User2)
            bearerUser1 = (await request(httpServer).post('/auth/login').send(User1)).body.token
            bearerUser2 = (await request(httpServer).post('/auth/login').send(User2)).body.token
            if (bearerUser1 === undefined) {
                bearerUser1 = (await request(httpServer).post('/auth/login').send(User1)).body.token
            }
        }, 10000);

        afterEach(async () => {
            await dbConnection.collection('users').deleteMany({});
        }, 10000)
        /* get users profile by id */
        it ('should send me user 2 informations using user 1 bearer token', async() => {
            const iduser2 = await request(httpServer).get('/profile').set('Authorization', 'Bearer ' + bearerUser2);
            const response = await request(httpServer).post('/profile?id='+iduser2.body.user._id).set('Authorization', 'Bearer ' + bearerUser2)
            expect(response.status).toBe(201);
        })

        it ('should return me an error (invalid id)', async() => {
            const response = await request(httpServer).post('/profile?id='+"badId").set('Authorization', 'Bearer ' + bearerUser2)
            expect(response.status).toBe(404);
        })
    })

    describe('update users profile', () => {
        beforeEach(async () => {
            await request(httpServer).post('/auth/register').send(User1)
            await request(httpServer).post('/auth/register').send(User2)
            bearerUser1 = (await request(httpServer).post('/auth/login').send(User1)).body.token
            bearerUser2 = (await request(httpServer).post('/auth/login').send(User2)).body.token
            if (bearerUser1 === undefined) {
                bearerUser1 = (await request(httpServer).post('/auth/login').send(User1)).body.token
            }
        }, 10000);

        afterEach(async () => {
            await dbConnection.collection('users').deleteMany({});
        }, 10000)
        /* Update user */
        const updateDto = {
            preferences: ["ping-pong", "jeu-video"]
        };
        const badUpdateDto = {
            username: "testusername123",
            email: "testemail123@email.com"
        }
        it ('should update user1 information', async() => {
            const response = await request(httpServer).put('/profile/update').set('Authorization', 'Bearer ' + bearerUser1).send(updateDto);
            const userprofile = await request(httpServer).get('/profile').set('Authorization', 'Bearer ' + bearerUser1);
            expect(response.status).toBe(200);
            expect(userprofile.body.user.preferences).toMatchObject(updateDto.preferences);
        })

        it ('should return me an error (already used email/username)', async() => {
            const response = await request(httpServer).put('/profile/update').set('Authorization', 'Bearer ' + bearerUser1).send(badUpdateDto);
            expect(response.status).toBe(HttpStatus.CONFLICT);
        })

        it ('should return me an error (invalid id)', async() => {
            const response = await request(httpServer).put('/profile/update').send(updateDto);
            expect(response.status).toBe(401);
        })
        it ('should return me an error (trying to change role)', async() => {
            const updateDto = {
                role: Role.EVENTADDER
            }
            const response = await request(httpServer).put('/profile/update').set('Authorization', 'Bearer ' + bearerUser1).send(updateDto);
            expect(response.status).toBe(401);
        })
    })

    describe('user avatar', () => {
        beforeEach(async () => {
            await request(httpServer).post('/auth/register').send(User1)
            await request(httpServer).post('/auth/register').send(User2)
            bearerUser1 = (await request(httpServer).post('/auth/login').send(User1)).body.token
            bearerUser2 = (await request(httpServer).post('/auth/login').send(User2)).body.token
            if (bearerUser1 === undefined) {
                bearerUser1 = (await request(httpServer).post('/auth/login').send(User1)).body.token
            }
        }, 10000);

        afterEach(async () => {
            await dbConnection.collection('users').deleteMany({});
        }, 10000)

        /* Avatar */
        it ("should return me user avatar", async() => {
            const response = await request(httpServer).get('/profile/avatar').set('Authorization', 'Bearer ' + bearerUser1);
            expect(response.status).toBe(200);
        })
        it ('should return me an error (invalid user)', async() => {
            const response = await request(httpServer).get('/profile/avatar');
            expect(response.status).toBe(401)
        })

        /* Avatars */

        it ("should return me user unlocked avatar", async() => {
            const response = await request(httpServer).get('/profile/avatars').set('Authorization', 'Bearer ' + bearerUser1);
            expect(response.status).toBe(200);
        })
        it ('should return me an error (invalid user)', async() => {
            const response = await request(httpServer).get('/profile/avatars');
            expect(response.status).toBe(401)
        })

        /* Update avatar */
        it ('should return me new avatar', async() => {
            const updateavatardto = {
                style: {
                    head: "1",
                    body: "2",
                    pants: "2",
                    shoes: "1",
                }
            }
            const response = await request(httpServer).post('/profile/avatar').set('Authorization', 'Bearer ' + bearerUser1).send(updateavatardto);
            const userprofile = await request(httpServer).get('/profile/avatar').set('Authorization', 'Bearer ' + bearerUser1);
            expect(response.status).toBe(201);
            expect(userprofile.body.style).toMatchObject(updateavatardto.style);
        })

        it ('should return me an error (invalid user)', async() => {
            const updateavatardto = {
                style: {
                    head: "1",
                    body: "2",
                    pants: "2",
                    shoes: "1",
                }
            }
            const response = await request(httpServer).post('/profile/avatar').send(updateavatardto);
            expect(response.status).toBe(401);
        })
    })
})