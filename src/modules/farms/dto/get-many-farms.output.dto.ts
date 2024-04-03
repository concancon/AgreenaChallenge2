import { Expose } from "class-transformer";
import { Farm } from "../entities/farm.entity";

export class GetManyFarmsOutputDto {
  constructor(partial?: Partial<GetManyFarmsOutputDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  public farms: Farm[];
}
