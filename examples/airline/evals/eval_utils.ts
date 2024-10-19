import { Agent, Response, Swarm } from "swarm-ai";
import * as fs from "fs";
import * as path from "path";

export async function runFunctionEvals(agent: Agent, testCases: any[], n = 1, evalPath: string | null = null) {
  const results: any[] = [];
  const client = new Swarm();

  for (const testCase of testCases) {
    let caseCorrect = 0;
    const caseResults = {
      messages: testCase.conversation,
      expectedFunction: testCase.function,
      actualFunction: [] as string[],
      actualMessage: [] as string[],
    };

    for (let i = 0; i < n; i++) {
      const response = await client.run({
        agent,
        messages: testCase.conversation,
        maxTurns: 1,
      });
      const output = extractResponseInfo(response);
      const actualFunction = output.tool_calls || "None";
      const actualMessage = output.message || "None";

      caseResults.actualFunction.push(actualFunction);
      caseResults.actualMessage.push(actualMessage);

      if (actualFunction === testCase.function) {
        caseCorrect++;
      }
    }

    caseResults["caseAccuracy"] = `${((caseCorrect / n) * 100).toFixed(2)}%`;
    results.push(caseResults);
  }

  if (evalPath) {
    const existingData = JSON.parse(fs.readFileSync(path.resolve(evalPath), "utf8") || "[]");
    existingData.push(results);
    fs.writeFileSync(path.resolve(evalPath), JSON.stringify(existingData, null, 2));
  }

  return results;
}

function extractResponseInfo(response: Response) {
  const results: Record<string, string> = {};
  for (const message of response.messages) {
    if (message.role === "tool") {
      results.tool_calls = message.tool_name;
      break;
    } else if (!message.tool_calls && message.content) {
      results.message = message.content;
    }
  }
  return results;
}
