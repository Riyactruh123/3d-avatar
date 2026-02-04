import { convertTextToSpeech } from "./elevenLabs.mjs";
import { getPhonemes } from "./rhubarbLipSync.mjs";
import { readJsonTranscript, audioFileToBase64 } from "../utils/files.mjs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");

export const lipSync = async ({ messages }) => {
  const audioDir = path.join(backendDir, "audios");
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir);

  await Promise.all(
    messages.map(async (message, index) => {
      const mp3File = path.join(audioDir, `message_${index}.mp3`);
      const jsonFile = path.join(audioDir, `message_${index}.json`);

      try {
        // Step 1: Generate Audio (Fast ElevenLabs Turbo)
        await convertTextToSpeech({ text: message.text, fileName: mp3File });
        
        // Step 2: High-Accuracy Sync (Original Engine)
        await getPhonemes({ message: index });

        // Step 3: Package for Frontend
        message.audio = await audioFileToBase64({ fileName: mp3File });
        message.lipsync = await readJsonTranscript({ fileName: jsonFile });
      } catch (e) {
        console.error("LipSync Pipeline Error:", e);
      }
    })
  );
  return messages;
};