module.exports = {
    apps: [
      {
        name: "app",
        script: "dist/app.js",
        env: {
          NODE_ENV: "development",
          PG_DB: "sys_emails_env",
          PG_USER: "postgres",
          PG_PASSWORD: "123Mudar",
          PG_HOST: "localhost",
          PG_PORT: "5433",
          user_pass: "cmoq tevw xrnf epcq",
          user_mail: "programausinamarcasepatentes@gmail.com"
        },
        env_production: {
          NODE_ENV: "production",
          PG_DB: "sys_emails_env",
          PG_USER: "postgres",
          PG_PASSWORD: "123Mudar",
          PG_HOST: "localhost",
          PG_PORT: "5433",
          user_pass: "cmoq tevw xrnf epcq",
          user_mail: "programausinamarcasepatentes@gmail.com"
        }
      }
    ]
  };
  