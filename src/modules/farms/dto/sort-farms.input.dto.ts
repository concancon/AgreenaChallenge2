import { IsNotEmpty } from "class-validator";
import { Transform } from "class-transformer";

/**
 * @openapi
 * components:
 *  schemas:
 *    SortFarmsInputDto:
 *      type: object
 *      properties:
 *        propertyToSortBy:
 *          type: SortableProperties
 */

class SortableProperties {
  public static readonly NAME: [string, string] = ["name", "ASC"];
  public static readonly DATE: [string, string] = ["createdAt", "ASC"];
  public static readonly DRIVINGDISTANCE: [string, string] = ["DRIVING_DISTANCE", "ASC"];
}

export class SortFarmsInputDto {
  constructor(partial?: Partial<SortFarmsInputDto>) {
    Object.assign(this, partial);
  }

  @IsNotEmpty()
  @Transform(({ value }) => SortableProperties[value as keyof typeof SortableProperties])
  public propertyToSortBy: [string, "ASC" | "DESC" | undefined];
}
