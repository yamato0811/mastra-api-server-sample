import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { CloudflareStore } from "@mastra/cloudflare";
// import { LibSQLStore } from "@mastra/libsql";
// import { AISDKExporter } from "langsmith/vercel";

import { myAgent, generateWithDynamicRole } from "./agents/my-agent";
import { CloudflareDeployer } from "@mastra/deployer-cloudflare";

export const mastra = new Mastra({
  agents: { myAgent },
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
  // build時にlangsmithを利用するとエラーが出るのでコメントアウト
  // 近日中に改修されそう：https://github.com/mastra-ai/mastra/issues/4461
  // telemetry: {
  //   serviceName: "your-service-name",
  //   enabled: true,
  //   export: {
  //     type: "custom",
  //     exporter: new AISDKExporter(),
  //   },
  // },
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
      // 動的エージェントAPI（スレッド対応）
      {
        path: "/api/agent/chat",
        method: "POST",
        handler: async (c) => {
          try {
            const body = await c.req.json();
            const { message, role, threadId } = body;

            // 動的エージェントでレスポンス生成（スレッド対応）
            const response = await generateWithDynamicRole(
              message,
              role,
              threadId,
            );

            return c.json({
              response: response.text,
              threadId: response.threadId,
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
  deployer: new CloudflareDeployer({
    scope: process.env.CLOUDFLARE_ACCOUNT_ID!,
    projectName: process.env.CLOUDFLARE_PROJECT_NAME!,
    routes: [],
    auth: {
      apiToken: process.env.CLOUDFLARE_API_TOKEN!,
      apiEmail: process.env.CLOUDFLARE_EMAIL!,
    },
  }),
});
