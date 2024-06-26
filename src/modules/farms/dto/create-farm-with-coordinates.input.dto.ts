import { IsNotEmpty, IsObject } from "class-validator";
import { CreateFarmInputDto } from "./create-farm.input.dto";
import { User } from "modules/users/entities/user.entity";

export class CreateFarmWithCoordinatesInputDto extends CreateFarmInputDto {
  @IsObject()
  @IsNotEmpty()
  public coordinates: { lat: number; lng: number };

  @IsObject()
  @IsNotEmpty()
  public owner: User;
}
