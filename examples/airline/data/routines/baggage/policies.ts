export const FLIGHT_CANCELLATION_POLICY = `
1. Confirm which flight the customer is asking to cancel.
2. Confirm if the customer wants a refund or flight credits.
3. Call the appropriate function to process the request.
`;

export const FLIGHT_CHANGE_POLICY = `
1. Verify the flight details and the reason for the change request.
2. Offer a new flight if applicable, call change_flight if valid.
`;

export const LOST_BAGGAGE_POLICY = `
1. Call initiate_baggage_search.
2. If baggage is found, arrange delivery. Otherwise, escalate to agent.
`;

