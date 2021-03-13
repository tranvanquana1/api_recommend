"use strict";

const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movie.controller");

router.get("/list", movieController.list);
router.post("/store", movieController.store);
router.post("/update", movieController.update);
router.post("/delete", movieController.delete);

module.exports = router;