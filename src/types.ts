export interface ChatCompletionMessage {
  role: "system" | "user" | "assistant" | "tool";
  content?: string;
  sender?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
  tool_calls?: ChatCompletionMessage[];
  [key: string]: any;
}

export interface AgentFunction {
  name: string;
  description?: string;
  parameters: {
    [key: string]: {
      type: string;
      description?: string;
    };
  };
  required?: string[];
  func: (args: any) => string | Agent | Record<string, any>;
}

export class Agent {
  name: string;
  model: string;
  instructions: string | ((contextVariables: Record<string, any>) => string);
  functions: AgentFunction[];
  tool_choice: string | null;
  parallel_tool_calls: boolean;

  constructor(init?: Partial<Agent>) {
    this.name = init?.name || "Agent";
    this.model = init?.model || "gpt-4";
    this.instructions = init?.instructions || "You are a helpful agent.";
    this.functions = init?.functions || [];
    this.tool_choice = init?.tool_choice || null;
    this.parallel_tool_calls =
      init?.parallel_tool_calls !== undefined ? init.parallel_tool_calls : true;
  }
}

export class Response {
  messages: ChatCompletionMessage[];
  agent: Agent | null;
  context_variables: Record<string, any>;

  constructor(init?: Partial<Response>) {
    this.messages = init?.messages || [];
    this.agent = init?.agent || null;
    this.context_variables = init?.context_variables || {};
  }
}

export class Result {
  value: string;
  agent?: Agent | null;
  context_variables: Record<string, any>;

  constructor({
    value,
    agent = null,
    context_variables = {},
  }: {
    value: string;
    agent?: Agent | null;
    context_variables?: Record<string, any>;
  }) {
    this.value = value;
    this.agent = agent;
    this.context_variables = context_variables;
  }
}
