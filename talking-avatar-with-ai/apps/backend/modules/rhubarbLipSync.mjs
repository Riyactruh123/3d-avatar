import { execCommand } from "../utils/files.mjs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");

export const getPhonemes = async ({ message }) => {
  try {
    const time = new Date().getTime();
    const mp3Path = path.join(backendDir, "audios", `message_${message}.mp3`);
    const wavPath = path.join(backendDir, "audios", `message_${message}.wav`);
    const jsonPath = path.join(backendDir, "audios", `message_${message}.json`);

    // STEP 1: Fast Conversion to 16kHz Mono
    // PocketSphinx (Original Engine) requires 16kHz. 
    // Lowering it to this minimum makes the math 3x faster for the engine.
    await execCommand({ 
      command: `ffmpeg -y -i "${mp3Path}" -ac 1 -ar 16000 -acodec pcm_s16le "${wavPath}"` 
    });
    
    // STEP 2: Run Rhubarb (Original Engine)
    // We wrap paths in quotes to handle spaces in folder names
    await execCommand({ 
      command: `rhubarb -f json -o "${jsonPath}" "${wavPath}"` 
    });

    console.log(`[LipSync] Engine finished in ${new Date().getTime() - time}ms`);
  } catch (error) {
    console.error(`[LipSync Error]:`, error.message);
  }
};