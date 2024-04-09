import { NextFunction, Request, Response } from "express";
import { FarmsService } from "./farms.service";

import { CreateFarmInputDto } from "./dto/create-farm.input.dto";
import { CreateFarmOutputDto } from "./dto/create-farm.output.dto";
import { instanceToPlain } from "class-transformer";
import { AddressService } from "modules/address/address.service";
import { User } from "modules/users/entities/user.entity";
import { GetManyFarmsOutputDto } from "./dto/get-many-farms.output.dto";
import { SortFarmsInputDto } from "./dto/sort-farms.input.dto";

declare module "express-serve-static-core" {
  interface Request {
    user?: User;
    sortFarmsInputDto?: SortFarmsInputDto;
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
      const sortFarmsInputDto = req.sortFarmsInputDto?.propertyToSortBy;

      const farms = await this.farmsService.getAllFarms({
        sortBy: { prop: sortFarmsInputDto![0], orderToSort: sortFarmsInputDto![1] },
      });
      const user = req.user as User;
      const allDestinations = farms.map(l => l.coordinates) as [{ lat: number; lng: number }];
      const response = await this.addressService.getDistanceMatrix({ origin: user.coordinates, destinations: allDestinations });
      const farmsWithDistanceToUser = new GetManyFarmsOutputDto();
      for (let i = 0; i < farms.length; i++) {
        farmsWithDistanceToUser.farms.push({ ...farms[i], drivingDistance: response[i] });
      }
      res.status(201).send(instanceToPlain(new GetManyFarmsOutputDto(farmsWithDistanceToUser)));
    } catch (error) {
      next(error);
    }
  }
}
