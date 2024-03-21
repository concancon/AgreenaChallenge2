import { DeepPartial, Repository } from "typeorm";
import dataSource from "orm/orm.config";
import { CreateFarmInputDto } from "./dto/create-farm.input.dto";
import { Farm } from "./entities/farm.entity";
import { UnprocessableEntityError } from "errors/errors";
import { EnvironmentVariables } from "config/environment-variables";
import { Client } from "@googlemaps/google-maps-services-js";
import config from "config/config";

export class FarmsService {
  private readonly farmsRepository: Repository<Farm>;
  private readonly googleMapsClient: Client;
  private readonly config: EnvironmentVariables;
  constructor() {
    this.farmsRepository = dataSource.getRepository(Farm);
    this.googleMapsClient = new Client();
    this.config = config;
  }

  public async createFarm(data: CreateFarmInputDto): Promise<Farm> {
    const existingFarm = await this.farmsRepository.findOne({ where: { name: data.name } });

    if (existingFarm) throw new UnprocessableEntityError("A farm with the same name already exists");

    const response = await this.googleMapsClient.geocode({
      params: { key: this.config.GOOGLE_MAPS_API_KEY, address: data.address },
    });
    const { lat, lng } = response.data.results[0].geometry.location;
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
