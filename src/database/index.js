import dbConstructor from "better-sqlite3";

const db = new dbConstructor("./database.db");

export default db;
