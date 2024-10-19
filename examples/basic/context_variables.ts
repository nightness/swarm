import { Swarm, Agent } from "swarm-ai";

const client = new Swarm();

function instructions(contextVariables: Record<string, any>) {
    const name = contextVariables.name || "User";
    return `You are a helpful agent. Greet the user by name (${name}).`;
}

function printAccountDetails(contextVariables: Record<string, any>): string {
    const userId = contextVariables.user_id;
    const name = contextVariables.name;
    console.log(`Account Details: ${name} ${userId}`);
    return "Success";
}

const agent = new Agent({
    name: "Agent",
    instructions,
    functions: [
        {
            name: "printAccountDetails",
            func: printAccountDetails,
            parameters: {},
        },
    ],
});

const contextVariables = { name: "James", user_id: 123 };

client.run({
    agent,
    messages: [{ role: "user", content: "Hi!" }],
    context_variables: contextVariables,
}).then((response) => {
    console.log(response.messages[response.messages.length - 1].content);
});

client.run({
    agent,
    messages: [{ role: "user", content: "Print my account details!" }],
    context_variables: contextVariables,
}).then((response) => {
    console.log(response.messages[response.messages.length - 1].content);
});
