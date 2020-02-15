import mqtt, { AsyncMqttClient } from "async-mqtt";
import pubsub from "./pubsub";
import { createPayload, getPayloadFromTopic } from "./dataProcessors";

export interface SubscriptionProps {
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
}

const setup = async () => {
  const client = await mqtt.connectAsync("mqtts://mqtt.hsl.fi:8883/");

  console.log("Connected to MQTT broker");
  await subscribe(client);
};

const subscribe = async (client: AsyncMqttClient) => {
  await client.subscribe(`/hfp/v2/journey/ongoing/vp/+/+/+/+/+/+/+/+/+/+/#`);
  console.log("Subscribed to the topic");

  client.on("message", (topic, data) => {
    try {
      const payload = createPayload(topic, JSON.parse(data.toString()).VP);

      pubsub.publish("TRANSPORT_EVENT", payload);
    } catch (error) {
      console.error(error);
    }
  });
};

export { setup };
