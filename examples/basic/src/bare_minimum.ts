import { Swarm, Agent, ChatCompletionMessage } from "@josh.guyette/swarm";

const client = new Swarm();

const agent = new Agent({
    name: "Agent",
    instructions: "You are a helpful agent.",
});

const messages: ChatCompletionMessage[] = [{ role: "user", content: "Hi!" }];

client.run({ agent, messages }).then((response) => {
    console.log(response.messages[response.messages.length - 1].content);
});
