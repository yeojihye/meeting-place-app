"use strict";

const db = require("../config/db");

class PlaceStorage {
  static async save(userInfo, userPlace) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO recommend_data(place_name, univ, gender, addr, lat, lng) VALUES(?, ?, ?, ?, ?, ?);`;
      db.query(
        query,
        [userPlace.name, userInfo.univ, userInfo.gender, userPlace.addr, userPlace.lat, userPlace.lng],
        (err) => {
          if (err) reject(`${err}`);
          else resolve({ success: true });
        }
      );
    });
  }

  static async getRecommendData(univ, gender) {
    return new Promise((resolve, reject) => {
      const query = `SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM, A.*
        FROM(
        SELECT COUNT(place_name), place_name, addr, lat, lng
        FROM recommend_data
        WHERE univ = ? and gender = ?
        GROUP BY place_name, addr
        ORDER BY COUNT(place_name) DESC
        ) A,
        (SELECT @ROWNUM := 0) B;`;
      db.query(query, [univ, gender], (err, data) => {
        if (err) reject(`${err}`);
        else {
          resolve(data);
        }
      });
    });
  }
}

module.exports = PlaceStorage;
