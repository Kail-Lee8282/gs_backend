// The ApolloServer constructor requires two parameters: your schema
import { config } from "dotenv";
import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { resolvers, typeDefs } from "./schema";
import express from "express";
import { createServer } from "http";
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
config();
const PORT = process.env.PORT;
async function ServerStart() {
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
    const server = new ApolloServer({
        schema,
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
    app.use("/", cors(), bodyParser.json(), expressMiddleware(server, {
        context: async ({ req }) => {
            const { cache } = server;
            let user = null;
            if (req.headers?.token) {
                user = await getUser(client, req.headers?.token);
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
    }));
    httpServer.listen({ port }, () => {
        console.log(`🚀  Server ready at: http://localhost:${port}`);
    });
}
ServerStart();
