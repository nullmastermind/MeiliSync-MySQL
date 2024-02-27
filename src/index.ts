import * as fs from 'fs';
import { Kafka } from 'kafkajs';

import { Config2, handleDelete, handleModify } from './handle';
import { getConnectors } from './lib';
import { Config } from './types';

const configs: Config[] = JSON.parse(fs.readFileSync('configs.json', 'utf-8'));
const kafka = new Kafka({
  clientId: 'Debezium watcher',
  brokers: ['100.96.1.4:9092'],
});
const consumer = kafka.consumer({ groupId: 'Meili' });

const run = async () => {
  await consumer.connect();

  const connectors = await getConnectors(configs);
  const topicConfig: Record<string, Config2> = {};

  for (const i in connectors) {
    const connector = connectors[i];

    if (typeof connector !== 'string') continue;

    const config = configs[i];

    for (const tableName of Object.keys(config.tables)) {
      const topic = [connector, config.connection.mysql.schema, tableName].join('.');
      await consumer.subscribe({ topic, fromBeginning: true });

      topicConfig[topic] = {
        ...config,
        tableName,
      };

      console.log('Subscribed:', topic);
    }
  }

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }: any) => {
      console.log('Topic:', topic);

      try {
        const value = JSON.parse(message.value.toString());
        const {
          payload: { before, after, op },
        } = value;
        const config = topicConfig[topic];

        if (['c', 'u'].includes(op)) await handleModify(topic, before, after, op, config);
        if (op === 'd') await handleDelete(topic, before, after, op, config);

        await consumer.commitOffsets([
          {
            topic,
            partition,
            offset: message.offset,
          },
        ]);
      } catch (e) {
        console.error(e);
      }
    },
  });
};

run().catch(console.error);