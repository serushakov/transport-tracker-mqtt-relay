export type TransportMode = "bus" | "tram" | "train" | "metro";

export type SubscriptionPayload = ReturnType<typeof createPayload>;

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

const getPayloadFromTopic = (topic: string) => {
  const [
    ,
    // String starts with a slash
    prefix,
    version,
    journey_type,
    temporal_type,
    event_type,
    transport_mode,
    operator_id,
    vehicle_number,
    route_id,
    direction_id,
    headsign,
    start_time,
    next_stop
  ] = topic.split("/");

  return {
    mode: transport_mode as TransportMode,
    nextStop: next_stop
  };
};

const createPayload = (topic: string, data: PositionMQTTData) => ({
  transportEventsInArea: {
    id: `${data.oper}/${data.veh}`,
    ...getPayloadFromTopic(topic),
    lon: data.long,
    ...data
  }
});

export { createPayload, getPayloadFromTopic };
