const db = require("../db");

module.exports = {
  create: async (name, description, image, userId) => {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO projects (name, description, image, userId) VALUES (?, ?, ?, ?)",
        [name, description, image, userId],
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
  getAll: async () => {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM projects", function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },
  getbyId: async (id) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM projects WHERE id = ?`,
        [id],
        function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  },
  getbyUserId: async (userId) => {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM projects WHERE userId = ?`,
        [userId],
        function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  },
  updateById: async (id, name, description, image) => {
    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE projects SET name = ?, description = ?, image = ? WHERE id = ?`,
        [name, description, image, id],
        function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  },
  deleteById: async (id) => {
    return new Promise((resolve, reject) => {
      db.query(
        `DELETE FROM projects WHERE id = ?`,
        [id],
        function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  },
};
