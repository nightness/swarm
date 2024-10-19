export const escalateToAgent = (reason?: string) =>
    reason ? `Escalating to agent: ${reason}` : "Escalating to agent";
  
  export const validToChangeFlight = () => "Customer is eligible to change flight";
  
  export const changeFlight = () => "Flight was successfully changed!";
  
  export const initiateRefund = () => "Refund initiated";
  
  export const initiateFlightCredits = () => "Successfully initiated flight credits";
  
  export const caseResolved = () => "Case resolved. No further questions.";
  
  export const initiateBaggageSearch = () => "Baggage was found!";
  