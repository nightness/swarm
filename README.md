### README for the NPM Package

![Swarm Logo](assets/logo.png)

# swarm-ai (Experimental, Educational)

This is a TypeScript port of OpenAI's [Swarm](https://github.com/openai/swarm) project, designed for exploring ergonomic, lightweight multi-agent orchestration. This package provides TypeScript support for users interested in building systems inspired by the original Python version. Swarm is an educational framework focused on demonstrating multi-agent orchestration patterns such as handoffs and routines.

> [!WARNING]
> swarm-ai is experimental and intended for educational purposes only. It is not recommended for production use, and there is no official support. Contributions are welcome, but PRs and issues may not be reviewed.

This project is a port of OpenAI's original Python-based [Swarm](https://github.com/openai/swarm). If you are interested in the original implementation, visit the [Swarm GitHub repository](https://github.com/openai/swarm).

## Install

To install the swarm-ai package, use npm:

```bash
npm install swarm-ai
```

Or with yarn:

```bash
yarn add swarm-ai
```

## Usage

Here is a simple usage example that demonstrates how to create a basic agent and run a chat completion with agent handoff:

```typescript
import { Swarm, Agent } from 'swarm-ai';

const client = new Swarm();

const transferToAgentB = () => agentB;

const agentA = new Agent({
  name: "Agent A",
  instructions: "You are a helpful agent.",
  functions: [transferToAgentB],
});

const agentB = new Agent({
  name: "Agent B",
  instructions: "Only speak in Haikus.",
});

client.run({
  agent: agentA,
  messages: [{ role: 'user', content: 'I want to talk to agent B.' }]
}).then((response) => {
  console.log(response.messages[response.messages.length - 1].content);
});
```

Expected output:

```
Hope glimmers brightly,
New paths converge gracefully,
What can I assist?
```

## Table of Contents

- [Overview](#overview)
- [Examples](#examples)
- [Documentation](#documentation)
  - [Running Swarm](#running-swarm)
  - [Agents](#agents)
  - [Functions](#functions)
  - [Streaming](#streaming)
- [Evaluations](#evaluations)
- [Utils](#utils)

# Overview

swarm-ai replicates the concepts introduced by OpenAI's Swarm: coordinating agents and managing handoffs between them. Agents encapsulate instructions and functions, allowing seamless transitions in conversations or workflows.

The goal of swarm-ai is to provide a lightweight, customizable framework that scales well and is easy to test. While the original Swarm was written in Python, this package offers a fully TypeScript-native experience.

## Why Swarm

swarm-ai, like its Python counterpart, is suited for systems that require dynamic coordination between agents, with capabilities beyond simple prompt-based solutions. It emphasizes ergonomic patterns for managing multiple agents and functions.

# Examples

- [`basic`](https://github.com/nightness/swarm-ai/tree/main/examples/basic): Simple examples of fundamentals like setup, function calling, handoffs, and context variables.
- [`airline`](https://github.com/nightness/swarm-ai/tree/main/examples/airline): A multi-agent setup for handling different customer service requests in an airline context.
- [`personal_shopper`](https://github.com/nightness/swarm-ai/tree/main/examples/personal-shopper): A personal shopping agent that helps with making sales and processing refunds.
- [`triage_agent`](https://github.com/openai/swarm/tree/main/examples/triage_agent): Example of setting up a basic triage step to hand off to the right agent. (Not ported yet)
- [`support_bot`](https://github.com/openai/swarm/tree/main/examples/support_bot): A customer service bot that includes a user interface agent and a help center agent with several tools. (Not ported yet)
- [`weather_agent`](https://github.com/openai/swarm/tree/main/examples/weather_agent): Function calling example using a weather agent. (Not ported yet)

# Documentation

## Running Swarm

To use swarm-ai, instantiate a `Swarm` client and run it with an initial `Agent`:

```typescript
import { Swarm } from 'swarm-ai';

const client = new Swarm();
```

### `client.run()`

Swarm's `run()` method is similar to OpenAI's `chat.completions.create()`. It processes a list of messages, handles function execution and agent handoff, and returns a `Response` object. It does not retain state between calls, so you need to pass in the necessary context for each new call.

### `client.run()` Arguments

| Argument              | Type                   | Description                                                                                                                   | Default         |
| --------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------- |
| **agent**             | `Agent`                | The initial agent for the conversation.                                                                                       | (required)      |
| **messages**          | `ChatCompletionMessage[]` | A list of message objects, similar to the [Chat Completions API](https://platform.openai.com/docs/api-reference/chat/create). | (required)      |
| **context_variables** | `Record<string, any>`  | A dictionary of additional context variables, available to agents and functions.                                               | `{}`            |
| **max_turns**         | `number`               | Maximum number of conversation turns.                                                                                         | `Infinity`      |
| **model_override**    | `string \| null`       | Optional override for the model used by the agent.                                                                            | `null`          |
| **execute_tools**     | `boolean`              | If `false`, interrupts execution and returns tool calls.                                                                      | `true`          |
| **stream**            | `boolean`              | Enables streaming responses if `true`.                                                                                        | `false`         |
| **debug**             | `boolean`              | Enables debug logging if `true`.                                                                                              | `false`         |

### `Response` Object

| Field                 | Type                   | Description                                                                                                                   |
| --------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **messages**          | `ChatCompletionMessage[]` | List of messages generated during the conversation.                                                                           |
| **agent**             | `Agent \| null`        | The last agent to handle a message.                                                                                           |
| **context_variables** | `Record<string, any>`  | Updated context variables after the conversation.                                                                             |

## Agents

An `Agent` represents a conversational agent that encapsulates instructions and functions. Agents can switch between each other using handoffs. An agent’s `instructions` serve as its system prompt for the conversation.

### `Agent` Fields

| Field            | Type                     | Description                                                                   | Default                       |
| ---------------- | ------------------------ | ----------------------------------------------------------------------------- | ----------------------------- |
| **name**         | `string`                 | The name of the agent.                                                        | `"Agent"`                     |
| **model**        | `string`                 | The model to be used by the agent.                                            | `"gpt-4"`                     |
| **instructions** | `string \| ((context: Record<string, any>) => string)` | Instructions for the agent. Can be a string or a function that returns a string. | `"You are a helpful agent."`  |
| **functions**    | `AgentFunction[]`        | List of functions that the agent can call.                                    | `[]`                          |
| **tool_choice**  | `string \| null`         | Optional tool choice for the agent.                                           | `null`                        |

## Streaming

To enable streaming, set the `stream` flag to `true` in `client.run()`:

```typescript
const stream = client.run(agent, messages, { stream: true });
for await (const chunk of stream) {
  console.log(chunk);
}
```

The streaming API follows the same event structure as OpenAI’s Chat Completions API. Additionally, two special events, `"delim": "start"` and `"delim": "end"`, signal the start and end of an agent’s handling of a message.

# Evaluations

Evaluations are a critical part of testing the performance of multi-agent systems. You can create your own evaluation suites, or refer to the examples in the original [Swarm repository](https://github.com/openai/swarm) for inspiration.

# Utils

swarm-ai also supports running a simple REPL interface via the `run_demo_loop` utility, which can be used for testing.

```typescript
import { run_demo_loop } from 'swarm-ai/repl';

run_demo_loop(agent, { stream: true });
```

# Core Contributors

This project is based on the original Swarm project by OpenAI. For a list of core contributors, refer to the [Swarm GitHub repository](https://github.com/openai/swarm).

---

### License

This project is licensed under the MIT License.
