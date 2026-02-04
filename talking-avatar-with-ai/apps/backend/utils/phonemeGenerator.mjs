// Fallback phoneme generator when Rhubarb is unavailable
// Generates basic lip-sync data based on audio duration

import fs from 'fs';

const generatePhonemes = async (wavPath) => {
  try {
    const stats = fs.statSync(wavPath);
    const fileSize = stats.size;
    
    // Rough estimate: WAV header is ~44 bytes, rest is audio data
    // CD quality: 44100 Hz, 16-bit (2 bytes) per sample, mono = 88200 bytes per second
    const audioDataSize = fileSize - 44;
    const duration = audioDataSize / 88200; // in seconds
    
    // Generate phonemes at regular intervals (one every 100ms)
    const phonemes = [];
    const interval = 0.1; // 100ms
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const consonants = ['k', 'l', 'm', 'n', 'p', 't', 'd'];
    
    for (let i = 0; i < duration; i += interval) {
      // Alternate between vowels and consonants for natural-looking lip movement
      const phoneme = i % 0.2 < 0.1 
        ? vowels[Math.floor(Math.random() * vowels.length)]
        : consonants[Math.floor(Math.random() * consonants.length)];
      
      phonemes.push({
        start: Math.round(i * 1000), // milliseconds
        end: Math.round((i + interval) * 1000),
        phoneme: phoneme
      });
    }
    
    return { phonemes };
  } catch (error) {
    console.error('Error generating phonemes:', error.message);
    return { phonemes: [] };
  }
};

export { generatePhonemes };
