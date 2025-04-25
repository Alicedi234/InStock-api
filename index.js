import express from "express";
import "dotenv/config";
import cors from "cors";
import warehousesRoute from "./routes/warehouses-route.js";
import inventoryRoutes from "./routes/inventory-routes.js";

const PORT = process.env.PORT ?? 8081;

const app = express();
app.use(cors());

app.use(express.static("public"));

app.use(express.json());

app.use("/api/warehouses", warehousesRoute);
app.use("/api/inventories", inventoryRoutes);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
