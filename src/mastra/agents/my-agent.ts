import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core";
import { RuntimeContext } from "@mastra/core/di";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

// ランタイムコンテキストの型定義
type MyAgentRuntimeContext = {
  role: string;
};

// 動的エージェント
export const myAgent = new Agent({
  name: "My Agent",
  instructions: async ({ runtimeContext }) => {
    const role = runtimeContext.get("role");

    let baseInstruction = `あなたは${role}です。`;

    return baseInstruction;
  },
  model: openai("gpt-4.1-mini"),
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
});

// 動的エージェントを使用するためのヘルパー関数
export async function generateWithDynamicRole(message: string, role: string) {
  const runtimeContext = new RuntimeContext<MyAgentRuntimeContext>();

  runtimeContext.set("role", role);

  const response = await myAgent.generate(message, {
    runtimeContext,
  });

  return response.text;
}
