import config from "config/config";
import { UnprocessableEntityError } from "errors/errors";
import { Express } from "express";
import { setupServer } from "server/server";
import { clearDatabase, disconnectAndClearDatabase } from "helpers/utils";
import ds from "orm/orm.config";
import * as bcrypt from "bcrypt";
import { AuthService } from "../auth.service";
import { LoginUserInputDto } from "../dto/login-user.input.dto";
import http, { Server } from "http";
import { User } from "modules/users/entities/user.entity";

describe("AuthService", () => {
  let app: Express;
  let authService: AuthService;
  let server: Server;
  let salt: string;
  let hashedPassword: string;

  const validPassword = "password";

  beforeAll(async () => {
    app = setupServer();
    await ds.initialize();

    salt = await bcrypt.genSalt(config.SALT_ROUNDS);
    hashedPassword = await bcrypt.hash(validPassword, salt);

    server = http.createServer(app).listen(config.APP_PORT);
  });

  afterAll(async () => {
    await disconnectAndClearDatabase(ds);
    server.close();
  });

  beforeEach(async () => {
    await clearDatabase(ds);

    authService = new AuthService();
  });

  describe(".login", () => {
    const loginDto: LoginUserInputDto = { email: "user@test.com", password: validPassword };
    const createUser = async (userDto: LoginUserInputDto) =>
      ds.getRepository(User).save({ email: userDto.email, hashedPassword });

    it("should create access token for existing user", async () => {
      await createUser(loginDto);

      const { token } = await authService.login(loginDto);

      expect(token).toBeDefined();
    });

    it("should throw UnprocessableEntityError when user logs in with an unregistered email", async () => {
      await authService
        .login({ email: "unregistered@email.com", password: validPassword })
        .catch((error: UnprocessableEntityError) => {
          expect(error).toBeInstanceOf(UnprocessableEntityError);
          expect(error.message).toBe("Invalid user email or password");
        });
    });

    it("should throw UnprocessableEntityError when user logs in with invalid password", async () => {
      await createUser(loginDto);

      await authService.login({ email: loginDto.email, password: "invalidPassword" }).catch((error: UnprocessableEntityError) => {
        expect(error).toBeInstanceOf(UnprocessableEntityError);
        expect(error.message).toBe("Invalid user email or password");
      });
    });
  });
});
