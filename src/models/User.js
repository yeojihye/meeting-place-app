"use strict";

const UserStorage = require("./UserStorage");
const PlaceStorage = require("./PlaceStorage");
const HistoryStorage = require("./HistoryStorage");
const crypto = require("crypto");

class User {
  constructor(body) {
    this.body = body;
  }

  static async hashPsword(client, salt) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(client.psword, salt, 99999, 64, "sha512", (err, key) => {
        resolve(key.toString("base64"));
      });
    });
  }

  async login() {
    const client = this.body;
    try {
      const user = await UserStorage.getUserInfo(client.id);

      if (user) {
        const clientHashPsword = await User.hashPsword(client, user.salt);

        if (user.id === client.id && user.psword === clientHashPsword) {
          return { success: true };
        }
        return { success: false, msg: "비밀번호가 틀렸습니다." };
      }
      return { success: false, msg: "존재하지 않는 아이디입니다." };
    } catch (err) {
      return { success: false, err };
    }
  }

  async register() {
    const client = this.body;
    client.salt = crypto.randomBytes(64).toString("base64");

    try {
      client.psword = await User.hashPsword(client, client.salt);
      const response = await UserStorage.save(client);
      return response;
    } catch (err) {
      return { success: false, err };
    }
  }

  async confirm_place(id) {
    const place = this.body;
    const user = await UserStorage.getUserInfo(id);
    var obj = JSON.stringify(place.starting_position);
    try {
      const response1 = await PlaceStorage.save(user, place);
      const response2 = await HistoryStorage.save(user, place, obj);
      if (response1.success && response2.success) {
        return { success: true };
      }
    } catch (err) {
      return { success: false, err };
    }
  }
}

module.exports = User;
