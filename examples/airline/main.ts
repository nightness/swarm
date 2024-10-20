import { runLoop } from "@josh.guyette/swarm";
import { triageAgent } from "./configs/agents";

const contextVariables = {
  customer_context: `Customer details:
1. ID: customer_12345
2. NAME: John Doe
...`,
  flight_context: `Flight details:
Flight 1919 from LGA to LAX
...`,
};

runLoop(triageAgent, contextVariables, true);
