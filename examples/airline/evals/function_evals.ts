import { triageAgent, flightModification } from "../configs/agents";
import { runFunctionEvals } from "./eval_utils";
import * as fs from "fs";

const triageTestCases = JSON.parse(fs.readFileSync("src/evals/eval_cases/triage_cases.json", "utf8"));
const flightModificationCases = JSON.parse(fs.readFileSync("src/evals/eval_cases/flight_modification_cases.json", "utf8"));

(async () => {
  await runFunctionEvals(triageAgent, triageTestCases, 5, "src/evals/eval_results/triage_evals.json");
  await runFunctionEvals(flightModification, flightModificationCases, 5, "src/evals/eval_results/flight_modification_evals.json");
})();
