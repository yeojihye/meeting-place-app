"use strict";

const logger = require("../../config/logger");
const User = require("../../models/User");
const UserStorage = require("../../models/UserStorage");
const PlaceStorage = require("../../models/PlaceStorage");
const HistoryStorage = require("../../models/HistoryStorage");

// 로그인 상태 확인
function authIsOwner(req, res) {
  if (req.session.is_logined) {
    return true;
  } else {
    return false;
  }
}

const output = {
  home: (req, res) => {
    var is_logined = authIsOwner(req, res);
    logger.info(`GET / 304 "홈 화면으로 이동"`);
    res.render("home/main", { is_logined: is_logined, name: req.session.name });
  },

  addmember: (req, res) => {
    var is_logined = authIsOwner(req, res);
    logger.info(`GET /main 304 "메인 화면으로 이동"`);
    res.render("home/addmember", { is_logined: is_logined, name: req.session.name });
  },

  login: (req, res) => {
    var is_logined = authIsOwner(req, res);
    if (is_logined) res.redirect("/");
    else {
      logger.info(`GET /login 304 "로그인 화면으로 이동"`);
      res.render("home/login");
    }
  },

  register: (req, res) => {
    var is_logined = authIsOwner(req, res);
    if (is_logined) res.redirect("/");
    else {
      logger.info(`GET /register 304 "회원가입 화면으로 이동"`);
      res.render("home/register");
    }
  },

  midpoint: async (req, res) => {
    var is_logined = authIsOwner(req, res);
    const userInfo = await UserStorage.getUserInfo(req.session.name);
    var userGender = "";
    if (userInfo.gender === "M") userGender = "남성";
    else userGender = "여성";
    logger.info(`GET /register 304 "중간 지점 화면으로 이동"`);
    res.render("home/midpoint", {
      is_logined: is_logined,
      name: req.session.name,
      univ: userInfo.univ,
      gender: userGender,
    });
  },

  list: (req, res) => {
    var is_logined = authIsOwner(req, res);
    logger.info(`GET /list 304 "약속 리스트 확인 화면으로 이동"`);
    res.render("home/list", { is_logined: is_logined, name: req.session.name });
  },

  logout: (req, res) => {
    req.session.destroy(function (err) {
      res.redirect("/");
    });
  },
};

const process = {
  login: async (req, res) => {
    const user = new User(req.body);
    const response = await user.login();

    const url = {
      method: "POST",
      path: "/login",
      status: response.err ? 400 : 200,
    };

    if (response.success) {
      req.session.is_logined = true;
      req.session.name = user.body.id;
    }

    log(response, url);

    return res.status(url.status).json(response);
  },

  register: async (req, res) => {
    const user = new User(req.body);
    const response = await user.register();

    const url = {
      method: "POST",
      path: "/register",
      status: response.err ? 409 : 201,
    };

    log(response, url);
    return res.status(url.status).json(response);
  },

  confirm: async (req, res) => {
    const user = new User(req.body);
    const response = await user.confirm_place(req.session.name);

    const url = {
      method: "POST",
      path: "/midpoint",
      status: response.err ? 409 : 201,
    };

    log(response, url);
    return res.status(url.status).json(response);
  },

  getPlacedb: async (req, res) => {
    const userInfo = await UserStorage.getUserInfo(req.session.name);
    const recommendData = await PlaceStorage.getRecommendData(req.body.univ, userInfo.gender);
    res.send(recommendData);
  },

  getHistoryDb: async (req, res) => {
    const data = await HistoryStorage.get(req.session.name);
    res.send(data);
  },

  removePlace: async (req, res) => {
    const data = await HistoryStorage.remove(req.body.cnt);
    res.send(data);
  },
};

module.exports = {
  output,
  process,
};

const log = (response, url) => {
  if (response.err) {
    logger.error(`${url.method} ${url.path} ${url.status} Response: ${response.success} ${response.err}`);
  } else {
    logger.info(
      `${url.method} ${url.path} ${url.status} Response: ${response.success} ${response.msg || ""}`
    );
  }
};
