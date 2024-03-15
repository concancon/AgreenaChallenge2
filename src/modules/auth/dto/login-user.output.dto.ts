import { Expose } from "class-transformer";

/**
 * @openapi
 * components:
 *  schemas:
 *    LoginUserOutputDto:
 *      type: object
 *      properties:
 *        token:
 *          type: string
 */
export class LoginUserOutputDto {
  @Expose()
  public token: string;
}
