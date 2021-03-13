"use strict";

const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");

router.get("/list", categoryController.list);
router.post("/store", categoryController.store);
router.post("/update", categoryController.update);
router.post("/delete", categoryController.delete);

module.exports = router;
