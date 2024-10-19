import { AgentFunction } from "./types";

export function debugPrint(debug: boolean, ...args: any[]): void {
  if (!debug) return;
  const timestamp = new Date().toISOString();
  const message = args
    .map((arg) =>
      typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg
    )
    .join(" ");
  console.log(`[${timestamp}] ${message}`);
}

export function mergeFields(
  target: Record<string, any>,
  source: Record<string, any>
): void {
  for (const key in source) {
    if (typeof source[key] === "string") {
      target[key] = (target[key] || "") + source[key];
    } else if (source[key] && typeof source[key] === "object") {
      target[key] = target[key] || {};
      mergeFields(target[key], source[key]);
    }
  }
}

export function mergeChunk(
  finalResponse: Record<string, any>,
  delta: Record<string, any>
): void {
  delete delta.role;
  mergeFields(finalResponse, delta);

  if (delta.tool_calls && Array.isArray(delta.tool_calls)) {
    delta.tool_calls.forEach((toolCallDelta: any, index: number) => {
      const toolCall = finalResponse.tool_calls[index] || {};
      mergeFields(toolCall, toolCallDelta);
      finalResponse.tool_calls[index] = toolCall;
    });
  }
}

export function functionToJson(
  agentFunction: AgentFunction
): Record<string, any> {
  return {
    type: "function",
    function: {
      name: agentFunction.name,
      description: agentFunction.description || "",
      parameters: {
        type: "object",
        properties: agentFunction.parameters,
        required: agentFunction.required || [],
      },
    },
  };
}
