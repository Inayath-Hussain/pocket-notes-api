import { signedCookie } from 'cookie-parser';
import requestTool from 'supertest';
import { decode, verify } from 'jsonwebtoken'
import { userRouter } from './user';
import { errorHandler } from '../errorHandler';
import { env } from '../env';
import { mongodbForTests } from '../db.test.config';
import { getExpressAppForTest } from '../index.test.config';

beforeAll(async () => {
    const { connectToTestDB } = await mongodbForTests()

    await connectToTestDB()
})

afterAll(async () => {
    const { disconnectTestDB } = await mongodbForTests()

    await disconnectTestDB()
})

describe('"/user" route', () => {

    const app = getExpressAppForTest()

    app.use('/user', userRouter)

    app.use(errorHandler)

    const agent = requestTool.agent(app);

    describe('"/signup" route', () => {

        describe('request body validation', () => {

            test('if request body with missing fields is sent then 400 is response', (done) => {
                agent.post('/user/signup')
                    .type('json')
                    .send({})
                    .expect(400)
                    .expect('Content-Type', /json/)
                    .expect({ message: 'username is required' })
                    .end(done)
            })

            test('if additional fields are present then 400 is response', (done) => {
                agent.post('/user/signup')
                    .type('json')
                    .send({ username: 'T', email: 'test1@domain.com', password: '123', additional: 0 })
                    .expect(400)
                    .expect({ message: 'Invalid Body. Should contain only username, email and password' }, done)
            })


            test('if invalid email formart is sent then 400 is response', (done) => {
                agent.post('/user/signup')
                    .type('json')
                    .send({ username: 'T', email: 'test1domain.com', password: '123' })
                    .expect(400)
                    .expect({ message: 'Invalid email' }, done)
            })


            test('if request body is valid then 201 is response', (done) => {
                agent.post('/user/signup')
                    .type('json')
                    .send({ username: 'T', email: 'test@domain.com', password: '123' })
                    .expect(201)
                    .expect({ message: 'success' }, done)
            })
        })



        test('if email is already registered then 400 is response', (done) => {

            agent.post('/user/signup')
                .type('json')
                .send({ username: 'T', email: 'test@domain.com', password: '123' })
                .expect(400)
                .expect({ message: 'Email Already Exists' }, done)

        })

    })




    describe('"/login" route', () => {

        describe('request body validation', () => {

            test('if any of the required fields is missing then 400 response is sent', (done) => {

                agent.post('/user/login')
                    .type('json')
                    .send({})
                    .expect(400)
                    .expect({ message: 'email is required' }, done)
            })

            test('if additional fields are present then 400 response is sent', (done) => {
                agent.post('/user/login')
                    .type('json')
                    .send({ email: 'test@domain.com', password: '123', addi: 5 })
                    .expect(400)
                    .expect({ message: 'Invalid body. Should contain only email and password' }, done)
            })

            test('if email is in invalid format then 400 response is sent', (done) => {
                agent.post('/user/login')
                    .type('json')
                    .send({ email: 'testdomain.com', password: '123' })
                    .expect(400)
                    .expect({ message: 'Invalid email' }, done)
            })
        })

        test("if email is not registered then 400 response is sent", (done) => {
            agent.post('/user/login')
                .type('json')
                .send({ email: 'test1@domain.com', password: 123 })
                .expect(400)
                .expect({ message: "email isn't registered" }, done)
        })

        test("if email and password donot match then 400 response is sent", (done) => {
            agent.post('/user/login')
                .type('json')
                .send({ email: "test@domain.com", password: 1234 })
                .expect(400)
                .expect({ message: "email and password donot match" }, done)
        })

        test("if email and password are valid then 200 response with access token cookies are sent", (done) => {
            agent.post('/user/login')
                .type('json')
                .send({ email: "test@domain.com", password: 123 })
                .expect(200)
                .expect({ message: 'success' })
                .then(response => {

                    const accessTokenPattern = /accessToken=(.*?);/

                    const matches = accessTokenPattern.exec(response.headers['set-cookie'][0])

                    if (matches === null) {
                        throw Error('accessToken value is missing');
                    }

                    const signedAccessToken = matches[1]

                    const accessToken = signedCookie(decodeURIComponent(signedAccessToken), env.COOKIE_PARSER_SECRET)

                    if (!accessToken) {
                        throw Error('cannot retrieve token from signed cookie')
                    }

                    const isValid = verify(accessToken, env.JWT_SECRET)

                    if (!isValid) {
                        throw Error("accessToken cookie isn't valid")
                    }

                    expect(decode(accessToken)).toMatchObject({ email: 'test@domain.com' })

                    done()
                })
        })
    })
})
