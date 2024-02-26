import axios from 'axios';

import { Config } from './types';

export const getConnectors = async (configs: Config[]) => {
  const connectors: (string | null)[] = [];

  for (const config of configs) {
    const name = [config.prefix, config.connection.mysql.schema].join('_');

    // Register a connector and catch an error if the connector is created
    try {
      await axios.post(config.connection.connector.host + '/connectors/', {
        name: name,
        config: {
          'connector.class': 'io.debezium.connector.mysql.MySqlConnector',
          'tasks.max': '1',
          'database.hostname': config.connection.mysql.host,
          'database.port': config.connection.mysql.port,
          'database.user': config.connection.mysql.user,
          'database.password': config.connection.mysql.password,
          'database.server.id': config.connection.mysql.server_id,
          'database.include.list': config.connection.mysql.schema,
          'topic.prefix': name,
          'schema.history.internal.kafka.bootstrap.servers': 'kafka:9092',
          'schema.history.internal.kafka.topic': 'schema-changes.' + name,
        },
      });
    } catch (e) {}

    try {
      // Check connector status and return a 200 code if it's okay.
      await axios.get(config.connection.connector.host + '/connectors/' + name + '/status');
      connectors.push(name);
    } catch (e) {
      // Push null to keep the index
      connectors.push(null);
      console.error(e);
    }
  }

  return connectors;
};
