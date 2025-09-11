// A self-contained module for robust, high-quality text-to-speech.

let loadedVoices: SpeechSynthesisVoice[] = [];

/**
 * Asynchronously loads and caches the list of available speech synthesis voices.
 * This handles the common browser issue where getVoices() returns an empty list initially.
 * @returns A promise that resolves with an array of SpeechSynthesisVoice objects.
 */
const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      loadedVoices = voices;
      resolve(voices);
      return;
    }
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
        // Avoid alert() in a modern app, but keeping for prototype's direct feedback.
        // alert('Your browser does not support voice alerts.');
        return;
    }

    // Ensure the voices are loaded before proceeding.
    const availableVoices = loadedVoices.length ? loadedVoices : await getVoices();

    // Stop any currently speaking utterance to prevent overlap and ensure responsiveness.
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    // --- Advanced Voice Selection Logic ---
    const voicePriorities: { [key: string]: string[] } = {
        'en-US': ['Google US English', 'Samantha', 'Alex', 'Microsoft Zira Desktop - English (United States)'],
        'hi-IN': ['Google हिन्दी', 'Isha', 'Microsoft Kalpana Desktop - Indian (Hindi)'],
        'ta-IN': ['Google தமிழ்', 'Microsoft Valluvar Desktop - Indian (Tamil)'],
    };

    let selectedVoice: SpeechSynthesisVoice | undefined;
    const priorities = voicePriorities[lang] || [];
    const baseLang = lang.split('-')[0];

    // 1. Try to find a high-quality, prioritized voice for the exact language.
    for (const name of priorities) {
        selectedVoice = availableVoices.find(v => v.name === name && v.lang === lang);
        if (selectedVoice) break;
    }

    // 2. If not found, find any voice that matches the exact language.
    if (!selectedVoice) {
        selectedVoice = availableVoices.find(v => v.lang === lang);
    }
    
    // 3. If still not found, find a voice for the base language (e.g., 'en' for 'en-GB').
    if (!selectedVoice) {
        selectedVoice = availableVoices.find(v => v.lang.startsWith(baseLang));
    }

    if (selectedVoice) {
        utterance.voice = selectedVoice;
    } else {
        console.warn(`No specific voice found for language '${lang}'. Using browser default.`);
    }

    // Fine-tune parameters for a calmer, smoother, and lower voice as requested.
    utterance.volume = 1;   // Maximum volume.
    utterance.rate = 0.9;  // Slower for a more deliberate, calm pace.
    utterance.pitch = 0.85; // Slightly lower pitch for a deeper, more reassuring voice.


    // Speak immediately without artificial delay.
    window.speechSynthesis.speak(utterance);
};