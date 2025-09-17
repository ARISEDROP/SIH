/**
 * A self-contained module for robust, high-quality ("premium") text-to-speech.
 * This service improves upon the standard browser text-to-speech by:
 * 1.  Intelligently selecting the highest-quality voice available on the user's device.
 * 2.  Handling the asynchronous nature of voice loading for reliability.
 * 3.  Fine-tuning speech parameters for a clearer, more pleasant listening experience.
 * 4.  Returning a Promise that resolves when speech is complete, enabling proper async/await.
 */

// A cache for the available voices to avoid repeated lookups.
let loadedVoices: SpeechSynthesisVoice[] = [];
// A singleton promise to ensure the voice loading logic runs only once.
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

/**
 * Asynchronously loads and caches the list of available speech synthesis voices.
 * This handles the common browser issue where getVoices() returns an empty list initially,
 * ensuring that we always have a list of voices to choose from.
 * @returns A promise that resolves with an array of SpeechSynthesisVoice objects.
 */
const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
  // If we already have a promise to get voices, return it to avoid duplicate work.
  if (voicesPromise) {
    return voicesPromise;
  }

  voicesPromise = new Promise((resolve) => {
    // This function checks if voices are loaded and resolves the promise if they are.
    const checkAndResolve = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        loadedVoices = voices;
        resolve(voices);
        // Clean up the event listener once we have the voices.
        window.speechSynthesis.onvoiceschanged = null;
        return true;
      }
      return false;
    };

    // Check immediately. If voices are already available, we resolve and we're done.
    if (!checkAndResolve()) {
      // If not, we set up a listener. The browser will call this when voices are ready.
      // This is the key to robustly handling different browser loading behaviors.
      window.speechSynthesis.onvoiceschanged = checkAndResolve;
    }
  });

  return voicesPromise;
};

// Pre-warm the voice cache when the module is loaded for faster first-use.
if (typeof window !== 'undefined' && window.speechSynthesis) {
  getVoices();
}

/**
 * Speaks a given text using the best available voice for the specified language.
 * This function now returns a Promise that resolves when the speech has finished,
 * making it truly awaitable.
 * @param text The text to be spoken.
 * @param lang The BCP 47 language code (e.g., 'en-US', 'hi-IN', 'ta-IN').
 */
export const speakText = (text: string, lang: string = 'en-US'): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.error('Text-to-speech is not supported in this browser.');
      resolve(); // Resolve silently if not supported
      return;
    }

    try {
      const availableVoices = await getVoices();

      // Stop any currently speaking utterance to prevent overlap.
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;

      // --- Premium Voice Selection Logic ---
      const voicePriorities: { [key: string]: string[] } = {
        'en-US': [
          'Google US English', 'Samantha', 'Alex', 'Victoria',
          'Microsoft Zira Desktop - English (United States)',
          'Microsoft David Desktop - English (United States)',
        ],
        'hi-IN': [
          'Google हिन्दी', 'Isha',
          'Microsoft Kalpana Desktop - Indian (Hindi)',
          'Microsoft Hemant Desktop - Indian (Hindi)',
        ],
        'ta-IN': ['Google தமிழ்', 'Microsoft Valluvar Desktop - Indian (Tamil)'],
        'as-IN': ['Google অসমীয়া'],
      };

      let selectedVoice: SpeechSynthesisVoice | undefined;
      const priorities = voicePriorities[lang] || [];
      const baseLang = lang.split('-')[0];

      // Strategy 1: Find a high-quality, prioritized voice for the exact language.
      for (const name of priorities) {
        selectedVoice = availableVoices.find(v => v.name === name && v.lang === lang);
        if (selectedVoice) break;
      }

      // Strategy 2: If not found, find any available voice that matches the exact language.
      if (!selectedVoice) {
        selectedVoice = availableVoices.find(v => v.lang === lang);
      }
      
      // Strategy 3: If still not found, find a voice for the base language (e.g., 'en' for 'en-GB').
      if (!selectedVoice) {
        selectedVoice = availableVoices.find(v => v.lang.startsWith(baseLang));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        console.warn(`No specific voice found for language '${lang}'. Using browser default.`);
      }

      // Fine-tune parameters for a calmer, smoother, and lower voice.
      utterance.volume = 1;
      utterance.rate = 0.9;
      utterance.pitch = 0.85;

      let resolved = false;

      // Primary resolver: the onend event
      utterance.onend = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };

      // Error handler
      utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        if (!resolved) {
          resolved = true;
          reject(event.error);
        }
      };

      // Speak the utterance
      window.speechSynthesis.speak(utterance);

      // Fallback resolver: polling for `speaking` property
      // This handles browsers/voices where onend might not fire reliably.
      const start = Date.now();
      const poll = setInterval(() => {
        // If speech has finished and onend hasn't fired
        if (!window.speechSynthesis.speaking && !resolved) {
          resolved = true;
          clearInterval(poll);
          resolve();
        }
        // Timeout after 10 seconds to prevent hanging promises
        if (Date.now() - start > 10000 && !resolved) {
            resolved = true;
            clearInterval(poll);
            console.warn('Speech synthesis timed out.');
            resolve(); // Resolve anyway to not block the app
        }
      }, 150);

    } catch (error) {
      console.error("Error setting up speech synthesis:", error);
      reject(error);
    }
  });
};
