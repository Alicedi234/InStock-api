import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);

const inventoryList = async (_req, res) => {
  try {
    const items = await knex("inventories")
      .join("warehouses", "inventories.warehouse_id", "warehouses.id")
      .select(
        "inventories.id",
        "warehouses.warehouse_name",
        "inventories.item_name",
        "inventories.description",
        "inventories.category",
        "inventories.status",
        "inventories.quantity"
      );

    res.status(200).json(items);
  } catch (err) {
    console.log(err);
    res.status(400).send("Error retrieving inventory items.");
  }
};

const findOne = async (req, res) => {
  try {
    const itemId = req.params.id;

    const itemsFound = await knex("inventories")
      .join("warehouses", "inventories.warehouse_id", "warehouses.id")
      .select(
        "inventories.id",
        "warehouses.warehouse_name",
        "inventories.item_name",
        "inventories.description",
        "inventories.category",
        "inventories.status",
        "inventories.quantity"
      )
      .where("inventories.id", itemId);

    if (itemsFound.length === 0) {
      return res.status(404).json({
        message: `Item with ID ${req.params.id} not found`,
      });
    }

    const itemData = itemsFound[0];
    res.status(200).json(itemData);
  } catch (error) {
    res.status(500).json({
      message: `Unable to retrieve item data for item with ID ${req.params.id}`,
    });
  }
};

const add = async (req, res) => {
  try {
    const result = await knex("inventories").insert({
      warehouse_id: req.body.warehouse_id,
      item_name: req.body.item_name,
      description: req.body.description,
      category: req.body.category,
      status: req.body.status,
      quantity: req.body.quantity,
    });
    const newInventoryId = result[0];
    const createdInventory= await knex("inventories").where({ id: newInventoryId });
    res.status(201).json(createdInventory);
  } catch (error) {
    res.status(500).json({
      message: `Unable to create new inventory item: ${error.message}`,
    });
  }
};

const edit = async (req, res) => {
  try {
      const updateDetails = await knex("inventories")
      .where({ id: req.params.id })
      .update({
        warehouse_id: req.body.warehouse_id,
        item_name: req.body.item_name,
        description: req.body.description,
        category: req.body.category,
        status: req.body.status,
        quantity: req.body.quantity,
      });
    if (updateDetails === 0) {
      return res
        .status(404)
        .json({ message: `Inventory with ID ${req.params.id} not found` });
    }
    const updatedItem = await knex("inventories")
      .select(
        "id",
        "warehouse_id",
        "item_name",
        "description",
        "category",
        "status",
        "quantity",
      )
      .where({ id: req.params.id })
      .first();
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({
      message: `Unable to edit inventory: ${error}`,
    });
  }
};

const isValid = async (req, res, next) => {
  const { warehouse_id, item_name, description, category, status, quantity } = req.body;
  const errorMessage = {};

  if (!warehouse_id) {
    errorMessage.warehouse_id = "Please enter a warehouse ID.";
  }
  if (!item_name) {
    errorMessage.item_name = "Please enter an item name.";
  }
  if (!description) {
    errorMessage.description = "Please enter a description.";
  }
  if (!category) {
    errorMessage.category = "Please enter a category.";
  }
  if (!status) {
    errorMessage.status = "Please enter a status.";
  }
  if (quantity === undefined) {
    errorMessage.quantity = "Please enter a quantity.";
  } else if (isNaN(Number(quantity))) {
        errorMessage.quantity = "Please enter a valid quantity.";
  } else if (status === "In Stock" && (Number(quantity)) === 0) {
    errorMessage.quantity = "Quantity cannot be 0 when status is 'In Stock'.";
  }

  const warehouse = await knex("warehouses").where({ id: warehouse_id }).first();
  if (!warehouse) {
    errorMessage.warehouse_id = "Please enter a valid warehouse ID.";
  }

  if (Object.values(errorMessage).length) {
    return res
    .status(400)
    .json({errorMessage});
  }

next();

}

const remove = async (req, res) => {
  try {
    const rowsDeleted = await knex("inventories").where({ id: req.params.id }).delete();

    if (rowsDeleted === 0) {
      return res.status(404).json({ message: `Item with ID ${req.params.id} not found` });
    }

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      message: `Unable to delete item: ${error}`,
    });
  }
};

export { inventoryList, findOne, add, edit, isValid, remove };
