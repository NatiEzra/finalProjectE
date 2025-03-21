import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import postModel from "../model/post";
import { Express } from "express";
import { before } from "node:test";
import userModel, { interUser } from "../model/user";
var app : Express;
var token: string;
var id: string;
beforeAll(async () => {
  console.log("beforeAll");
  app = await initApp();
  await postModel.deleteMany();
  await userModel.deleteMany();
  await request(app).post("/auth/register").send({
    email: "test@user.com",
    password: "testpassword",
    image: "testimage1",
    name: "testname1",
    
  });
  const res = await request(app).post("/auth/login")
  .send({
    email: "test@user.com",
    password: "testpassword",
    name: "testname1",
    
  });
  token = res.body.accessToken;
  id = res.body._id;
  expect(token).toBeDefined();
});

afterAll((done) => {
  console.log("afterAll");
  mongoose.connection.close();
  done();
});

let postId = "";
describe("Posts Tests", () => {
  test("Posts test get all", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test Create Post", async () => {
    const response = await request(app).post("/posts")
    .set({ authorization: "JWT " + token })
    .send({
      title: "Test Post-1",
      content: "Test Content-1",
      SenderId: "TestSenderId-1",
      userLikes: [],
    });
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("Test Post-1");
    expect(response.body.content).toBe("Test Content-1");
    expect(response.body.SenderId).toBe("TestSenderId-1");
    postId = response.body._id;
  });
  //test create post after deleting process env token secret
  test("Test Create Post fail", async () => {
    const secret=process.env.TOKEN_SECRET;
    process.env.TOKEN_SECRET = "";
    const response = await request(app).post("/posts")
    .set({ authorization: "JWT " + token })
    .send({
      title: "Test Post-1",
      content: "Test Content-1",
      SenderId: "TestSenderId-1",
      userLikes: [],
    });
    expect(response.statusCode).not.toBe(201);
    process.env.TOKEN_SECRET = secret;
  });


  test("Test Update Post", async () => {
    const response = await request(app)
    .put("/posts/" + postId).send({
      title: "Test Post",
      content: "Test Content",
      SenderId: "TestSenderId",
    }).set({ authorization: "JWT " + token });
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("Test Post");
    expect(response.body.content).toBe("Test Content");
    expect(response.body.SenderId).toBe("TestSenderId");
    
  });

  test("Test Update Post Fail", async () => {
    const response = await request(app)
    .put("/posts/" + postId+"21344sdsfdhf")
    .set({ authorization: "JWT " + token })
    .send({
      title: "Test Post",
      content: "Test Content",
      SenderId: "TestSenderId",
    });
    expect(response.statusCode).not.toBe(200);
    
  });




  test("Test get post by Sender Id", async () => {
    const response = await request(app).get("/posts/?SenderId=TestSenderId");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe("Test Post");
    expect(response.body[0].content).toBe("Test Content");
    expect(response.body[0].SenderId).toBe("TestSenderId");
  });

  test("Test get post by id", async () => {
    const response = await request(app).get("/posts/" + postId);
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("Test Post");
    expect(response.body.content).toBe("Test Content");
    expect(response.body.SenderId).toBe("TestSenderId");
  });

  test("Test Create Post 2", async () => {
    const response = await request(app)
    .post("/posts").send({
      title: "Test Post 2",
      content: "Test Content 2",
      SenderId: "TestSenderId2",
    })
    .set({ authorization: "JWT " + token });
    expect(response.statusCode).toBe(201);
  });

  test("Posts test get all 2", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

 

  test("Test Create Post fail", async () => {
    const response = await request(app)
    .post("/posts").send({
      title: "Test Post 2",
      content: "Test Content 2",
    })
    .set({ authorization: "JWT " + token });
    expect(response.statusCode).toBe(400);
  });

  //add like to post
  test("Test like post", async () => {
    const response = await request(app)
    .post("/posts/like/" + postId)
    .set({ authorization: "JWT " + token });
    expect(response.statusCode).toBe(200);
    expect(response.body.post.userLikes.length).toBe(1);
    expect(response.body.post.userLikes[0]).toBe(id);
  });

  test("Test like post fail", async () => {
    const response = await request(app)
    .post("/posts/like/" + postId)
    .set({ authorization: "JWT " + token });
    expect(response.statusCode).not.toBe(200);
  });

  test("test unlike post", async () => {
    const response = await request(app)
    .post("/posts/unlike/" + postId)
    .set({ authorization: "JWT " + token });
    expect(response.statusCode).toBe(200);
    expect(response.body.post.userLikes.length).toBe(0);
  });

  test("Test like post fail", async () => {
    const response = await request(app)
    .post("/posts/like/" + postId+"asdasd")
    .set({ authorization: "JWT " + token});
    expect(response.statusCode).not.toBe(200);
  });
  //like fail
  test("Test like post fail", async () => {
    const response = await request(app)
    .post("/posts/like/" + postId)
    .set({ authorization: "JWT " + token +"asdkjahbwelfgbaweuifvb"});
    expect(response.statusCode).not.toBe(200);
  });
  

  test("Test Delete Post", async () => {
    const response = await request(app)
    .delete("/posts/" + postId)
    .set({ authorization: "JWT " + token });
    expect(response.statusCode).toBe(200);
    const response2 = await request(app).get("/posts/" + postId);
    expect(response2.statusCode).toBe(404);
  });
  

});