import { Swarm, Agent, ChatCompletionMessage } from "swarm-ai";

const client = new Swarm();

function getWeather(location: string): string {
    return `{'temp':67, 'unit':'F'}`;
}

const agent = new Agent({
    name: "Agent",
    instructions: "You are a helpful agent.",
    functions: [
        {
            name: "getWeather",
            func: getWeather,
            parameters: {
                location: { type: "string" },
            },
        },
    ],
});

const messages: ChatCompletionMessage[] = [{ role: "user", content: "What's the weather in NYC?" }];

client.run({ agent, messages }).then((response) => {
    console.log(response.messages[response.messages.length - 1].content);
});
