import http from "node:http";
import cors from "cors";
import cron from "node-cron";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { Server as SocketServer } from "socket.io";
import { env } from "./config/env.js";
import { createCache } from "./lib/cache.js";
import { createStore } from "./lib/db.js";
import { createRoutes } from "./routes.js";
import { createDashboardService } from "./services/dashboardService.js";
import { createChatService } from "./services/chatService.js";
import { createBallDontLieClient } from "./services/providers/ballDontLie.js";
import { createOddsApiClient } from "./services/providers/oddsApi.js";

const app = express();
const server = http.createServer(app);
const allowedOrigins = env.frontendOrigins?.length ? env.frontendOrigins : [env.FRONTEND_ORIGIN];

const corsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error(`CORS origin not allowed: ${origin}`));
};

const io = new SocketServer(server, {
  cors: {
    origin: allowedOrigins
  }
});

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

const cache = createCache(env.REDIS_URL);
const store = createStore(env.DATABASE_URL);
await store.init();

const oddsApi = createOddsApiClient({
  apiKey: env.ODDS_API_KEY,
  baseUrl: env.ODDS_API_BASE_URL,
  timeoutMs: env.REQUEST_TIMEOUT_MS,
  retryAttempts: env.RETRY_ATTEMPTS
});

const ballDontLie = createBallDontLieClient({
  apiKey: env.BALLDONTLIE_API_KEY,
  timeoutMs: env.REQUEST_TIMEOUT_MS,
  retryAttempts: env.RETRY_ATTEMPTS
});

const service = createDashboardService({
  env,
  store,
  cache,
  oddsApi,
  ballDontLie
});

const chatService = createChatService({
  env,
  service,
  store
});

app.use(createRoutes({ env, service, chatService, io }));

app.use((error, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error("[api] unhandled route error:", error);
  res.status(500).json({
    ok: false,
    error: "Internal Server Error",
    message: error?.message || "Unknown server error"
  });
});

process.on("unhandledRejection", (reason) => {
  // eslint-disable-next-line no-console
  console.error("[api] unhandledRejection:", reason);
});

process.on("uncaughtException", (error) => {
  // eslint-disable-next-line no-console
  console.error("[api] uncaughtException:", error);
});

io.on("connection", (socket) => {
  socket.emit("server:ready", { at: new Date().toISOString() });
});

cron.schedule("*/2 * * * *", async () => {
  try {
    const eventsSynced = await service.syncOddsSnapshot();
    const predictions = await service.generatePredictions();
    io.emit("sync:tick", {
      at: new Date().toISOString(),
      eventsSynced,
      predictions: predictions.length
    });
  } catch (error) {
    io.emit("sync:error", { message: error.message });
  }
});

server.listen(env.API_PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Betting Intelligence API running on http://localhost:${env.API_PORT}`);
});
