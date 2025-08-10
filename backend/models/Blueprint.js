// backend/models/Blueprint.js
import db from "../database/db.js";

const TABLE = "blueprints";

const BlueprintModel = {
  async create({ location, materials, climate, culture, budget, plan }) {
    const sql = `INSERT INTO ${TABLE} (location, materials, climate, culture, budget, plan, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;
    const params = [location, materials, climate, culture, budget, plan];
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      });
    });
  },

  async all() {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM ${TABLE} ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  async getById(id) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM ${TABLE} WHERE id = ?`, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },
};

export default BlueprintModel;
