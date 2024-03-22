import { IsNotEmpty, IsString } from "class-validator";

export class CreateAddressInputDto {
  @IsString()
  @IsNotEmpty()
  public address: string;
}
