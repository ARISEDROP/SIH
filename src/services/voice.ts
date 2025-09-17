// A self-contained module for robust, high-quality text-to-speech.

let loadedVoices: SpeechSynthesisVoice[] = [];

/**
 * Asynchronously loads and caches the list of available speech synthesis voices.
 * This handles the common browser issue where getVoices() returns an empty list initially.
 * @returns A promise that resolves with an array of SpeechSynthesisVoice objects.
 */
const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    // Already loaded
    if (loadedVoices.length > 0) {
      resolve(loadedVoices);
      return;
    }
    
    // Voices loaded before we checked
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      loadedVoices = voices;
      resolve(voices);
      return;
    }

    // Need to wait for the event
    window.speechSynthesis.onvoiceschanged = () => {
      const updatedVoices = window.speechSynthesis.getVoices();
      loadedVoices = updatedVoices;
      resolve(updatedVoices);
    };
  });
};

// Pre-warm the voice cache when the module is loaded.
if (typeof window !== 'undefined' && window.speechSynthesis) {
  getVoices();
}

/**
 * Speaks a given text using the best available voice for the specified language.
 * It prioritizes high-quality voices and ensures audio is not delayed.
 * @param text The text to be spoken.
 * @param lang The BCP 47 language code (e.g., 'en-US', 'hi-IN', 'ta-IN').
 */
export const speakText = async (text: string, lang: string = 'en-US'): Promise<void> => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
        console.error('Text-to-speech is not supported in this browser.');
        return;
    }

    const availableVoices = await getVoices();
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    const voicePriorities: { [key: string]: string[] } = {
        'en-US': ['Google US English', 'Samantha', 'Alex', 'Microsoft Zira Desktop - English (United States)'],
        'hi-IN': ['Google हिन्दी', 'Isha', 'Microsoft Kalpana Desktop - Indian (Hindi)'],
        'ta-IN': ['Google தமிழ்', 'Microsoft Valluvar Desktop - Indian (Tamil)'],
    };

    let selectedVoice: SpeechSynthesisVoice | undefined;
    const priorities = voicePriorities[lang] || [];
    const baseLang = lang.split('-')[0];

    for (const name of priorities) {
        selectedVoice = availableVoices.find(v => v.name === name && v.lang === lang);
        if (selectedVoice) break;
    }

    if (!selectedVoice) selectedVoice = availableVoices.find(v => v.lang === lang);
    if (!selectedVoice) selectedVoice = availableVoices.find(v => v.lang.startsWith(baseLang));

    if (selectedVoice) {
        utterance.voice = selectedVoice;
    } else {
        console.warn(`No specific voice found for language '${lang}'. Using browser default.`);
    }

    utterance.volume = 1;
    utterance.rate = 0.9;
    utterance.pitch = 0.85;

    window.speechSynthesis.speak(utterance);
};
