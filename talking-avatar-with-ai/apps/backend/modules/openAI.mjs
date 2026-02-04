import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import dotenv from "dotenv";
import { defaultResponse } from "./defaultMessages.mjs";

dotenv.config();

// 1. Define the Avatar's Persona
const template = `
  You are Jack, a world traveler.
  You will always respond with a JSON array of messages, with a maximum of 3 messages:
  \n{format_instructions}.
  Each message has properties for text, facialExpression, and animation.
  The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
  The different animations are: Idle, TalkingOne, TalkingThree, SadIdle, Defeated, Angry, 
  Surprised, DismissingGesture and ThoughtfulHeadShake.
`;

const prompt = ChatPromptTemplate.fromMessages([
  ["system", template], // Using 'system' instead of 'ai' for better instruction following
  ["human", "{question}"],
]);

// 2. Initialize Mistral correctly using the official LangChain package
console.log("[Mistral] API Key present:", !!process.env.MISTRAL_API_KEY);

const model = new ChatMistralAI({
  apiKey: process.env.MISTRAL_API_KEY,
  modelName: "mistral-small-latest", // This is the correct 2026 identifier for Mistral Small
  temperature: 0.2,
});

// 3. Define the Structured Parser
const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    messages: z.array(
      z.object({
        text: z.string().describe("Text to be spoken by the AI"),
        facialExpression: z.string().describe("Facial expression for the avatar"),
        animation: z.string().describe("Animation for the avatar"),
      })
    ),
  })
);

// 4. Build the Chain
const mistralChain = prompt.pipe(model).pipe(parser);

// 5. The Invocation Wrapper
const wrappedChain = {
  invoke: async (input) => {
    console.log("[Mistral] Invoking with question:", input.question?.substring(0, 100));

    try {
      if (!process.env.MISTRAL_API_KEY) {
        throw new Error("MISTRAL_API_KEY is missing in .env");
      }

      // Chain logic: Prompt -> Model -> Parse JSON
      const result = await mistralChain.invoke({
        question: input.question || "Hello",
        format_instructions: parser.getFormatInstructions(),
      });

      console.log("[Mistral] Success!");
      return result;

    } catch (error) {
      console.error("[Mistral] Error occurred:", error.message);

      // This avoids the 'match' error by returning a safe default if the API fails
      console.warn("[Mistral] Returning default fallback messages.");
      return { messages: defaultResponse || [{ 
        text: "I'm having a little trouble connecting right now.", 
        facialExpression: "sad", 
        animation: "SadIdle" 
      }]};
    }
  },
};

export { wrappedChain as openAIChain, parser };