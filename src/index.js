const { Kafka, Partitioners } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'Debezium watcher',
  brokers: ['100.96.1.4:9092'],
});
const consumer = kafka.consumer({ groupId: 'eld_aef' });

const run = async () => {
  // Connect the consumer
  await consumer.connect();

  // Subscribe to the topic
  await consumer.subscribe({ topic: 'eld_aef.eld_aef.companies', fromBeginning: true });

  // Set up the message handler
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
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
