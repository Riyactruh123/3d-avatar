import ElevenLabs from "elevenlabs-node";
import dotenv from "dotenv";
dotenv.config();

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = process.env.ELEVEN_LABS_VOICE_ID;
const modelID = process.env.ELEVEN_LABS_MODEL_ID;

const voice = new ElevenLabs({
  apiKey: elevenLabsApiKey,
  voiceId: voiceID,
});

async function convertTextToSpeech({ text, fileName }) {
  try {
    console.log(`[ElevenLabs] Converting text to speech for file: ${fileName}`);
    console.log(`[ElevenLabs] API Key present: ${!!elevenLabsApiKey}`);
    console.log(`[ElevenLabs] Voice ID: ${voiceID}`);
    console.log(`[ElevenLabs] Model ID: ${modelID}`);
    
    await voice.textToSpeech({
      fileName: fileName,
      textInput: text,
      voiceId: voiceID,
      stability: 0.5,
      similarityBoost: 0.5,
      modelId: modelID,
      style: 1,
      speakerBoost: true,
    });
    console.log(`[ElevenLabs] Successfully saved audio to: ${fileName}`);
  } catch (error) {
    console.error(`[ElevenLabs] Error converting text to speech:`, error.message || error);
    throw error;
  }
}

export { convertTextToSpeech, voice };
