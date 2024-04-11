import config from "config/config";
import { Express } from "express";
import { setupServer } from "server/server";
import { clearDatabase, disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import supertest, { SuperAgentTest } from "supertest";
import { CreateFarmInputDto } from "../dto/create-farm.input.dto";
import { LoginUserInputDto } from "modules/auth/dto/login-user.input.dto";
import { User } from "modules/users/entities/user.entity";
import { LoginUserOutputDto } from "modules/auth/dto/login-user.output.dto";
import { CreateUserInputDto } from "modules/users/dto/create-user.input.dto";
import { GetManyFarmsOutputDto } from "../dto/get-many-farms.output.dto";

describe("FarmsController", () => {
  let app: Express;
  let agent: SuperAgentTest;
  let server: Server;
  let farm: CreateFarmInputDto;
  let userOutputDto: LoginUserOutputDto;
  const validPassword = "password";

  let farm1: CreateFarmInputDto, farm2: CreateFarmInputDto;
  let user: User;
  let user1: User, user2: User;
  let token: string, token1: string, token2: string;

  let userCount = 0;

  async function createUserWithAddressAndLogin(address: string): Promise<{ user: User; token: string }> {
    const userEmail = `user${userCount}@test.com`;
    const createUserDto: CreateUserInputDto = {
      email: userEmail,
      password: validPassword,
      address,
    };

    const createUserRes = await agent.post("/api/users").send(createUserDto);
    user = createUserRes.body as User;
    const loginDto: LoginUserInputDto = { email: userEmail, password: validPassword };

    const loginUserRes = await agent.post("/api/auth/login").send(loginDto);
    userOutputDto = loginUserRes.body as LoginUserOutputDto;
    userCount++;
    return { user, token: userOutputDto.token };
  }

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

    const userAddress = "Andersenstr. 3 10439";
    ({ token, user } = await createUserWithAddressAndLogin(userAddress));
    const userAddress1 = "Andersenstr. 3 10439";
    ({ token: token1, user: user1 } = await createUserWithAddressAndLogin(userAddress1));
    const userAddress2 = "Andersenstr. 4 10439";
    ({ token: token2, user: user2 } = await createUserWithAddressAndLogin(userAddress2));

    farm = {
      name: "Test Farm",
      size: 10,
      yield: 200,
      address: userAddress,
      owner: user,
    };
    farm1 = {
      name: "Test Farm 1",
      size: 10,
      yield: 300,
      address: userAddress,
      owner: user1,
    };

    farm2 = {
      name: "Test Farm 2",
      size: 10,
      yield: 150,
      address: userAddress2,
      owner: user2,
    };
    farm2 = {
      name: "Test Farm 3",
      size: 10,
      yield: 600,
      address: userAddress2,
      owner: user2,
    };

    await agent.post("/api/farms").set("Authorization", `Bearer ${token}`).send(farm);
    await agent.post("/api/farms").set("Authorization", `Bearer ${token1}`).send(farm1);
    await agent.post("/api/farms").set("Authorization", `Bearer ${token2}`).send(farm2);
  });

  describe("POST /farms", () => {
    it("should return all users farms", async () => {
      const expectedProp = "DATE";
      const expectedOrder = "ASC";

      const res = await agent
        .get("/api/farms")
        .set("Authorization", `Bearer ${token1}`)
        .query({ prop: expectedProp, orderToSort: expectedOrder })
        .send();

      expect(res.statusCode).toBe(201);
      const expectedFarm = {
        id: expect.any(String),
        address: "Andersenstr. 3 10439",
        name: farm.name,
        size: farm.size,
        yield: farm.yield,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        owner: { ...user, createdAt: expect.any(String), updatedAt: expect.any(String) },
        drivingDistance: 0,
      };
      const expectedFarm1 = {
        id: expect.any(String),
        address: "Andersenstr. 3 10439",
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
        address: "Andersenstr. 4 10439",
        name: farm2.name,
        size: farm2.size,
        yield: farm2.yield,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        owner: { ...user2, createdAt: expect.any(String), updatedAt: expect.any(String) },
        drivingDistance: 18,
      };
      const receivedFarms = res.body as GetManyFarmsOutputDto;
      expect(receivedFarms.farms[0]).toMatchObject({ ...expectedFarm });
      expect(receivedFarms.farms[1]).toMatchObject({ ...expectedFarm1 });
      expect(receivedFarms.farms[2]).toMatchObject({ ...expectedFarm2 });
    });
  });
});
