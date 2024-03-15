import config from "config/config";
import { Express } from "express";
import { setupServer } from "server/server";
import { clearDatabase, disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import supertest, { SuperAgentTest } from "supertest";
import { CreateFarmInputDto } from "../dto/create-farm.input.dto";
import { Farm } from "../entities/farm.entity";

describe("FarmsController", () => {
  let app: Express;
  let agent: SuperAgentTest;
  let server: Server;

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
  });

  describe("POST /farms", () => {
    const input: CreateFarmInputDto = {
      name: "Test Farm 1",
      size: 10,
      yield: 200,
    };

    it("should create new farm", async () => {
      const res = await agent.post("/api/farms").send(input);

      const farm = await ds.getRepository(Farm).findOne({ where: { name: input.name } });

      const expectedObject = {
        id: expect.any(String),
        name: input.name,
        size: input.size,
        yield: input.yield,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      expect(res.statusCode).toBe(201);
      expect(farm).toMatchObject(expectedObject);

      expect(res.body).toMatchObject({ ...expectedObject, createdAt: expect.any(String), updatedAt: expect.any(String) });
    });

    it("should throw UnprocessableEntityError if farm name already exists", async () => {
      await ds.getRepository(Farm).save(input);

      const res = await agent.post("/api/farms").send(input);

      expect(res.statusCode).toBe(422);
      expect(res.body).toMatchObject({
        name: "UnprocessableEntityError",
        message: "A farm with the same name already exists",
      });
    });

    it("should throw BadRequestError if invalid inputs are provided", async () => {
      const res = await agent.post("/api/farms").send({ ...input, size: -1 });

      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({
        name: "BadRequestError",
        message: "size must not be less than 1",
      });
    });
  });
});
