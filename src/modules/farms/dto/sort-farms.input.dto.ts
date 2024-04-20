import { IsNotEmpty } from "class-validator";
import { Transform } from "class-transformer";

/**
 * @openapi
 * components:
 *  schemas:
 *    SortFarmsInputDto:
 *      type: object
 *      properties:
 *        sortByAndOrder:
 *          type: SortableProperties
 */

class SortableProperties {
  public static readonly NAME: [string, string] = ["name", "ASC"];
  public static readonly DATE: [string, string] = ["createdAt", "ASC"];
  public static readonly DRIVINGDISTANCE: [string, string] = ["driving_distance", "ASC"];
}

export class SortFarmsInputDto {
  constructor(partial?: Partial<SortFarmsInputDto>) {
    Object.assign(this, partial);
  }

  @IsNotEmpty()
  @Transform(({ value }) => SortableProperties[value as keyof typeof SortableProperties])
  public sortByAndOrder: ["name" | "createdAt" | "driving_distance" | undefined, "ASC" | "DESC" | undefined];
}
