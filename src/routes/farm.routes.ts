import { RequestHandler, Router } from "express";
import { authMiddleware } from "middlewares/auth.middleware";
import { validateInputMiddleware } from "middlewares/validate-input.middleware";
import { validateSortInputMiddleware } from "middlewares/validate-sort-input.middleware";
import { CreateFarmInputDto } from "modules/farms/dto/create-farm.input.dto";
import { SortFarmsInputDto } from "modules/farms/dto/sort-farms.input.dto";
//import { SortFarmsInputDto } from "modules/farms/dto/sort-farms.input.dto";
import { FarmsController } from "modules/farms/farms.controller";

const router = Router();
const farmsController = new FarmsController();

/**
 * @openapi
 * '/api/farms':
 *  post:
 *     tags:
 *       - Farm
 *     summary: Create a farm
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/CreateFarmInputDto'
 *     responses:
 *      201:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateFarmOutputDto'
 *      400:
 *        description: Bad request
 *      422:
 *        description: Farm with the same name already exists
 */
//router.post("/", authMiddleware, farmsController.create.bind(farmsController) as RequestHandler);
router.post(
  "/",
  [validateInputMiddleware(CreateFarmInputDto), authMiddleware],
  farmsController.create.bind(farmsController) as RequestHandler,
);

router.get(
  "/",
  [authMiddleware, validateSortInputMiddleware(SortFarmsInputDto)],
  farmsController.get.bind(farmsController) as RequestHandler,
);

export default router;
