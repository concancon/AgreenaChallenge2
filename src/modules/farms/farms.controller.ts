import { NextFunction, Request, Response } from "express";
import { FarmsService } from "./farms.service";
import { CreateFarmInputDto } from "./dto/create-farm.input.dto";
import { CreateFarmOutputDto } from "./dto/create-farm.output.dto";
import { instanceToPlain } from "class-transformer";
import { AddressService } from "modules/address/address.service";
import { User } from "modules/users/entities/user.entity";
import { GetManyFarmsOutputDto } from "./dto/get-many-farms.output.dto";
//import { Farm } from "./entities/farm.entity";

declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}

export class FarmsController {
  private readonly farmsService: FarmsService;
  private readonly addressService: AddressService;

  constructor() {
    this.farmsService = new FarmsService();
    this.addressService = new AddressService();
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const createFarmInputDto = req.body as CreateFarmInputDto;

      const coordinates = await this.addressService.getCoordinatesFromAddress(createFarmInputDto.address);
      const farm = await this.farmsService.createFarm({ ...createFarmInputDto, coordinates });

      res.status(201).send(instanceToPlain(new CreateFarmOutputDto(farm)));
    } catch (error) {
      next(error);
    }
  }

  public async get(req: Request, res: Response, next: NextFunction) {
    try {
      const farms = await this.farmsService.getAllFarms();

      const user = req.user as User;
      const allDestinations = farms.map(l => l.coordinates) as [{ lat: number; lng: number }];
      const response = await this.addressService.getDistanceMatrix(user.coordinates, allDestinations);
      const farmsWithDistanceToUser = new GetManyFarmsOutputDto();
      // res.data.rows[0].elements.map(l =>l.distance.value)
      for (let i = 0; i < farms.length; i++) {
        farmsWithDistanceToUser.farms.push({ ...farms[i], distance: response.data.rows[0].elements[i].distance.value });
      }
      res.status(201).send(instanceToPlain(new GetManyFarmsOutputDto(farmsWithDistanceToUser)));
    } catch (error) {
      next(error);
    }
  }
}
