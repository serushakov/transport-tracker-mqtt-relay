import { importSchema } from "graphql-import";
import { makeExecutableSchema } from "graphql-tools";
import { SubscriptionProps, SubscriptionPayload } from "./mqtt";
import { withFilter } from "apollo-server";

import pubsub from "./pubsub";

const shouldSendEvent = (
  { transportEventsInArea: { lat, lon } }: SubscriptionPayload,
  { minLat, minLon, maxLat, maxLon }: SubscriptionProps
) => lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;

export const resolvers = {
  Query: {
    a: () => "a"
  },
  Subscription: {
    transportEventsInArea: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([`TRANSPORT_EVENT`]),
        shouldSendEvent
      )
    }
  }
};

async function start() {
  const typeDefs = await importSchema("src/schema.gql", {});
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers
  });

  return schema;
}

export default start;
