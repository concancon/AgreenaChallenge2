import { IsNotEmpty, IsString } from "class-validator";

/**
 * @openapi
 * components:
 *  schemas:
 *    CreateFarmInputDto:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *        size:
 *          type: number
 *        yield:
 *          type: number
 */
export class QueryFarmInputDto {
  @IsString()
  @IsNotEmpty()
  public prop: string;

  @IsString()
  @IsNotEmpty()
  public orderToSort: string;
}
