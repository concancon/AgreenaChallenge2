import { IsEmail, IsNotEmpty, IsNumber, Min } from "class-validator";
import config from "config/config";
import { BadRequestError } from "errors/errors";
import { Express, Response } from "express";
import { disconnectAndClearDatabase } from "helpers/utils";
import http from "http";
import { ExtendedRequest } from "middlewares/auth.middleware";
import { validateInputMiddleware } from "middlewares/validate-input.middleware";
import * as validator from "class-validator";

import ds from "orm/orm.config";
import { setupServer } from "server/server";

const mockedNext = jest.fn();

describe("ValidateInputMiddleware", () => {
  let server: http.Server;
  let app: Express;

  beforeAll(async () => {
    app = setupServer();
    await ds.initialize();

    server = http.createServer(app).listen(config.APP_PORT);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await disconnectAndClearDatabase(ds);
    server.close();
  });

  describe("if an error is thrown", () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it("should call next with the error", async () => {
      const req = {
        headers: {},
        method: "POST",
        body: { email: " " },
      } as unknown as ExtendedRequest;

      const thrownError = new Error("Test error");
      jest.spyOn(validator, "validate").mockRejectedValue(thrownError);

      await validateInputMiddleware(TestValidationSchema)(req, {} as Response, mockedNext);
      expect(mockedNext).toBeCalledTimes(1);
      expect(mockedNext).toBeCalledWith(thrownError);
    });
  });

  describe("if request method is GET", () => {
    describe("if request query is invalid", () => {
      it("should throw a BadRequestError with all validation errors in the message", async () => {
        const req = {
          headers: {},
          method: "GET",
          query: { email: true, groupNumber: null },
        } as unknown as ExtendedRequest;

        await validateInputMiddleware(TestValidationSchema)(req, {} as Response, mockedNext);

        expect(mockedNext).toBeCalledTimes(1);
        expect(mockedNext).toBeCalledWith(
          new BadRequestError(
            "email must be an email, groupNumber must not be less than 1, groupNumber must be a number conforming to the specified constraints",
          ),
        );
      });
    });

    describe("if request query is valid", () => {
      it("should validate the query and call next without throwing an error", async () => {
        const req = {
          headers: {},
          method: "GET",
          query: { email: "aa@bb.com", groupNumber: 1 },
        } as unknown as ExtendedRequest;

        await validateInputMiddleware(TestValidationSchema)(req, {} as Response, mockedNext);

        expect(mockedNext).toBeCalledTimes(1);
        expect(mockedNext.mock.calls[0]).toEqual([]);
      });
    });
  });

  describe("if request method is not GET", () => {
    describe("if request query is invalid", () => {
      it.each(["POST", "DELETE", "PUT"])(
        "should throw a BadRequestError with all validation errors in the message",
        async (method: string) => {
          const req = {
            headers: {},
            method,
            body: { email: true, groupNumber: null },
          } as unknown as ExtendedRequest;

          await validateInputMiddleware(TestValidationSchema)(req, {} as Response, mockedNext);

          expect(mockedNext).toBeCalledTimes(1);
          expect(mockedNext).toBeCalledWith(
            new BadRequestError(
              "email must be an email, groupNumber must not be less than 1, groupNumber must be a number conforming to the specified constraints",
            ),
          );
        },
      );
    });

    describe("if request query is valid", () => {
      it.each(["POST", "DELETE", "PUT"])(
        "should validate the query and call next without throwing an error",
        async (method: string) => {
          const req = {
            headers: {},
            method,
            body: { email: "aa@bb.com", groupNumber: 1 },
          } as unknown as ExtendedRequest;

          await validateInputMiddleware(TestValidationSchema)(req, {} as Response, mockedNext);

          expect(mockedNext).toBeCalledTimes(1);
          expect(mockedNext.mock.calls[0]).toEqual([]);
        },
      );
    });
  });
});

class TestValidationSchema {
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsNumber()
  @Min(1)
  public groupNumber: number;
}
