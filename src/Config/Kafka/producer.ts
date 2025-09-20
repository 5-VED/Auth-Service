import { config } from "../config";
import logger from "../Logger";

const { Kafka } = require('kafkajs');

const brokers = (config.kafka.brokers)


const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers:[config.kafka.brokers],
});

const producer = kafka.producer();

const runProducer = async (topic: string, message: Array<any>) => {
  await producer.connect()
  logger.info(`Kafak Producer connected`);
  await producer.send({
    topic,
    messages: [
      {
        value: JSON.stringify(message)
      }
    ],
  })
}

export default runProducer;