import { RequestHandler, Router } from "express";
import { validateInputMiddleware } from "middlewares/validate-input.middleware";
import { CreateUserInputDto } from "modules/users/dto/create-user.input.dto";
import { UsersController } from "modules/users/users.controller";

const router = Router();
const usersController = new UsersController();

/**
 * @openapi
 * '/api/users':
 *  post:
 *     tags:
 *       - User
 *     summary: Create a user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/CreateUserInputDto'
 *     responses:
 *      201:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserDto'
 *      400:
 *        description: Bad request
 *      422:
 *        description: User with the same email already exists
 */
router.post("/", validateInputMiddleware(CreateUserInputDto), usersController.create.bind(usersController) as RequestHandler);

export default router;
