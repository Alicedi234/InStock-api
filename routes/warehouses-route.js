import express from "express";
import * as warehouseController from "../controllers/warehouses-controller.js";

const router = express.Router();

router.route("/")
.get(warehouseController.warehouseList)
.post(warehouseController.isValid)
.post(warehouseController.add);

router.route("/:id")
.get(warehouseController.findOne)
.delete(warehouseController.remove)
.put(warehouseController.isValid)
.put(warehouseController.edit);

router.route("/:id/inventories")
.get(warehouseController.warehouseInventories);

export default router;