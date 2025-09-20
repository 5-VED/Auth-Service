const { Kafka } = require('kafkajs');
import { config } from "../config";
import logger from "../Logger";


const brokers = (config.kafka.brokers)


const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers:[config.kafka.brokers],
});

const consumer = kafka.consumer({ groupId: 'test-group' });

const runConsumer = async (topic: string, partition: number, messages: {}) => {
  await consumer.connect();
  logger.info(`Connected to Kafka Consumer`);
  await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });

  await consumer.run({
    eachMessage: async (topic: string, partition: number, message: any) => {
      console.log({
        key: message.key?.toString(),
        value: message.value.toString(),
        partition,
      });
    },
  });
};

export default runConsumer;
