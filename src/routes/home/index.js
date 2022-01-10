"use strict";

const express = require("express");
const router = express.Router();
const ctrl = require("./home.ctrl");

router.get("/", ctrl.output.home);
router.get("/login", ctrl.output.login);
router.get("/logout", ctrl.output.logout);
router.get("/register", ctrl.output.register);
router.get("/midpoint", ctrl.output.midpoint);
router.get("/main", ctrl.output.home);
router.get("/list", ctrl.output.list);
router.get("/index", ctrl.output.index);

router.post("/login", ctrl.process.login);
router.post("/register", ctrl.process.register);
router.post("/midpoint", ctrl.process.confirm);
router.put("/midpoint", ctrl.process.getPlacedb);
router.put("/list", ctrl.process.getHistoryDb);
router.post("/list", ctrl.process.removePlace);

module.exports = router;
