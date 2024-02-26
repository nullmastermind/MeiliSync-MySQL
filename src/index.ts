import axios from 'axios';
import * as fs from 'fs';
import { Kafka } from 'kafkajs';

import { getConnectors } from './lib';
import { Config } from './types';

const configs: Config[] = JSON.parse(fs.readFileSync('configs.json', 'utf-8'));
const kafka = new Kafka({
  clientId: 'Debezium watcher',
  brokers: ['100.96.1.4:9092'],
});

const run = async () => {
  const connectors = await getConnectors(configs);
  const consumers: any[] = [];

  for (const i in connectors) {
    const connector = connectors[i];

    if (typeof connector !== 'string') continue;

    const config = configs[i];
    const consumer = kafka.consumer({ groupId: connector });

    await consumer.connect();

    for (const tableName of Object.keys(config.tables)) {
      const topic = [connector, config.connection.mysql.schema, tableName].join('.');
      await consumer.subscribe({ topic, fromBeginning: true });

      console.log('Subscribed:', topic);
    }

    consumers.push(consumer);
  }

  await Promise.all(
    consumers.map((consumer) => {
      return consumer.run({
        eachMessage: async ({ topic, partition, message }: any) => {
          try {
            const value = JSON.parse(message.value.toString());

            console.log('Value:', value);
          } catch (e) {
            console.error(e);
          }
        },
      });
    }),
  );
};

run().catch(console.error);
