"use strict";

const express = require("express");
const router = express.Router();
const ctrl = require("./home.ctrl");

router.get("/", ctrl.output.home);
router.get("/login", ctrl.output.login);
router.get("/logout", ctrl.output.logout);
router.get("/register", ctrl.output.register);
router.get("/startingpoint", ctrl.output.startingpoint);
router.get("/midpoint", ctrl.output.midpoint);
router.get("/history", ctrl.output.history);

router.post("/login", ctrl.process.login);
router.post("/register", ctrl.process.register);
router.post("/recommend", ctrl.process.getPlaceDb);
router.get("/list", ctrl.process.getHistoryDb);
router.post("/list", ctrl.process.save);
router.delete("/list", ctrl.process.removePlace);

module.exports = router;
