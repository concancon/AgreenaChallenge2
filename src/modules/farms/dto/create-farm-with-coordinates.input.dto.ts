import { IsNotEmpty, IsObject } from "class-validator";
import { CreateFarmInputDto } from "./create-farm.input.dto";

export class CreateFarmWithCoordinatesInputDto extends CreateFarmInputDto {
  @IsObject()
  @IsNotEmpty()
  public coordinates: { lat: number; lng: number };
}
