import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Groq from "groq-sdk";
import { lipSync } from "./modules/lip-Sync.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


app.use(express.json({ limit: "50mb" }));
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],}));
const processToAvatar = async (text) => {
  const completion = await groq.chat.completions.create({
    messages: [
      { 
        role: "system", 
        content: "You are a fast AI. Respond ONLY in English. Use EXACTLY 5 to 8 words. Be extremely brief for speed." 
      },
      { role: "user", content: text }
    ],
    model: "llama-3.1-8b-instant", // FASTEST MODEL
  });

  const aiText = completion.choices[0].message.content;
  return await lipSync({ messages: [{ text: aiText, facialExpression: "smile", animation: "Talking_1" }] });
};

app.post("/sts", async (req, res) => {
  const { audio } = req.body;
  const tempWebm = path.resolve(__dirname, "audios", `in_${Date.now()}.webm`);
  const tempWav = path.resolve(__dirname, "audios", `in_${Date.now()}.wav`);

  try {
    fs.writeFileSync(tempWebm, Buffer.from(audio, "base64"));
    const { execSync } = await import("child_process");
    execSync(`ffmpeg -i "${tempWebm}" -ar 16000 -ac 1 -c:a pcm_s16le "${tempWav}" -y`, { stdio: 'ignore' });

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempWav),
      model: "whisper-large-v3",
    });

    const messages = await processToAvatar(transcription.text);
    res.send({ messages });
  } catch (err) {
    res.status(500).send("Error");
  } finally {
    if (fs.existsSync(tempWebm)) fs.unlinkSync(tempWebm);
    if (fs.existsSync(tempWav)) fs.unlinkSync(tempWav);
  }
});

app.post("/tts", async (req, res) => {
  const messages = await processToAvatar(req.body.message);
  res.send({ messages });
});
app.get("/", (req, res) => {
  res.send("Fast Avatar Server is running.");
});
app.listen(3001, () => console.log("🚀 Fast Avatar Server: http://localhost:3001"));