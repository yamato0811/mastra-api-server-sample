import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { AISDKExporter } from "langsmith/vercel";

import { myAgent, generateWithDynamicRole } from "./agents/my-agent";

export const mastra = new Mastra({
  agents: { myAgent },
  storage: new LibSQLStore({
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
  telemetry: {
    serviceName: "your-service-name",
    enabled: true,
    export: {
      type: "custom",
      exporter: new AISDKExporter(),
    },
  },
  server: {
    port: 3000, // デフォルトは4111
    timeout: 10000, // デフォルトは30000（30秒）
    cors: {
      origin: ["*"], // 特定のオリジンを許可、または'*'ですべてを許可
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      credentials: false,
    },
    apiRoutes: [
      // 動的エージェントAPI
      {
        path: "/api/agent/chat",
        method: "POST",
        handler: async (c) => {
          try {
            const body = await c.req.json();
            const { message, role } = body;

            // 動的エージェントでレスポンス生成
            const response = await generateWithDynamicRole(message, role);

            return c.json({
              response,
              config: {
                role,
              },
            });
          } catch (error) {
            console.error("Chat error:", error);
            return c.json(
              {
                error: "Failed to generate response",
                message:
                  error instanceof Error ? error.message : "Unknown error",
              },
              500,
            );
          }
        },
      },
      // ヘルスチェックAPI
      {
        path: "/api/health",
        method: "GET",
        handler: async (c) => {
          return c.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            service: "mastra-agent",
          });
        },
      },
    ],
  },
});
