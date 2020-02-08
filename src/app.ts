import getSchema from "./graphql";
import { setup } from "./mqtt";
import { ApolloServer } from "apollo-server";

const development = !(process.env.NODE_ENV === "production");
const port = development ? 4000 : process.env.PORT;

Promise.all([getSchema(), setup()])
  .then(([schema]) => {
    const server = new ApolloServer({
      schema
    });

    return server.listen(port);
  })
  .then(() => {
    console.log("Server is listening at port " + port);
  })
  .catch(console.error);
