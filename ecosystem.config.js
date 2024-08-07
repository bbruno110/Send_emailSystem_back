module.exports = {
    apps: [
      {
        name: "app",
        script: "dist/app.js", // substitua pelo caminho correto do seu arquivo principal
        env: {
          NODE_ENV: "development",
          PG_DB: "sys_emails_env",
          PG_USER: "postgres",
          PG_PASSWORD: "123Mudar",
          PG_HOST: "localhost",
          PG_PORT: "5433",
          user_pass: "ukeq fosv nvfp pmgn",
          user_mail: "programausinamarcasepatentes@gmail.com"
        },
        env_production: {
          NODE_ENV: "production",
          PG_DB: "sys_emails_env",
          PG_USER: "postgres",
          PG_PASSWORD: "123Mudar",
          PG_HOST: "localhost",
          PG_PORT: "5433",
          user_pass: "ukeq fosv nvfp pmgn",
          user_mail: "programausinamarcasepatentes@gmail.com"
        }
      }
    ]
  };
  