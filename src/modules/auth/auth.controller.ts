import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginUserInputDto } from "./dto/login-user.input.dto";
import { LoginUserOutputDto } from "./dto/login-user.output.dto";
import { plainToInstance } from "class-transformer";

export class AuthController {
  private readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken = await this.authService.login(req.body as LoginUserInputDto);

      return res.status(201).send(plainToInstance(LoginUserOutputDto, accessToken, { excludeExtraneousValues: true }));
    } catch (error) {
      next(error);
    }
  }
}
