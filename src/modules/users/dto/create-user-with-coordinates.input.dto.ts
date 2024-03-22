import { IsNotEmpty, IsObject } from "class-validator";
import { CreateUserInputDto } from "./create-user.input.dto";
/**
 * @openapi
 * components:
 *  schemas:
 *    CreateUserInputDto:
 *      type: object
 *      required:
 *        - email
 *        - password
 *      properties:
 *        email:
 *          type: string
 *          default: example@app.com
 *        password:
 *          type: string
 *          default: password
 */
export class CreateUserWithCoordinatesInputDto extends CreateUserInputDto {
  @IsObject()
  @IsNotEmpty()
  public coordinates: { lat: number; lng: number };
}
