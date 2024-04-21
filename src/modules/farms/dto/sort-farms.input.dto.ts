import { IsNotEmpty, IsOptional } from "class-validator";
import { Transform } from "class-transformer";
/**
#  * @openapi
#  * components:
#  *  schemas:
#  *    SortFarmsInputDto:
#  *      type: object
#  *      properties:
#  *        sortBy:
#  *          type: "name" | "createdAt" | "driving_distance"
#  *        filter:
#  *          type: boolean | undefined
#  */

class SortableProperties {
  public static readonly NAME: string = "name";
  public static readonly DATE: string = "createdAt";
  public static readonly DRIVINGDISTANCE: string = "driving_distance";
}

export class SortFarmsInputDto {
  constructor(partial?: Partial<SortFarmsInputDto>) {
    Object.assign(this, partial);
  }

  @IsNotEmpty()
  @Transform(({ value }) => SortableProperties[value as keyof typeof SortableProperties])
  public sortBy: "name" | "createdAt" | "driving_distance";

  @IsOptional()
  public filter: "true" | "false" | "undefined";
}
