import { NextFunction, Request, Response } from "express";
import { CreateUserOutputDto } from "./dto/create-user.output.dto";
import { CreateUserInputDto } from "./dto/create-user.input.dto";
import { UsersService } from "./users.service";
import { plainToInstance } from "class-transformer";
import { AddressService } from "modules/address/address.service";

export class UsersController {
  private readonly usersService: UsersService;
  private readonly addressService: AddressService;

  constructor() {
    this.usersService = new UsersService();
    this.addressService = new AddressService();
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const createUserInputDto = req.body as CreateUserInputDto;
      const coordinates = await this.addressService.getCoordinatesFromAddress(createUserInputDto.address);
      const user = await this.usersService.createUser({ ...createUserInputDto, coordinates });
      res.status(201).send(plainToInstance(CreateUserOutputDto, user, { excludeExtraneousValues: true }));
    } catch (error) {
      next(error);
    }
  }
}
