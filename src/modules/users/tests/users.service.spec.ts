import { UnprocessableEntityError } from "errors/errors";
import { clearDatabase, disconnectAndClearDatabase } from "helpers/utils";
import ds from "orm/orm.config";
import { User } from "../entities/user.entity";
import { UsersService } from "../users.service";
import { CreateUserWithCoordinatesInputDto } from "../dto/create-user-with-coordinates.input.dto";

describe("UsersService", () => {
  let usersService: UsersService;

  beforeAll(async () => {
    await ds.initialize();
  });

  afterAll(async () => {
    await disconnectAndClearDatabase(ds);
  });

  beforeEach(async () => {
    await clearDatabase(ds);
    usersService = new UsersService();
  });

  describe(".createUser", () => {
    const createUserDto: CreateUserWithCoordinatesInputDto = {
      email: "user@test.com",
      password: "password",
      address: "Andersen strasse 3 10439 Berlin",
      coordinates: {
        lat: 42,
        lng: 42,
      },
    };

    it("should create new user", async () => {
      const createdUser = await usersService.createUser(createUserDto);
      expect(createdUser).toBeInstanceOf(User);
    });

    describe("with existing user", () => {
      beforeEach(async () => {
        await usersService.createUser(createUserDto);
      });

      it("should throw UnprocessableEntityError if user already exists", async () => {
        await usersService.createUser(createUserDto).catch((error: UnprocessableEntityError) => {
          expect(error).toBeInstanceOf(UnprocessableEntityError);
          expect(error.message).toBe("A user for the email already exists");
        });
      });
    });
  });

  describe(".findOneBy", () => {
    const createUserDto: CreateUserWithCoordinatesInputDto = {
      email: "user@test.com",
      password: "password",
      address: "Andersenstr. 3 10439",
      coordinates: {
        lat: 42,
        lng: 42,
      },
    };

    it("should get user by provided param", async () => {
      const user = await usersService.createUser(createUserDto);
      const foundUser = await usersService.findOneBy({ email: user?.email });

      expect(foundUser).toMatchObject({ ...user });
    });

    it("should return null if user not found by provided param", async () => {
      const foundUser = await usersService.findOneBy({ email: "notFound@mail.com" });
      expect(foundUser).toBeNull();
    });
  });
});
