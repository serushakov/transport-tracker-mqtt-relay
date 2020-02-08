import { importSchema } from "graphql-import";
import {
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  introspectSchema,
  mergeSchemas
} from "graphql-tools";
import { SubscriptionProps, SubscriptionPayload } from "./mqtt";
import { withFilter } from "apollo-server";
import { ApolloLink } from "apollo-link";
import pubsub from "./pubsub";
import fetch from "node-fetch";
import { HttpLink } from "apollo-link-http";

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

const createRemoteSchema = async (uri: string) => {
  const link = new HttpLink({
    uri,
    fetch: (fetch as unknown) as WindowOrWorkerGlobalScope["fetch"]
  });

  return makeRemoteExecutableSchema({
    schema: await introspectSchema(link),
    link
  });
};

async function start() {
  const typeDefs = await importSchema("src/schema.gql", {});

  const hslSchema = await createRemoteSchema(
    "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql"
  );
  const schema = makeExecutableSchema({
    typeDefs
  });

  const finalSchema = mergeSchemas({
    schemas: [schema, hslSchema],
    resolvers
  });

  return finalSchema;
}

export default start;
