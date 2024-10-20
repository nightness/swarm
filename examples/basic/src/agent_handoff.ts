import { Swarm, Agent, ChatCompletionMessage } from "@josh.guyette/swarm";

const client = new Swarm();

const englishAgent = new Agent({
    name: "English Agent",
    instructions: "You only speak English.",
});

const spanishAgent = new Agent({
    name: "Spanish Agent",
    instructions: "You only speak Spanish.",
});

function transferToSpanishAgent() {
    return spanishAgent;
}

englishAgent.functions.push({
    name: "transferToSpanishAgent",
    func: transferToSpanishAgent,
    parameters: {},
});

const messages: ChatCompletionMessage[] = [{ role: "user", content: "Hola. ¿Como estás?" }];

client.run({ agent: englishAgent, messages }).then((response) => {
    console.log(response.messages[response.messages.length - 1].content);
});
