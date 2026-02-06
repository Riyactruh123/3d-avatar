import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import fs from "fs";
import { Readable } from "stream";
import { finished } from "stream/promises";

// Initialize Polly Client
const polly = new PollyClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const convertTextToSpeech = async ({ text, fileName }) => {
  const command = new SynthesizeSpeechCommand({
    Text: text,
    OutputFormat: "mp3",
    VoiceId: "Matthew", // Natural male voice
    Engine: "neural",
  });

  try {
    const response = await polly.send(command);

    if (response.AudioStream instanceof Readable) {
      // 1. Create a write stream for the file
      const fileStream = fs.createWriteStream(fileName);
      
      // 2. Pipe the Polly stream to the file
      response.AudioStream.pipe(fileStream);

      // 3. WAIT for the pipe to finish completely
      await finished(fileStream);
      
      console.log(`[Polly] Audio successfully saved: ${fileName}`);
    } else {
      throw new Error("AudioStream is not a readable stream");
    }
  } catch (error) {
    console.error("[Polly Error]:", error.message);
    throw error;
  }
};