declare global {
    namespace NodeJS {
      interface ProcessEnv {
        [key: string]: string | undefined;
        PORT: string;
        DATABASE_URL: string;
        DATABASE_TOKEN: string;
        SECRET_KEY: string;
        MP_ACCESS_TOKEN: string;
        // add more environment variables and their types here
      }
    }
  }