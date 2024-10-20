import { Agent } from "@josh.guyette/swarm";
import {
  escalateToAgent,
  validToChangeFlight,
  changeFlight,
  initiateRefund,
  initiateFlightCredits,
  caseResolved,
  initiateBaggageSearch,
} from "./tools";
import { STARTER_PROMPT } from "../data/routines/prompts";
import {
  FLIGHT_CANCELLATION_POLICY,
  FLIGHT_CHANGE_POLICY,
  LOST_BAGGAGE_POLICY,
} from "../data/routines/baggage/policies";

// Agent transfers
export const transferToFlightModification = () => flightModification;
export const transferToFlightCancel = () => flightCancel;
export const transferToFlightChange = () => flightChange;
export const transferToLostBaggage = () => lostBaggage;
export const transferToTriage = () => triageAgent;

// Triage instructions
export const triageInstructions = (contextVariables: Record<string, any>) => {
  const customerContext = contextVariables.customer_context || "";
  const flightContext = contextVariables.flight_context || "";
  return `You are to triage a user's request, and call a tool to transfer to the right intent. Customer context: ${customerContext}, Flight context: ${flightContext}`;
};

// Agents
export const triageAgent = new Agent({
  name: "Triage Agent",
  instructions: triageInstructions,
  functions: [transferToFlightModification, transferToLostBaggage],
});

export const flightModification = new Agent({
  name: "Flight Modification Agent",
  instructions:
    "You are a Flight Modification Agent. Decide if it's a cancel or change request.",
  functions: [transferToFlightCancel, transferToFlightChange],
});

export const flightCancel = new Agent({
  name: "Flight Cancel Agent",
  instructions: STARTER_PROMPT + FLIGHT_CANCELLATION_POLICY,
  functions: [
    escalateToAgent,
    initiateRefund,
    initiateFlightCredits,
    transferToTriage,
    caseResolved,
  ],
});

export const flightChange = new Agent({
  name: "Flight Change Agent",
  instructions: STARTER_PROMPT + FLIGHT_CHANGE_POLICY,
  functions: [
    escalateToAgent,
    changeFlight,
    validToChangeFlight,
    transferToTriage,
    caseResolved,
  ],
});

export const lostBaggage = new Agent({
  name: "Lost Baggage Agent",
  instructions: STARTER_PROMPT + LOST_BAGGAGE_POLICY,
  functions: [escalateToAgent, initiateBaggageSearch, transferToTriage, caseResolved],
});
