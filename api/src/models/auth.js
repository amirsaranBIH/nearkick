const db = require("../db");
const bcrypt = require("bcrypt");

module.exports = {
  register: async (email, password) => {
    return new Promise((resolve, reject) => {
      const hashedPassword = bcrypt.hashSync(password, 10);

      db.query(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hashedPassword],
        function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result.insertId);
          }
        }
      );
    });
  },
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT id, password FROM users WHERE email = ?`,
        [email],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            if (result.length > 0) {
              bcrypt.compare(password, result[0].password, (err, res) => {
                if (err) {
                  reject(err);
                } else {
                  if (res) {
                    resolve(result[0].id);
                  } else {
                    resolve(false);
                  }
                }
              });
            } else {
              reject(err);
            }
          }
        }
      );
    });
  },
  getUser: async (id) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT id, email FROM users WHERE id = ?`,
        [id],
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            if (result.length > 0) {
              resolve(result[0]);
            } else {
              reject(err);
            }
          }
        }
      );
    });
  },
};
