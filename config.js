module.exports = {
  development: {
    host: 'localhost',
    port: 8080,
    devServerPort: 8089
  },
  production: {
    host: 'localhost',
    port: process.env.PORT || 8080
  }
};
