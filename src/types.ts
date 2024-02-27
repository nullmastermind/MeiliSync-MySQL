export type Config = {
  prefix: string;
  connection: {
    mysql: {
      host: string;
      port: number;
      schema: string;
      user: string;
      password: string;
      server_id: string;
    };
    meilisearch: {
      host: string;
      api_key: string;
    };
  };
  tables: {
    [key: string]: {
      primary?: string[];
      include: string[];
      exclude?: string[];
    };
  };
};
