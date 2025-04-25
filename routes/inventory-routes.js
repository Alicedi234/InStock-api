import express from "express";
import * as inventoryController from "../controllers/inventory-controller.js";

const router = express.Router();

router.route("/")
.get(inventoryController.inventoryList)
.post(inventoryController.isValid)
.post(inventoryController.add);


router.route("/:id")
.get(inventoryController.findOne)
.delete(inventoryController.remove)
.put(inventoryController.isValid)
.put(inventoryController.edit);

export default router;