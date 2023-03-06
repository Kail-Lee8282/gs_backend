// The ApolloServer constructor requires two parameters: your schema
import { config } from "dotenv";
import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { resolvers, typeDefs } from "./schema";
import express from "express";
import { createServer } from "http";
import { ContextValue } from "./modules/types";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import cors from "cors";
import bodyParser from "body-parser";
import { expressMiddleware } from "@apollo/server/express4";
import { NaverDataLabAPI } from "./api/naver/naverDataLabApi";
import { NaverAdAPI } from "./api/naver/naverShopAdApi";
import client from "./modules/client";
import { getUser } from "./util/protectAccount";
import { dateTimeToString, dateToString } from "./util/dateToString";
import { updateTodayProductMonitoring } from "./schedule/updateTodayProductMonitoring";
import { bootstrap } from "global-agent";

config();

bootstrap();

const PORT = process.env.PORT;

async function ServerStart() {
  try {
    // Passing an ApolloServer instance to the `startStandaloneServer` function:
    //  1. creates an Express app
    const app = express();

    //  2. installs your ApolloServer instance as middleware

    //  3. prepares your app to handle incoming requests
    const httpServer = createServer(app);

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    const wsServer = new WebSocketServer({
      server: httpServer,
    });

    const serverCleanup = useServer({ schema }, wsServer);

    // definition and your set of resolvers.
    const server = new ApolloServer<ContextValue>({
      schema,
      introspection: true,
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await serverCleanup.dispose();
              },
            };
          },
        },
      ],
    });

    const port = Number(PORT && PORT.length > 0 ? PORT : 4000);

    await server.start();

    app.use(
      "/",
      cors<cors.CorsRequest>(),
      bodyParser.json(),
      expressMiddleware(server, {
        context: async ({ req }) => {
          const { cache } = server;
          let user = null;
          if (req.headers?.token) {
            user = await getUser(client, req.headers?.token as string);
          }
          return {
            dataSources: {
              naverDataLabAPI: new NaverDataLabAPI({ cache }),
              naverAdAPI: new NaverAdAPI({
                cache,
              }),
              productsDb: client,
            },
            loginUser: user,
          };
        },
      })
    );

    httpServer.listen({ port }, () => {
      console.log(`🚀  Server ready at: http://localhost:${port}`);
    });
  } catch (e) {
    console.error(e);
  }
}

ServerStart();

scheduler();

async function scheduler() {
  new Promise(async () => {
    let count = 0;
    let updateDate = "";
    while (true) {
      try {
        console.log(count, dateTimeToString(new Date()));
        console.log("now Hours", new Date().getUTCHours());
        // 12시 갱신
        if (
          updateDate !== dateToString(new Date()) &&
          new Date().getUTCHours() + 9 === 12
        ) {
          console.log("update start");
          await updateTodayProductMonitoring();
          // await updateTodayPopularKeyword();
          updateDate = dateToString(new Date());

          console.log("update complated");
        }
      } catch (e) {
        console.error(e);
      }

      count++;
      await new Promise((r) => setTimeout(r, 600000));
    }
  });
}
