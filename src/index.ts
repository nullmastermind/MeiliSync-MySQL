import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'Debezium watcher',
  brokers: ['100.96.1.4:9092'],
});
const consumer = kafka.consumer({ groupId: 'eld_aef' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'eld_aef.eld_aef.companies', fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }: any) => {
      const value = JSON.parse(message.value.toString());
      console.log({
        partition,
        offset: message.offset,
        value: message.value.toString(),
      });
    },
  });
};

run().catch(console.error);
