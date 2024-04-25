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
  let userAddress: string, userAddress1: string, userAddress2: string;
  let farm1: CreateFarmInputDto, farm2: CreateFarmInputDto;
  let user0: User;
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
    const createdUser = createUserRes.body as User;
    const loginDto: LoginUserInputDto = { email: userEmail, password: validPassword };

    const loginUserRes = await agent.post("/api/auth/login").send(loginDto);
    userOutputDto = loginUserRes.body as LoginUserOutputDto;
    userCount++;
    return { user: createdUser, token: userOutputDto.token };
  }

  function createExpectationsForFarm(
    farm: CreateFarmInputDto,
    coordinates: { lat: number; lng: number },
    drivingDistance: number,
  ) {
    return {
      id: expect.any(String),
      name: farm.name,
      yield: farm.yield,
      size: farm.size,
      createdAt: expect.any(String),
      address: farm.address,
      coordinates,
      drivingDistance,
      updatedAt: expect.any(String),
      owner: { ...farm.owner, createdAt: expect.any(String), updatedAt: expect.any(String) },
    };
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

    userAddress = "Andersenstr. 3 10439";
    ({ token, user: user0 } = await createUserWithAddressAndLogin(userAddress));
    userAddress1 = "Friedenstr. 10 10249";
    ({ token: token1, user: user1 } = await createUserWithAddressAndLogin(userAddress1));
    userAddress2 = "Finowstr. 32 10247";
    ({ token: token2, user: user2 } = await createUserWithAddressAndLogin(userAddress2));
    farm = {
      name: "Freezing Farm",
      size: 10,
      yield: 300,
      address: userAddress,
      owner: user0,
    };

    farm1 = {
      name: "Under Water Farm",
      size: 10,
      yield: 200,
      address: userAddress1,
      owner: user1,
    };

    farm2 = {
      name: "Rancho Cucamonga",
      size: 10,
      yield: 120,
      address: userAddress2,
      owner: user2,
    };

    await agent.post("/api/farms").set("Authorization", `Bearer ${token}`).send(farm);
    await agent.post("/api/farms").set("Authorization", `Bearer ${token1}`).send(farm1);
    await agent.post("/api/farms").set("Authorization", `Bearer ${token2}`).send(farm2);
  });

  describe("POST /farms", () => {
    it("should return all users farms sorted by name", async () => {
      const sortBy = "NAME";

      const res = await agent
        .get("/api/farms")
        .set("Authorization", `Bearer ${token}`)
        .query({ prop: sortBy, filter: undefined })
        .send();

      expect(res.statusCode).toBe(201);
      const receivedFarms = res.body as GetManyFarmsOutputDto;

      const expectedFarm = createExpectationsForFarm(farm, { lat: 52.5552274, lng: 13.404094 }, 0);
      const expectedFarm1 = createExpectationsForFarm(farm2, { lat: 52.51233999999999, lng: 13.4684702 }, 7824);
      const expectedFarm2 = createExpectationsForFarm(farm1, { lat: 52.5260826, lng: 13.4282901 }, 5509);
      const expectedFarms = [expectedFarm, expectedFarm1, expectedFarm2];

      expect(receivedFarms.farms[0]).toMatchObject({ ...expectedFarms.find(l => l.name === "Freezing Farm") });
      expect(receivedFarms.farms[1]).toMatchObject({ ...expectedFarms.find(l => l.name === "Rancho Cucamonga") });
      expect(receivedFarms.farms[2]).toMatchObject({ ...expectedFarms.find(l => l.name === "Underwater Farm") });
    });

    it("should return all users farms sorted by driving distance", async () => {
      const sortBy = "DRIVINGDISTANCE";

      const res = await agent
        .get("/api/farms")
        .set("Authorization", `Bearer ${token}`)
        .query({ prop: sortBy, filter: undefined })
        .send();

      expect(res.statusCode).toBe(201);

      const receivedFarms = res.body as GetManyFarmsOutputDto;
      const expectedFarm = createExpectationsForFarm(farm, { lat: 52.5552274, lng: 13.404094 }, 0);
      const expectedFarm1 = createExpectationsForFarm(farm1, { lat: 52.5260826, lng: 13.4282901 }, 5509);
      const expectedFarm2 = createExpectationsForFarm(farm2, { lat: 52.51233999999999, lng: 13.4684702 }, 7824);
      const expectedFarms = [expectedFarm, expectedFarm1, expectedFarm2];

      expect(receivedFarms.farms[0]).toMatchObject({ ...expectedFarms.find(l => l.drivingDistance === 0) });
      expect(receivedFarms.farms[1]).toMatchObject({ ...expectedFarms.find(l => l.drivingDistance === 5509) });
      expect(receivedFarms.farms[2]).toMatchObject({ ...expectedFarms.find(l => l.drivingDistance === 7824) });
    });
    it("should return outliers (the yield of a farm is 30% below or above of the average yield of all farms) AND apply sorting criteria", async () => {
      const sortBy = "DRIVINGDISTANCE";

      const res = await agent
        .get("/api/farms")
        .set("Authorization", `Bearer ${token}`)
        .query({ prop: sortBy, filter: true })
        .send();

      expect(res.statusCode).toBe(201);
      const expectedFarm = createExpectationsForFarm(farm, { lat: 52.5552274, lng: 13.404094 }, 0);
      const expectedFarm1 = createExpectationsForFarm(farm2, { lat: 52.51233999999999, lng: 13.4684702 }, 7824);
      const expectedFarms = [expectedFarm, expectedFarm1];

      const receivedFarms = res.body as GetManyFarmsOutputDto;
      expect(receivedFarms.farms[0]).toMatchObject({ ...expectedFarms.find(l => l.drivingDistance === 0) });
      expect(receivedFarms.farms[1]).toMatchObject({ ...expectedFarms.find(l => l.drivingDistance === 7824) });
    });
  });
});
