import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);

const formatPhoneNumber = (phone) => {
  if (!phone) return phone;
  const justNumbers = phone.replace(/\D/g, "");
  
  if (justNumbers.length === 10) {
    return `+1 (${justNumbers.slice(0, 3)}) ${justNumbers.slice(3, 6)}-${justNumbers.slice(6)}`;
  }
  if (justNumbers.length === 11 && justNumbers.startsWith("1")) {
    return `+1 (${justNumbers.slice(1, 4)}) ${justNumbers.slice(4, 7)}-${justNumbers.slice(7)}`;
  }
  
  return phone; 
};

const warehouseList = async (_req, res) => {
  try {
    const items = await knex("warehouses");
    res.status(200).json(items);
  } catch (err) {
    console.log(err);
    res.status(400).send("Error retrieving warehouse items.");
  }
};

const findOne = async (req, res) => {
  try {
    const warehousesFound = await knex("warehouses").where({
      id: req.params.id,
    });
    if (warehousesFound.length === 0) {
      return res.status(404).json({
        message: `Warehouse with ID ${req.params.id} not found`,
      });
    }
    const warehouseData = warehousesFound[0];
    res.status(200).json(warehouseData);
  } catch (error) {
    res.status(500).json({
      message: `Unable to retrieve warehouse data for warehouse with ID ${req.params.id}`,
    });
  }
};

const remove = async (req, res) => {
  try {
    const rowsDeleted = await knex("warehouses")
      .where({ id: req.params.id })
      .delete();
    if (rowsDeleted === 0) {
      return res
        .status(404)
        .json({ message: `Warehouse with ID ${req.params.id} not found` });
    }
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      message: `Unable to delete warehouse: ${error}`,
    });
  }
};

const warehouseInventories = async (req, res) => {
  const warehouseId = req.params.id;
  try {
    const warehouseExists = await knex("warehouses").where({ id: warehouseId });
    if (warehouseExists.length === 0) {
      return res.status(404).json({
        message: `Warehouse with ID ${warehouseId} not found`,
      });
    }
    const getInventories = await knex("inventories")
      .select("id", "item_name", "category", "status", "quantity")
      .where({ warehouse_id: warehouseId });
    res.status(200).json(getInventories);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Unable to retrieve inventories for warehouse ID ${warehouseId}`,
    });
  }
};

const isValid = (req, res, next) => {
  const { warehouse_name, address, city, country, contact_name, contact_position, contact_phone, contact_email } = req.body;
  const errorMessage = {};
  
  if (!warehouse_name) {
    errorMessage.warehouse_name = "Please enter a warehouse name.";
  }
  if (!address) {
    errorMessage.address = "Please enter an address.";
  }
  if  (!city){
    errorMessage.city = "Please enter a city.";
  }
  if (!country) {
    errorMessage.country = "Please enter a country.";
  }
  if (!contact_name) {
    errorMessage.contact_name = "Please enter a contact name.";
  }
  if (!contact_position) {
    errorMessage.contact_position = "Please enter a contact position.";
  }
  if (!contact_email) {
    errorMessage.contact_email = "Please enter a contact email.";
  }
  if (!contact_phone) {
    errorMessage.contact_phone = "Please enter a contact phone number.";
  }

  if (contact_email && !/^[^@]+@[^@]+\.[^@]+$/.test(contact_email)) {
    return res.status(400).json({
      message: "Please provide a valid email address.",
    });
  }

  if (contact_phone) {
 req.body.contact_phone = formatPhoneNumber(contact_phone);


  if (!/^\+1 \(\d{3}\) \d{3}-\d{4}$/.test(req.body.contact_phone)) {
    return res.status(400).json({
      message: "Please provide a valid phone number in the following format: +1 (XXX) XXX-XXXX.",
    });
  }
}

  if (Object.values(errorMessage).length) {
    return res
    .status(400)
    .json({errorMessage});
  }
  next();
}

const edit = async (req, res) => {
  try {
    const formattedPhone = formatPhoneNumber(req.body.contact_phone);

      const updateDetails = await knex("warehouses")
      .where({ id: req.params.id })
      .update({
        warehouse_name: req.body.warehouse_name,
        address: req.body.address,
        city: req.body.city,
        country: req.body.country,
        contact_name: req.body.contact_name,
        contact_position: req.body.contact_position,
        contact_phone: formattedPhone,
        contact_email: req.body.contact_email,
      });

    if (updateDetails === 0) {
      return res
        .status(404)
        .json({ message: `Warehouse with ID ${req.params.id} not found` });
    }

    const updatedItem = await knex("warehouses")
      .select(
        "id",
        "warehouse_name",
        "address",
        "city",
        "country",
        "contact_name",
        "contact_position",
        "contact_phone",
        "contact_email"
      )
      .where({ id: req.params.id })
      .first();

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({
      message: `Unable to edit warehouse: ${error}`,
    });
  }
};

const add = async (req, res) => {
  const formattedPhone = formatPhoneNumber(req.body.contact_phone);

  try {
    const result = await knex("warehouses").insert({
      warehouse_name: req.body.warehouse_name,
      address: req.body.address,
      city: req.body.city,
      country: req.body.country,
      contact_name: req.body.contact_name,
      contact_position: req.body.contact_position,
      contact_phone: formattedPhone,
      contact_email: req.body.contact_email,
    });

    const newWarehouseId = result[0];
    const createdWarehouse= await knex("warehouses").where({ id: newWarehouseId });

    res.status(201).json(createdWarehouse);
  } catch (error) {
    res.status(500).json({
      message: `Unable to create new warehouse: ${error.message}`,
    });
  }
};

export { warehouseList, findOne, remove, warehouseInventories, isValid, edit, add };