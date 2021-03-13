"use strict";

const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.get("/list", userController.list);
router.post("/store", userController.store);
router.post("/update", userController.update);
router.post("/update_movie", userController.update_movie);
router.post("/delete", userController.delete);
router.post("/signup", userController.signup);
router.post("/signin", userController.signin);

module.exports = router;
