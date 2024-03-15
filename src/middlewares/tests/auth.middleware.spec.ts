import config from "config/config";
import { fromUnixTime } from "date-fns";
import { UnauthorizedError } from "errors/errors";
import { Express, Response } from "express";
import { clearDatabase, disconnectAndClearDatabase } from "helpers/utils";
import http from "http";
import { decode, sign } from "jsonwebtoken";
import { ExtendedRequest, authMiddleware } from "middlewares/auth.middleware";
import { AccessToken } from "modules/auth/entities/access-token.entity";
import { User } from "modules/users/entities/user.entity";
import { UsersService } from "modules/users/users.service";
import ds from "orm/orm.config";
import { setupServer } from "server/server";
import { Repository } from "typeorm";

const mockedNext = jest.fn();

describe("AuthMiddleware", () => {
  let server: http.Server;
  let app: Express;

  let usersService: UsersService;
  let accessTokenRepository: Repository<AccessToken>;

  const signAsync = async (user: User) => {
    const token = sign(
      {
        id: user.id,
        email: user.email,
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_AT },
    );

    return accessTokenRepository.save({
      user,
      token,
      expiresAt: getTokenExpireDate(token),
    });
  };

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

    usersService = new UsersService();
    accessTokenRepository = ds.getRepository(AccessToken);
  });

  it("should validate existing token with given token", async () => {
    const user = await usersService.createUser({ email: "user@test.com", password: "pwd" });
    const { token } = await signAsync(user);

    const req = { headers: { authorization: `Bearer ${token}` } } as ExtendedRequest;

    await authMiddleware(req, {} as Response, mockedNext);

    expect(req.user).toBeDefined();
    expect(req.user).toBeInstanceOf(User);
  });

  it("should pass UnauthorizedError to next when auth token is not provided", async () => {
    const req = { headers: {} } as ExtendedRequest;

    await authMiddleware(req, {} as Response, mockedNext);
    expect(mockedNext).toBeCalledWith(new UnauthorizedError());
    expect(req.user).not.toBeDefined();
  });

  it("should pass UnauthorizedError to next when token is not valid", async () => {
    const req = { headers: { authorization: "Bearer not_valid" } } as ExtendedRequest;

    await authMiddleware(req, {} as Response, mockedNext);
    expect(mockedNext).toBeCalledWith(new UnauthorizedError());
    expect(req.user).not.toBeDefined();
  });
});

const getTokenExpireDate = (token: string) => {
  const { exp } = decode(token) as { [exp: string]: number };

  return fromUnixTime(exp);
};
