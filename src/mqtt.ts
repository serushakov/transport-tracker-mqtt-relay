import mqtt, { AsyncMqttClient, Packet } from "async-mqtt";
import pubsub from "./pubsub";

let client: AsyncMqttClient;

export interface SubscriptionProps {
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
}

export interface PositionMQTTData {
  desi: string;
  dir: string;
  oper: number;
  veh: number;
  tst: Date;
  tsi: number;
  spd: number;
  hdg: number;
  lat: number;
  long: number;
  acc: number;
  dl: number;
  odo: number | null;
  drst: 0 | 1 | null;
  oday: string;
  jrn: number;
  line: number;
  start: string;
  loc: string;
  stop: number;
  route: string;
  occu: number;
}

export type TransportMode = "bus" | "tram" | "train" | "metro";

const getTransportFromTopic = (topic: string) =>
  topic.split("/")[6] as TransportMode;

const createPayload = (mode: TransportMode, data: PositionMQTTData) => ({
  transportEventsInArea: {
    routeNumber: data.desi,
    lat: data.lat,
    lon: data.long,
    acceleration: data.acc,
    timetableOffset: data.dl,
    route: data.route,
    occupancy: data.occu,
    heading: data.hdg,
    mode
  }
});

export type SubscriptionPayload = ReturnType<typeof createPayload>;

const setup = async () => {
  await mqtt.connectAsync("mqtts://mqtt.hsl.fi:8883/");

  await subscribe();
};

const subscribe = async () => {
  await client.subscribe(`/hfp/v2/journey/ongoing/vp/+/+/+/+/+/+/+/+/+/+/#`);

  client.on("message", (topic, data) => {
    const mode = getTransportFromTopic(topic);
    const payload = createPayload(mode, JSON.parse(data.toString()).VP);

    pubsub.publish("TRANSPORT_EVENT", payload);
  });
};

export { setup };
