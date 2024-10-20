Here is the updated README based on your provided `package.json` scripts:

---

# Swarm Basic (TypeScript)

This folder contains basic examples demonstrating the core capabilities of Swarm, a TypeScript port of OpenAI's [Swarm](https://github.com/openai/swarm) project. These examples showcase the simplest implementations of Swarm, with one input message and a corresponding output. The `simple_loop_no_helpers.ts` example includes a while loop to demonstrate how to create an interactive Swarm session.

## Examples

1. **agent_handoff.ts**

   - Demonstrates how to transfer a conversation from one agent to another.
   - **Usage**: Transfers Spanish-speaking users from an English agent to a Spanish agent.

2. **bare_minimum.ts**

   - A bare minimum example showing the basic setup of an agent.
   - **Usage**: Sets up an agent that responds to a simple user message.

3. **context_variables.ts**

   - Shows how to use context variables within an agent.
   - **Usage**: Uses context variables to greet a user by name and print account details.

4. **function_calling.ts**

   - Demonstrates how to define and call functions from an agent.
   - **Usage**: Sets up an agent that can respond with weather information for a given location.

5. **simple_loop_no_helpers.ts**

   - An example of a simple interaction loop without using helper functions.
   - **Usage**: Sets up a loop where the user can continuously interact with the agent, printing the conversation.

## Running the Examples

You can run any of the examples by using the following commands from the `package.json` scripts:

### Running individual examples

- **Agent Handoff**: 
  ```bash
  npm run agent_handoff
  ```

- **Bare Minimum**: 
  ```bash
  npm run bare_minimum
  ```

- **Context Variables**: 
  ```bash
  npm run context_variables
  ```

- **Function Calling**: 
  ```bash
  npm run function_calling
  ```

- **Simple Loop (No Helpers)**: 
  ```bash
  npm run simple_loop_no_helpers
  ```

### Running manually with `ts-node`

Alternatively, you can also run any of the examples directly using `ts-node`:

```bash
ts-node src/<example_name>.ts
```

For example:

```bash
ts-node src/agent_handoff.ts
```

## Prerequisites

Make sure you have installed the necessary dependencies:

```bash
npm install
```

This will install the `@josh.guyette/swarm` library, along with other required development dependencies like `typescript` and `ts-node`.
