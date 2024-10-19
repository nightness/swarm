import { triageAgent } from "./configs/agents";
import { runDemoLoop } from "./util/runDemoLoop";

const contextVariables = {
  customer_context: `Customer details:
1. ID: customer_12345
2. NAME: John Doe
...`,
  flight_context: `Flight details:
Flight 1919 from LGA to LAX
...`,
};

runDemoLoop(triageAgent, { contextVariables, debug: true });
