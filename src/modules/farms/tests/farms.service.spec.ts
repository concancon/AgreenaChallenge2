import { UnprocessableEntityError } from "errors/errors";
import { clearDatabase, disconnectAndClearDatabase } from "helpers/utils";
import ds from "orm/orm.config";
import { CreateFarmInputDto } from "../dto/create-farm.input.dto";
import { Farm } from "../entities/farm.entity";
import { FarmsService } from "../farms.service";
import { Repository } from "typeorm";

describe("UsersController", () => {
  let farmsService: FarmsService;
  let farmsRepository: Repository<Farm>;

  beforeAll(async () => {
    await ds.initialize();
    farmsRepository = ds.getRepository(Farm);
  });

  afterAll(async () => {
    await disconnectAndClearDatabase(ds);
  });

  beforeEach(async () => {
    await clearDatabase(ds);
    jest.clearAllMocks();
    farmsService = new FarmsService();
  });

  describe(".createFarm", () => {
    const input: CreateFarmInputDto = {
      name: "Test Farm 1",
      size: 10,
      yield: 200,
    };

    it("should create new farm", async () => {
      const repoSaveSpy = jest.spyOn(farmsRepository, "save");
      const repoCreateSpy = jest.spyOn(farmsRepository, "create");

      const result = await farmsService.createFarm(input);

      const expectedResult = {
        id: expect.any(String),
        name: input.name,
        size: input.size,
        yield: input.yield,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      expect(repoCreateSpy).toBeCalledTimes(1);
      expect(repoCreateSpy).toBeCalledWith(input);
      expect(repoSaveSpy).toBeCalledTimes(1);
      expect(repoSaveSpy).toBeCalledWith(expectedResult);
      expect(result).toBeInstanceOf(Farm);
      expect(result).toMatchObject(expectedResult);
    });

    describe("if farm name already exists", () => {
      it("should throw UnprocessableEntityError", async () => {
        await ds.getRepository(Farm).save(input);

        const repoSpy = jest.spyOn(farmsRepository, "save");

        await expect(farmsService.createFarm(input)).rejects.toThrow(
          new UnprocessableEntityError("A farm with the same name already exists"),
        );
        expect(repoSpy).toBeCalledTimes(1);
        expect(repoSpy).toBeCalledWith(input);
      });
    });
  });
});
