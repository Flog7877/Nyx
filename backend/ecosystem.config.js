module.exports = {
    apps: [
      {
        name: "nyx-backend",
        script: "app.js",
        cwd: "/var/www/flo-g.de/Nyx/backend",
        instances: 1,
        exec_mode: "fork",
        env: {
          NODE_ENV: "development",
          PORT: 3000
        },
        env_production: {
          NODE_ENV: "production",
          PORT: 3000
        }
      }
    ]
  };
  