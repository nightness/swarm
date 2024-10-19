import { Swarm } from "swarm-ai";
import { Agent, ChatCompletionMessage } from "swarm-ai";

export async function runDemoLoop(agent: Agent, contextVariables: Record<string, any>, debug: boolean = false) {
  const client = new Swarm();
  let messages: ChatCompletionMessage[] = [];

  console.log("Starting interactive Swarm demo. Type your messages below:");

  while (true) {
    // Get user input
    const userInput = await promptUser("> ");
    if (userInput.toLowerCase() === "exit") break;

    // Add user message to chat history
    messages.push({ role: "user", content: userInput });

    // Call the agent and get a response
    const response = await client.run({
      agent,
      messages,
      context_variables: contextVariables,
      debug,
    });

    // Display the response
    for (const message of response.messages) {
      console.log(`${message.role}: ${message.content}`);
    }

    // Update the message history and agent if necessary
    messages = response.messages;
  }

  console.log("Exiting demo loop.");
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
