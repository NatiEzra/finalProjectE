import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import postModel from "../model/post";
import { Express } from "express";
import userModel, { interUser } from "../model/user";

var app: Express;

beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await userModel.deleteMany();
  await postModel.deleteMany();
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});


type User = interUser & {
  accessToken?: string,
  refreshToken?: string
};

const testUser: User = {
  email: "test@user.com",
  password: "testpassword",
  image: "testimage1",
  name: "testname1",
  provider: "local",
}

describe("Auth Tests", () => {
  test("Auth test register", async () => {
    const response = await request(app).post("/auth/register").send(testUser);
    expect(response.statusCode).toBe(200);
  });

  test("Auth test register fail", async () => {
    const response = await request(app).post("/auth/register").send(testUser);
    expect(response.statusCode).not.toBe(200);
  });

  test("Auth test register fail", async () => {
    const response = await request(app).post("/auth/register").send({
      email: "jigfykjhvuyg",
    });
    expect(response.statusCode).not.toBe(200);
    const response2 = await request(app).post("/auth/register").send({
      email: "",
      password: "tjhvkb",
    });
    expect(response2.statusCode).not.toBe(200);
  });
  

  test("Auth test login", async () => {
    const response = await request(app).post("/auth/login").send(testUser);
    expect(response.statusCode).toBe(200);
    const accessToken = response.body.accessToken;
    expect(accessToken).toBeDefined();
    expect(response.headers["set-cookie"]).toBeDefined(); // בדיקת Cookie
    console.log(response.body.cookie+"dor");
    console.log(response.body.cookie+"dor");
    expect(response.body._id).toBeDefined();
    testUser.accessToken = accessToken;
    testUser._id = response.body._id;
  });
  //test get all users
  test("Auth test get all users", async () => {
    const response = await request(app).get("/auth/getAllUsers");
    expect(response.statusCode).toBe(200);
  });

  test("Check tokens are not the same", async () => {
    const response = await request(app).post("/auth/login").send(testUser);
    const accessToken = response.body.accessToken;

    expect(accessToken).not.toBe(testUser.accessToken);
  });

  test("Auth test login fail", async () => {
    const response = await request(app).post("/auth/login").send({
      email: testUser.email,
      password: "sdfsd",
    });
    expect(response.statusCode).not.toBe(200);

    const response2 = await request(app).post("/auth/login").send({
      email: "dsfasd",
      password: "sdfsd",
    });
    expect(response2.statusCode).not.toBe(200);
  });

  

  test("Auth test me", async () => {
    const response = await request(app).post("/posts").send({
      title: "Test Post",
      content: "Test Content",
      SenderId: "sdfSd",
    });
    expect(response.statusCode).not.toBe(201);
    const response2 = await request(app).post("/posts").set(
      { authorization: "JWT " + testUser.accessToken }
    ).send({
      title: "Test Post",
      content: "Test Content",
      SenderId: "sdfSd",
    });
    expect(response2.statusCode).toBe(201);
  });

  test("Test refresh token", async () => {
    const loginResponse = await request(app).post("/auth/login").send(testUser);
    expect(loginResponse.headers["set-cookie"]).toBeDefined(); // בדיקת Cookie
    const refreshToken = loginResponse.headers["set-cookie"][0].split(";")[0].split("=")[1];
 
    const response = await request(app).post("/auth/refresh")
    .set("Cookie", [`refreshToken=${refreshToken}`]) 
    .send();
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    testUser.accessToken = response.body.accessToken;
  });

  // test("Double use refresh token", async () => {
  //   const response = await request(app).post("/auth/refresh").send({
  //     refreshToken: testUser.refreshToken,
  //   });
  //   expect(response.statusCode).toBe(200);
  //   const refreshTokenNew = response.body.refreshToken;

  //   const response2 = await request(app).post("/auth/refresh").send({
  //     refreshToken: testUser.refreshToken,
  //   });
  //   expect(response2.statusCode).not.toBe(200);

  //   const response3 = await request(app).post("/auth/refresh").send({
  //     refreshToken: refreshTokenNew,
  //   });
  //   expect(response3.statusCode).not.toBe(200);
  // });

  test("Test logout", async () => {
    const response = await request(app).post("/auth/login").send(testUser);
    expect(response.statusCode).toBe(200);
    testUser.accessToken = response.body.accessToken;

    const response2 = await request(app).post("/auth/logout").send({
      userId: testUser._id,
    });
    expect(response2.statusCode).toBe(200);

    const response3 = await request(app).post("/auth/refresh");
    expect(response3.statusCode).not.toBe(200);

  });

  jest.setTimeout(30000);
  test("Test timeout token ", async () => {
    const response = await request(app).post("/auth/login").send(testUser);
    expect(response.statusCode).toBe(200);
    testUser.accessToken = response.body.accessToken;
    expect(response.headers["set-cookie"]).toBeDefined(); // בדיקת Cookie
    const refreshToken = response.headers["set-cookie"][0].split(";")[0].split("=")[1];

    await new Promise((resolve) => setTimeout(resolve, 25000));

    const response2 = await request(app).post("/posts").set(
      { authorization: "JWT " + testUser.accessToken }
    ).send({
      title: "Test Post",
      content: "Test Content",
      SenderId: "sdfSd",
    });
    expect(response2.statusCode).not.toBe(201);

    const response3 = await request(app).post("/auth/refresh")
    .set("Cookie", [`refreshToken=${refreshToken}`]).send();
    expect(response3.statusCode).toBe(200);
    testUser.accessToken = response3.body.accessToken;

    const response4 = await request(app).post("/posts").set(
      { authorization: "JWT " + testUser.accessToken }
    ).send({
      title: "Test Post",
      content: "Test Content",
      SenderId: "sdfSd",
    });
    expect(response4.statusCode).toBe(201);
  });


  test("Auth test edit user", async () => {
    
    //login
    const response = await request(app).post("/auth/login").send(testUser);
    expect(response.statusCode).toBe(200);
    expect(response.headers["set-cookie"]).toBeDefined(); // בדיקת Cookie
    const refreshToken = response.headers["set-cookie"][0].split(";")[0].split("=")[1];
 
    testUser.accessToken = response.body.accessToken;
    testUser._id = response.body._id;
    const response3 = await request(app).put("/auth/edit").set("Cookie", [`refreshToken=${refreshToken}`]) 
    .send({
      name: "testname",
      image: "testimage",
      _id: testUser._id,
      provider: "local",
    });
    expect(response3.statusCode).toBe(200);
    expect(response3.body.name).toBe("testname");
    
    
  });
  test("Auth test edit user fail", async () => {
    const response2 = await request(app).put("/auth/edit").send({
      name:"",
      image: "testimage",
      _id: testUser._id,
    });
    expect(response2.statusCode).not.toBe(200);
  });
// test login after delete process env secret
  test("Auth test login after delete process env secret", async () => {
    const secret=process.env.TOKEN_SECRET;
    process.env.TOKEN_SECRET = "";
    const response = await request(app).post("/auth/login").send(testUser);
    expect(response.statusCode).not.toBe(200);
    process.env.TOKEN_SECRET = secret;
  }
  );

});
  