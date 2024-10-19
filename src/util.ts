import { Swarm } from "./core";
import { Agent, AgentFunction, ChatCompletionMessage } from "./types";

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

export async function runLoop(
  agent: Agent,
  initialContextVariables: Record<string, any> = {},
  debug: boolean = false
): Promise<void> {
  const contextVariables = { ...initialContextVariables };
  const history: ChatCompletionMessage[] = [];

  while (true) {
    const userInput = await promptUser("> ");
    if (userInput.toLowerCase() === "exit") break;

    history.push({ role: "user", content: userInput });

    const swarm = new Swarm();
    const response = await swarm.run({
      agent,
      messages: history,
      context_variables: contextVariables,
      debug,
    });

    // Display the response
    for (const message of response.messages) {
      console.log(`${message.sender}[${message.role}]: ${message.content}`);
    }

    // Update history and context variables for the next iteration
    history.push(...response.messages);
    Object.assign(contextVariables, response.context_variables);
  }
}

function promptUserBasic(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim()); // Convert Buffer to string and then trim
    });
  });
}

// Helper to prompt user input in the terminal
function promptUser(query: string): Promise<string> {
  const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (answer: string) => {
      rl.close();
      resolve(answer);
    })
  );
}
