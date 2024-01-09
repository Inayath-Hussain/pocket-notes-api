// import { parse } from "cookie"
import { agent as requestAgent } from 'supertest'
import { getExpressAppForTest } from '../index.test.config';
import { mongodbForTests } from '../db.test.config';
import { notesRouter } from './notes';
import { errorHandler } from '../errorHandler';
import { addDummyNotesToMongoDB, addDummyUserToMongoDB, clearNotesCollection, getAccessTokenCookie, getSavedDummyNotesFromMongoDB, getSavedNotesFromMongoDB } from './notes.test.utils';
import { INotesSchema, groupColorOptions } from '../models/notes';
import { simulateResponseBody } from "../utilities/test.utils";
import { IUser } from "../models/user";

beforeAll(async () => {
    const { connectToTestDB } = await mongodbForTests();

    await connectToTestDB();
})

afterAll(async () => {
    const { disconnectTestDB } = await mongodbForTests();

    await disconnectTestDB()

})

describe("'/notes' route", () => {
    const baseRoute = "/notes"

    const app = getExpressAppForTest();

    app.use(baseRoute, notesRouter);

    app.use(errorHandler);

    const unregisteredUserEmail = "test@domain.com"

    const registeredUser: IUser = {
        email: "test1@domain.com",
        username: "test",
        password: "123"
    }

    const groupName = "Python Notes"
    const groupColor: typeof groupColorOptions[number] = "#0047FF"

    let validAccessTokenCookie = ""

    let invalidAccessTokenCookie = ""

    let registeredValidAccessTokenCookie = ""

    let notesDocument: INotesSchema[];

    const agent = requestAgent(app);


    beforeAll(async () => {

        await addDummyUserToMongoDB(registeredUser.email, registeredUser.username, registeredUser.password);

        validAccessTokenCookie = getAccessTokenCookie(unregisteredUserEmail, "valid");
        invalidAccessTokenCookie = getAccessTokenCookie(unregisteredUserEmail, "invalid");

        registeredValidAccessTokenCookie = getAccessTokenCookie(registeredUser.email, "valid");
    })


    // #####################################################################################################################
    // ----------------------------------------------- GET method ----------------------------------------------------------

    describe("GET method", () => {


        beforeAll(async () => {

            await addDummyNotesToMongoDB(registeredUser.email, groupName,
                [{ content: "Hello", created_at: new Date() }])

            notesDocument = await getSavedDummyNotesFromMongoDB(registeredUser.email)

        })

        afterAll(async () => {

            await clearNotesCollection()

        })

        describe('authentication', () => {

            test("if request doesn't contain accessToken cookie then 401 response is sent", (done) => {
                agent.get(baseRoute)
                    .expect(401)
                    .expect({ message: 'Access Token is missing or invalid.' }, done)
            })

            test("if request contains invalid accessToken then 401 response is sent", (done) => {
                agent.get(baseRoute)
                    .set("Cookie", "accessToken=123")
                    .expect(401)
                    .expect({ message: "Access Token is missing or invalid." }, done)
            })

            test("if request contains valid accessToken with invalid jwt then 401 response is sent", (done) => {

                agent.get(baseRoute)
                    .set("Cookie", invalidAccessTokenCookie)
                    .expect(401)
                    .expect({ message: "Access Token is invalid." }, done)

            })

            test("if request contains accessToken whose email is not in db then 401 response is sent", (done) => {
                agent.get(baseRoute)
                    .set("Cookie", validAccessTokenCookie)
                    .expect(401)
                    .expect({ message: "User doesn't exist." }, done)
            })

            test("if request contains valid accessToken then 200 response is sent", (done) => {
                agent.get(baseRoute)
                    .set("Cookie", registeredValidAccessTokenCookie)
                    .expect(200, done)
            })


        })

        describe("data", () => {

            test("if valid request is sent then 200 response with all the notes of user in json format is sent", (done) => {

                agent.get(baseRoute)
                    .set("Cookie", registeredValidAccessTokenCookie)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .expect(simulateResponseBody({ data: notesDocument }), done)

            })

        })

    })

    // #######################################################################################################################



    // ###########################################################################################################################
    //  -----------------------------------------    POST method -----------------------------------------------------------------


    describe("POST method", () => {

        // authentication
        // body validation
        // data

        describe("authentication", () => {

            test("if request doesn't contain accessToken then 401 response is sent", (done) => {
                agent.post(baseRoute)
                    .expect(401, { message: "Access Token is missing or invalid." }, done)
            })

            test("if request contains invalid accessToken then 401 response is sent", (done) => {
                agent.post(baseRoute)
                    .set("Cookie", "accessToken=123")
                    .expect(401)
                    .expect({ message: "Access Token is missing or invalid." }, done)
            })

            test("if request contains valid accessToken with invalid jwt then 401 response is sent", (done) => {

                agent.post(baseRoute)
                    .set("Cookie", invalidAccessTokenCookie)
                    .expect(401)
                    .expect({ message: "Access Token is invalid." }, done)

            })

            test("if request contains accessToken whose email is not in db then 401 response is sent", (done) => {
                agent.post(baseRoute)
                    .set("Cookie", validAccessTokenCookie)
                    .expect(401)
                    .expect({ message: "User doesn't exist." }, done)
            })


        })


        describe("request body validation", () => {

            test("if body doesn't contain all required field then 400 response is sent", (done) => {
                agent.post(baseRoute)
                    .set("Cookie", registeredValidAccessTokenCookie)
                    .type("json")
                    .send({})
                    .expect(400, { message: "Invalid Body. Should contain 'groupName'" }, done)
            })

            test("if body doesn't contain valid groupColor then 400 response is sent", (done) => {
                agent.post(baseRoute)
                    .set("Cookie", registeredValidAccessTokenCookie)
                    .type("json")
                    .send({ groupName, groupColor: "abc" })
                    .expect(400, { message: `Invalid Body. Should contain 'groupColor' Field with any one of the following options - ${groupColorOptions.join(',')}` },
                        done)
            })

            test("if body contains additional fields other than required fields then 400 response is sent", (done) => {
                agent.post(baseRoute)
                    .set("Cookie", registeredValidAccessTokenCookie)
                    .type("json")
                    .send({ groupName, groupColor, testField: 12 })
                    .expect(400, { message: "Invalid Body. Should contain only groupName and groupColor" }, done)
            })

        })


        describe("data", () => {

            test("if request contains valid accessToken cookie and has valid body fields then 201 response is sent", (done) => {
                agent.post(baseRoute)
                    .set("Cookie", registeredValidAccessTokenCookie)
                    .type("json")
                    .send({ groupName, groupColor })
                    .expect(201, { message: "success" }, done)
            })

            test("if groupName is not unique in user's notes then 400 response is sent", (done) => {
                agent.post(baseRoute)
                    .set("Cookie", registeredValidAccessTokenCookie)
                    .type("json")
                    .send({ groupName, groupColor })
                    .expect(400, { message: "groupName already exists." }, done)
            })

            describe("database verification", () => {

                let notes: INotesSchema[] = []

                beforeAll(async () => {
                    notes = await getSavedNotesFromMongoDB()
                })

                test("checking if post request stored valid data in database", (done) => {
                    expect(notes[0].groupName).toBe(groupName);
                    expect(notes[0].groupColor).toBe(groupColor);
                    expect(notes[0].owner).toHaveProperty("email");

                    const owner = notes[0].owner as any

                    expect(owner.email).toBe(registeredUser.email);

                    done();
                })
            })

        })

    })

    // ############################################################################################################################



    // ############################################################################################################################
    // ------------------------------------------ PATCH Method ---------------------------------------------------------------------

    describe("PATCH method", () => {

        describe("authentication", () => {

            test("if request doesn't contain accessToken then 401 response is sent", (done) => {
                agent.patch(baseRoute)
                    .expect(401, { message: "Access Token is missing or invalid." }, done)
            })

            test("if request contains invalid accessToken then 401 response is sent", (done) => {
                agent.patch(baseRoute)
                    .set("Cookie", "accessToken=123")
                    .expect(401)
                    .expect({ message: "Access Token is missing or invalid." }, done)
            })

            test("if request contains valid accessToken with invalid jwt then 401 response is sent", (done) => {
                agent.patch(baseRoute)
                    .set("Cookie", invalidAccessTokenCookie)
                    .expect(401)
                    .expect({ message: "Access Token is invalid." }, done)
            })

            test("if request contains accessToken whose email is not in db then 401 response is sent", (done) => {
                agent.patch(baseRoute)
                    .set("Cookie", validAccessTokenCookie)
                    .expect(401)
                    .expect({ message: "User doesn't exist." }, done)
            })


        })


        describe("request body validation", () => {

            test("if body doesn't contain all required fields then 400 response is sent", (done) => {
                agent.patch(baseRoute)
                    .set("Cookie", registeredValidAccessTokenCookie)
                    .send({})
                    .expect(400, { message: "Invalid body. groupName is missing" }, done)
            })

            test("if body contains additional fields then 400 response is sent", (done) => {
                agent.patch(baseRoute)
                    .set('Cookie', registeredValidAccessTokenCookie)
                    .send({ groupName, content: "text content", additionalField: "hello" })
                    .expect(400, { message: "Invalid body. should contain only groupName and content" }, done)
            })


        })

        describe("data", () => {

            const content = "Text Content"

            test("if groupName doesn't exist in db then 400 response is sent", (done) => {
                agent.patch(baseRoute)
                    .set("Cookie", registeredValidAccessTokenCookie)
                    .send({ groupName: "abc", content })
                    .expect(400, { message: "group with provided groupName doesn't exist" }, done)
            })

            test("if request contains valid accessToken cookie and valid body fields then 200 response is sent", (done) => {
                agent.patch(baseRoute)
                    .set("Cookie", registeredValidAccessTokenCookie)
                    .send({ groupName, content })
                    .expect(200, { message: "success" }, done)
            })

            describe("database verification", () => {

                let noteDocuments: INotesSchema[];

                beforeAll(async () => {
                    noteDocuments = await getSavedNotesFromMongoDB()
                })

                test("patch request made in above test saved valid data in db", (done) => {
                    expect(noteDocuments[0].notes[0].content).toBe(content);
                    expect(noteDocuments[0].notes[0].created_at).toBeInstanceOf(Date);

                    done()
                })

            })

        })

    })

    // ######################################################################################################################

})


