import { OpenAI } from "openai";
import {
  Agent,
  ChatCompletionMessage,
  AgentFunction,
  Response,
  Result,
} from "./types";
import { functionToJson, debugPrint, mergeChunk } from "./util";

const __CTX_VARS_NAME__ = "context_variables";

class DefaultDict<T> extends Map<string, T> {
  defaultFactory: () => T;

  constructor(defaultFactory: () => T) {
    super();
    this.defaultFactory = defaultFactory;
  }

  get(key: string): T {
    if (!this.has(key)) {
      this.set(key, this.defaultFactory());
    }
    return super.get(key)!;
  }
}

export class Swarm {
  client: any;

  constructor(client: any = null) {
    this.client = client || new OpenAI();
  }

  async getChatCompletion(
    agent: Agent,
    history: ChatCompletionMessage[],
    contextVariables: Record<string, any>,
    modelOverride: string | null = null,
    stream: boolean = false,
    debug: boolean = false
  ): Promise<ChatCompletionMessage> {
    const contextVars = new DefaultDict<string>(() => "");
    Object.assign(contextVars, contextVariables);
    const instructions =
      typeof agent.instructions === "function"
        ? agent.instructions(contextVars)
        : agent.instructions;

    const messages = [{ role: "system", content: instructions }, ...history];

    debugPrint(debug, "Getting chat completion for...:", messages);

    const tools = agent.functions.map((f) => functionToJson(f));

    tools.forEach((tool) => {
      const params = tool.function.parameters;
      delete params.properties[__CTX_VARS_NAME__];
      if (params.required.includes(__CTX_VARS_NAME__)) {
        params.required = params.required.filter(
          (r: string) => r !== __CTX_VARS_NAME__
        );
      }
    });

    const createParams: any = {
      model: modelOverride || agent.model,
      messages,
      tools: tools.length ? tools : null,
      tool_choice: agent.tool_choice,
      stream,
    };

    if (tools.length) {
      createParams.parallel_tool_calls = agent.parallel_tool_calls;
    }

    return this.client.chat.completions.create(createParams);
  }

  handleFunctionResult(result: any, debug: boolean): Result {
    if (result instanceof Result) {
      return result;
    } else if (result instanceof Agent) {
      return new Result({
        value: JSON.stringify({ assistant: result.name }),
        agent: result,
      });
    } else {
      try {
        return new Result({ value: String(result) });
      } catch (e) {
        const errorMsg = `Failed to cast response to string: ${result}. Error: ${
          (e as Error).message
        }`;
        debugPrint(debug, errorMsg);
        throw new TypeError(errorMsg);
      }
    }
  }

  async handleToolCalls(
    toolCalls: any[],
    functions: AgentFunction[],
    contextVariables: Record<string, any>,
    debug: boolean
  ): Promise<Response> {
    const functionMap: Record<string, AgentFunction> = {};
    functions.forEach((f) => (functionMap[f.name] = f));

    const partialResponse = new Response({
      messages: [],
      agent: null,
      context_variables: {},
    });

    for (const toolCall of toolCalls) {
      const name = toolCall.function.name;
      if (!functionMap[name]) {
        debugPrint(debug, `Tool ${name} not found in function map.`);
        partialResponse.messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          tool_name: name,
          content: `Error: Tool ${name} not found.`,
        });
        continue;
      }

      const args = JSON.parse(toolCall.function.arguments);
      debugPrint(debug, `Processing tool call: ${name} with arguments`, args);

      const func = functionMap[name];

      if (__CTX_VARS_NAME__ in func.parameters) {
        args[__CTX_VARS_NAME__] = contextVariables;
      }

      const rawResult = await func.func(args);
      const result = this.handleFunctionResult(rawResult, debug);

      partialResponse.messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        tool_name: name,
        content: result.value,
      });

      Object.assign(
        partialResponse.context_variables,
        result.context_variables
      );
      if (result.agent) {
        partialResponse.agent = result.agent;
      }
    }

    return partialResponse;
  }

  async *runAndStream(
    agent: Agent,
    messages: ChatCompletionMessage[],
    contextVariables: Record<string, any> = {},
    modelOverride: string | null = null,
    debug: boolean = false,
    maxTurns: number = Infinity,
    executeTools: boolean = true
  ) {
    let activeAgent = agent;
    const contextVars = new DefaultDict<string>(() => "");
    Object.assign(contextVars, contextVariables); // Combine the passed contextVariables

    const history = [...messages];
    const initLen = messages.length;

    while (history.length - initLen < maxTurns) {
      const message: ChatCompletionMessage = {
        content: "",
        sender: agent.name,
        role: "assistant",
        function_call: undefined,
        tool_calls: [],
      };

      // Get the chat completion for the current agent and message history
      const completion = await this.getChatCompletion(
        activeAgent,
        history,
        contextVars,
        modelOverride,
        true, // Enable streaming
        debug
      );

      // Handle the completion response directly, not as an iterable
      const delta = JSON.parse(completion.choices[0].delta);
      if (delta.role === "assistant") {
        delta.sender = activeAgent.name;
      }
      yield delta; // Emit the delta

      mergeChunk(message, delta); // Merge the delta into the message

      if (!message.tool_calls?.length || !executeTools) {
        debugPrint(debug, "Ending turn.");
        break;
      }

      // Convert tool calls to objects
      const toolCalls =
        message.tool_calls?.map((tc) => ({
          id: tc.id,
          function: {
            arguments: tc.function.arguments,
            name: tc.function.name,
          },
        })) || [];

      // Handle function calls, updating context_variables, and switching agents if needed
      const partialResponse = await this.handleToolCalls(
        toolCalls,
        activeAgent.functions,
        contextVars,
        debug
      );
      history.push(...partialResponse.messages);
      Object.assign(contextVars, partialResponse.context_variables);

      if (partialResponse.agent) {
        activeAgent = partialResponse.agent;
      }
    }

    // Final response yield
    yield {
      response: new Response({
        messages: history.slice(initLen),
        agent: activeAgent,
        context_variables: contextVars,
      }),
    };
  }
}
