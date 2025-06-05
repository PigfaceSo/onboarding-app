module.exports = {
  HOST: "localhost",
  USER: "postgres",      // Replace with your PostgreSQL username
  PASSWORD: "1806",  // Replace with your PostgreSQL password
  DB: "villa_onboarding",         // Replace with your PostgreSQL database name
  dialect: "postgres",
  pool: {
    max: 5,       // max number of connections in pool
    min: 0,       // min number of connections in pool
    acquire: 30000, // maximum time, in milliseconds, that pool will try to get connection before throwing error
    idle: 10000     // maximum time, in milliseconds, that a connection can be idle before being released
  }
};
