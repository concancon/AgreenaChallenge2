import { DeepPartial, Repository } from "typeorm";
import dataSource from "orm/orm.config";
import { CreateFarmInputDto } from "./dto/create-farm.input.dto";
import { Farm } from "./entities/farm.entity";
import { UnprocessableEntityError } from "errors/errors";
import { AddressService } from "modules/address/address.service";

export class FarmsService {
  private readonly farmsRepository: Repository<Farm>;
  private readonly addressService: AddressService;
  constructor() {
    this.farmsRepository = dataSource.getRepository(Farm);
    this.addressService = new AddressService();
  }

  public async createFarm(data: CreateFarmInputDto): Promise<Farm> {
    const existingFarm = await this.farmsRepository.findOne({ where: { name: data.name } });

    if (existingFarm) throw new UnprocessableEntityError("A farm with the same name already exists");

    const { lat, lng } = await this.addressService.getCoordinatesFromAddress(data.address);

    const farmDataWithAddress: DeepPartial<Farm> = {
      name: data.name,
      size: data.size,
      yield: data.yield,
      address: data.address,
      coordinates: { lat, lng },
    };
    const newFarm = this.farmsRepository.create(farmDataWithAddress);

    return this.farmsRepository.save(newFarm);
  }
}
