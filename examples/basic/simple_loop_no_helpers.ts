import { Swarm, Agent } from "swarm-ai";

const client = new Swarm();

const myAgent = new Agent({
    name: "Agent",
    instructions: "You are a helpful agent.",
});

function prettyPrintMessages(messages: any[]) {
    for (const message of messages) {
        if (!message.content) continue;
        console.log(`${message.sender}: ${message.content}`);
    }
}

let messages: any[] = [];
let agent = myAgent;

(async () => {
    while (true) {
        const userInput = prompt("> ");
        if (!userInput) continue;

        messages.push({ role: "user", content: userInput });
        const response = await client.run({ agent, messages });
        messages = response.messages;
        if (response.agent)
            agent = response.agent;
        prettyPrintMessages(messages);
    }
})();
