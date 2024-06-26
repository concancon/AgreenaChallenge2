import { UnprocessableEntityError } from "errors/errors";
import { clearDatabase, disconnectAndClearDatabase } from "helpers/utils";
import ds from "orm/orm.config";
import { Farm } from "../entities/farm.entity";
import { FarmsService } from "../farms.service";
import { CreateFarmWithCoordinatesInputDto } from "../dto/create-farm-with-coordinates.input.dto";
import { CreateUserWithCoordinatesInputDto } from "modules/users/dto/create-user-with-coordinates.input.dto";
import { UsersService } from "../../users/users.service";
import { User } from "modules/users/entities/user.entity";

describe("FarmService", () => {
  let farmsService: FarmsService;
  let input: CreateFarmWithCoordinatesInputDto;
  let user: User;
  beforeAll(async () => {
    await ds.initialize();
  });

  afterAll(async () => {
    await disconnectAndClearDatabase(ds);
  });

  beforeEach(async () => {
    await clearDatabase(ds);
    jest.clearAllMocks();
    farmsService = new FarmsService();
    const usersService = new UsersService();

    const createUserDto: CreateUserWithCoordinatesInputDto = {
      email: "user@test.com",
      password: "password",
      address: "Andersen strasse 3 10439 Berlin",
      coordinates: {
        lat: 42,
        lng: 42,
      },
    };

    user = await usersService.createUser(createUserDto);
    input = {
      name: "Test Farm 1",
      size: 10,
      yield: 200,
      address: "Andersenstr. 3 10439",
      coordinates: { lat: 52.5552274, lng: 13.404094 },
      owner: user,
    };
  });

  describe(".createFarm", () => {
    it("should create new farm", async () => {
      const result = await farmsService.createFarm(input);

      const expectedResult = {
        id: expect.any(String),
        name: input.name,
        size: input.size,
        yield: input.yield,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        address: "Andersenstr. 3 10439",
        coordinates: { lat: 52.5552274, lng: 13.404094 },
        owner: user,
      };
      expect(result).toBeInstanceOf(Farm);
      expect(result).toMatchObject(expectedResult);
    });

    describe("if farm name already exists", () => {
      it("should throw UnprocessableEntityError", async () => {
        await ds.getRepository(Farm).save(input);

        await expect(farmsService.createFarm(input)).rejects.toThrow(
          new UnprocessableEntityError("A farm with the same name already exists"),
        );
      });
    });
  });
});
