import getSchema from "./graphql";
import { setup } from "./mqtt";
import { ApolloServer } from "apollo-server";

Promise.all([getSchema(), setup()])
  .then(([schema]) => {
    const server = new ApolloServer({
      schema
    });

    return server.listen();
  })
  .catch(console.error);
