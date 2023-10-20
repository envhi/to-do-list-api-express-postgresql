module.exports = {
  dialect: "postgres",
  host: "localhost",
  username: "postgres",
  password: "123",
  database: "user-todos",
  define: {
    timestamp: true,
    underscored: true,
    underscoredAll: true,
  },
};
