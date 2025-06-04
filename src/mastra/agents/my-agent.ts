import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core";
import { RuntimeContext } from "@mastra/core/di";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

const memory = new Memory({
  storage: new LibSQLStore({
    url: process.env.LIBSQL_URL || "file:../mastra.db",
    authToken: process.env.LIBSQL_AUTH_TOKEN,
  }),
});

// 動的エージェント（メモリ機能付き）
export const myAgent = new Agent({
  name: "My Agent",
  instructions: async ({ runtimeContext }) => {
    const role = runtimeContext.get("role");

    let baseInstruction = `あなたは${role}です。`;

    return baseInstruction;
  },
  model: openai("gpt-4.1-mini"),
  memory,
});

// ランタイムコンテキストの型定義
type MyAgentRuntimeContext = {
  role: string;
};

// 動的エージェントを使用するためのヘルパー関数（スレッド対応）
export async function generateWithDynamicRole(
  message: string,
  role: string,
  threadId?: string,
) {
  const runtimeContext = new RuntimeContext<MyAgentRuntimeContext>();

  runtimeContext.set("role", role);

  // threadIdが指定されていない場合は新しいIDを生成
  const actualThreadId =
    threadId ||
    `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const response = await myAgent.generate(message, {
    runtimeContext,
    resourceId: actualThreadId, // resourceIdとしてthreadIdを使用
    threadId: actualThreadId, // threadIdも同じ値を設定
  });

  return {
    text: response.text,
    threadId: actualThreadId, // 使用したスレッドIDを返す
  };
}
