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
import { faker } from "@faker-js/faker";
import * as fs from "fs";

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

    userAddress = "16 Waverly ave 11205";
    ({ token, user: user0 } = await createUserWithAddressAndLogin(userAddress));
    userAddress1 = "414 Haywood rd 28806";
    ({ token: token1, user: user1 } = await createUserWithAddressAndLogin(userAddress1));
    userAddress2 = "416 Lorimer str. 11206";
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

      const expectedFarm = createExpectationsForFarm(farm, { lat: 40.6971801, lng: -73.9689183 }, 0);
      const expectedFarm1 = createExpectationsForFarm(farm2, { lat: 40.7093472, lng: -73.94845 }, 3263);
      const expectedFarm2 = createExpectationsForFarm(farm1, { lat: 35.5777245, lng: -82.5803351 }, 1114430);
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
      const expectedFarm = createExpectationsForFarm(farm, { lat: 40.6971801, lng: -73.9689183 }, 0);
      const expectedFarm1 = createExpectationsForFarm(farm2, { lat: 40.7093472, lng: -73.94845 }, 3263);
      const expectedFarm2 = createExpectationsForFarm(farm1, { lat: 35.5777245, lng: -82.5803351 }, 1114430);
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
      const expectedFarm = createExpectationsForFarm(farm, { lat: 40.6971801, lng: -73.9689183 }, 0);
      const expectedFarm1 = createExpectationsForFarm(farm2, { lat: 40.7093472, lng: -73.94845 }, 3263);
      const expectedFarms = [expectedFarm, expectedFarm1];

      const receivedFarms = res.body as GetManyFarmsOutputDto;
      expect(receivedFarms.farms[0]).toMatchObject({ ...expectedFarms.find(l => l.drivingDistance === 0) });
      expect(receivedFarms.farms[1]).toMatchObject({ ...expectedFarms.find(l => l.drivingDistance === 3263) });
    });

    // Function to generate a random farm object
    const generateRandomFarm = (address: string) => {
      return {
        name: faker.company.name(),
        size: Math.floor(Math.random() * 100) + 1, // Random size between 1 and 100 acres
        yield: Math.floor(Math.random() * 200) + 50, // Random yield between 50 and 250 units
        address,
        owner: user2, // Assuming user2 is the owner for all farms
      };
    };
    const readFarmAddressFile = (): { addresses: { address1: string; postalCode: string; city: string }[] } => {
      const rawData = fs.readFileSync("addresses.json", "utf-8");
      // Parse the JSON data
      const addressesData: { addresses: { address1: string; postalCode: string; city: string }[] } = JSON.parse(rawData) as {
        addresses: { address1: string; postalCode: string; city: string }[];
      };
      return addressesData;
    };
    // Function to create 100 farms
    const createFarms = async () => {
      const responses = [];
      const addressesData = readFarmAddressFile();

      for (let i = 0; i < 99; i++) {
        const addressWithCityAndZip = `${
          addressesData.addresses.map(l => {
            return ` ${l.address1}  ${l.postalCode} ${l.city} `;
          })[i]
        }`;
        const farm = generateRandomFarm(addressWithCityAndZip);
        responses.push(await agent.post("/api/farms").set("Authorization", `Bearer ${token2}`).send(farm));
      }
      return responses;
    };

    it("should create 99 farms", async () => {
      const userAddress = "6 Boughton ave 14534 Pittsford";

      ({ token } = await createUserWithAddressAndLogin(userAddress));
      const res = await createFarms();
      console.log(res);
      const sortBy = "NAME";

      const res2 = await agent
        .get("/api/farms")
        .set("Authorization", `Bearer ${token}`)
        .query({ prop: sortBy, filter: undefined })
        .send();
      console.log(res2);
      console.log("bar");
    }, 12200);
  });
});
