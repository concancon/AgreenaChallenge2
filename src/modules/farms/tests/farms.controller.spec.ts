import config from "config/config";
import { Express } from "express";
import { setupServer } from "server/server";
import { clearDatabase, disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import supertest, { SuperAgentTest } from "supertest";
import { CreateFarmInputDto } from "../dto/create-farm.input.dto";
import { Farm } from "../entities/farm.entity";
import { LoginUserInputDto } from "modules/auth/dto/login-user.input.dto";
import { User } from "modules/users/entities/user.entity";
import { LoginUserOutputDto } from "modules/auth/dto/login-user.output.dto";
import { CreateUserInputDto } from "modules/users/dto/create-user.input.dto";

describe("FarmsController", () => {
  let app: Express;
  let agent: SuperAgentTest;
  let server: Server;
  let input: CreateFarmInputDto;
  let user: User;
  let userOutputDto: LoginUserOutputDto;
  const validPassword = "password";

  beforeAll(async () => {
    app = setupServer();
    await ds.initialize();

    server = http.createServer(app).listen(config.APP_PORT);
  });

  afterAll(async () => {
    await disconnectAndClearDatabase(ds);
    server.close();
  });

  beforeEach(async () => {
    await clearDatabase(ds);

    agent = supertest.agent(app);
    const createUserDto: CreateUserInputDto = {
      email: "user@test.com",
      password: validPassword,
      address: "Andersenstr. 3 10439",
    };

    const createUserRes = await agent.post("/api/users").send(createUserDto);
    user = createUserRes.body as User;
    const loginDto: LoginUserInputDto = { email: "user@test.com", password: validPassword };

    const loginUserRes = await agent.post("/api/auth/login").send(loginDto);
    userOutputDto = loginUserRes.body as LoginUserOutputDto;

    input = {
      name: "Test Farm 1",
      size: 10,
      yield: 200,
      address: "Andersenstr. 3 10439",
      owner: user,
    };
  });

  describe("POST /farms", () => {
    it("should NOT create new farm only if user is NOT logged in", async () => {
      const createFarmRes = await agent.post("/api/farms").send(input);
      expect(createFarmRes.statusCode).toBe(401);
    });

    it("should create new farm only if user is logged in", async () => {
      const createFarmRes = await agent.post("/api/farms").set("Authorization", `Bearer ${userOutputDto.token}`).send(input);
      const farm = await ds.getRepository(Farm).findOne({ where: { name: input.name } });

      const expectedObject = {
        id: expect.any(String),
        name: input.name,
        size: input.size,
        yield: input.yield,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        owner: { ...user, createdAt: expect.any(Date), updatedAt: expect.any(Date) },
      };

      expect(createFarmRes.statusCode).toBe(201);
      expect(farm).toMatchObject({
        ...expectedObject,
      });
    });

    it("should throw UnprocessableEntityError if farm name already exists", async () => {
      await ds
        .getRepository(Farm)
        .save({ ...input, address: "Andersenstr. 3 10439", coordinates: { lat: 52.5552274, lng: 13.404094 } });

      const res = await agent.post("/api/farms").set("Authorization", `Bearer ${userOutputDto.token}`).send(input);

      expect(res.statusCode).toBe(422);
      expect(res.body).toMatchObject({
        name: "UnprocessableEntityError",
        message: "A farm with the same name already exists",
      });
    });

    it("should throw BadRequestError if invalid inputs are provided", async () => {
      const res = await agent
        .post("/api/farms")
        .set("Authorization", `Bearer ${userOutputDto.token}`)
        .send({ ...input, size: -1 });

      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({
        name: "BadRequestError",
        message: "size must not be less than 1",
      });
    });
  });

  describe("GET /farms", () => {
    let farm1: CreateFarmInputDto, farm2: CreateFarmInputDto;
    let user1: User, user2: User;
    let userOutputDto1: LoginUserOutputDto, userOutputDto2: LoginUserOutputDto;
    beforeEach(async () => {
      await clearDatabase(ds);

      agent = supertest.agent(app);
      const createUserDto: CreateUserInputDto = {
        email: "user1@test.com",
        password: validPassword,
        address: "Andersenstr. 3 10439",
      };

      const createUserRes = await agent.post("/api/users").send(createUserDto);
      user1 = createUserRes.body as User;
      const loginDto: LoginUserInputDto = { email: "user1@test.com", password: validPassword };

      const loginUserRes = await agent.post("/api/auth/login").send(loginDto);
      userOutputDto1 = loginUserRes.body as LoginUserOutputDto;

      farm1 = {
        name: "Test Farm 1",
        size: 10,
        yield: 200,
        address: "Andersenstr. 3 10439",
        owner: user1,
      };

      await agent.post("/api/farms").set("Authorization", `Bearer ${userOutputDto1.token}`).send(farm1);

      const createUserDto2: CreateUserInputDto = {
        email: "user2@test.com",
        password: validPassword,
        address: "Andersenstr. 4 10439",
      };

      const createUserRes2 = await agent.post("/api/users").send(createUserDto2);
      user2 = createUserRes2.body as User;
      const loginDto2: LoginUserInputDto = { email: "user2@test.com", password: validPassword };

      const loginUserRes2 = await agent.post("/api/auth/login").send(loginDto2);
      userOutputDto2 = loginUserRes2.body as LoginUserOutputDto;

      farm2 = {
        name: "Test Farm 2",
        size: 10,
        yield: 200,
        address: "Andersenstr. 4 10439",
        owner: user2,
      };

      await agent.post("/api/farms").set("Authorization", `Bearer ${userOutputDto2.token}`).send(farm2);
    });

    it("should return all users farms", async () => {
      const res = await agent
        .get("/api/farms")
        .set("Authorization", `Bearer ${userOutputDto1.token}`)
        .send({ ...input, size: -1 });

      expect(res.statusCode).toBe(201);

      const expectedFarm1 = {
        id: expect.any(String),
        name: farm1.name,
        size: farm1.size,
        yield: farm1.yield,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        owner: { ...user1, createdAt: expect.any(String), updatedAt: expect.any(String) },
        drivingDistance: 0,
      };
      const expectedFarm2 = {
        id: expect.any(String),
        name: farm2.name,
        size: farm2.size,
        yield: farm2.yield,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        owner: { ...user2, createdAt: expect.any(String), updatedAt: expect.any(String) },
        drivingDistance: 18,
      };

      expect(res.body).toMatchObject({ farms: [expectedFarm1, expectedFarm2] });
    });
  });
});
