/**
 * A self-contained module for robust, high-quality ("premium") text-to-speech.
 * This service improves upon the standard browser text-to-speech by:
 * 1.  Intelligently selecting the highest-quality voice available on the user's device.
 * 2.  Handling the asynchronous nature of voice loading for reliability.
 * 3.  Mitigating common browser bugs like synthesis failure and interruptions.
 * 4.  Returning a Promise that resolves when speech is complete, enabling proper async/await.
 */

// A cache for the available voices to avoid repeated lookups.
let loadedVoices: SpeechSynthesisVoice[] = [];
// A singleton promise to ensure the voice loading logic runs only once.
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;
// A reference to the keep-alive interval.
let keepAliveInterval: number | null = null;

/**
 * Starts a keep-alive interval to prevent the speech synthesis engine from going dormant.
 * Some browsers (especially on mobile) will deactivate the TTS engine after a period of inactivity.
 * This function periodically sends a silent utterance to keep it active.
 */
const startKeepAlive = () => {
  if (keepAliveInterval) return; // Already started
  
  console.log('Starting TTS Keep-alive.');
  keepAliveInterval = window.setInterval(() => {
    if (window.speechSynthesis && !window.speechSynthesis.speaking) {
      const ping = new SpeechSynthesisUtterance('');
      ping.volume = 0;
      window.speechSynthesis.speak(ping);
    }
  }, 10000); // Every 10 seconds
};


/**
 * Asynchronously loads and caches the list of available speech synthesis voices.
 * This handles the common browser issue where getVoices() returns an empty list initially,
 * ensuring that we always have a list of voices to choose from.
 * @returns A promise that resolves with an array of SpeechSynthesisVoice objects.
 */
const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
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
        startKeepAlive(); // Start the keep-alive once voices are successfully loaded.
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
 * This function returns a Promise that resolves when the speech has finished.
 * @param text The text to be spoken.
 * @param lang The BCP 47 language code (e.g., 'en-US', 'hi-IN').
 */
export const speakText = async (text: string, lang: string = 'en-US'): Promise<void> => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.error('Text-to-speech is not supported in this browser.');
    return;
  }
  
  // Ensure any previously speaking utterance is stopped to prevent overlaps.
  window.speechSynthesis.cancel();
  
  // Ensure voices are loaded before proceeding.
  const availableVoices = await getVoices();

  // A brief, non-blocking pause for browsers to process the `cancel` command.
  await new Promise(resolve => setTimeout(resolve, 50));

  return new Promise((resolve, reject) => {
    if (!text.trim()) {
        resolve();
        return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    // --- Refactored Voice Selection Logic for Robustness ---
    // This logic improves voice selection, especially for languages that might not have a
    // dedicated voice on a user's device, like Manipuri.
    const findBestVoice = (targetLang: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
        // Define high-quality, preferred voices by name.
        const voicePriorities: { [key: string]: string[] } = {
            'en-US': ['Google US English', 'Samantha', 'Alex', 'Microsoft Zira Desktop - English (United States)'],
            'hi-IN': ['Google हिन्दी', 'Isha', 'Microsoft Kalpana Desktop - Indian (Hindi)'],
            'bn-IN': ['Google বাংলা', 'Microsoft Heera - Bengali (India)'],
        };

        // Define fallback language search order. Because Manipuri (mni-IN) and Assamese (as-IN)
        // use the Bengali script, a Bengali voice is a high-quality fallback.
        const langSearchOrder: { [key: string]: string[] } = {
            'mni-IN': ['mni-IN', 'mni', 'bn-IN', 'bn'],
            'as-IN': ['as-IN', 'as', 'bn-IN', 'bn'],
            'hi-IN': ['hi-IN', 'hi'],
            'bn-IN': ['bn-IN', 'bn'],
            'en-US': ['en-US', 'en'],
        };

        const languagesToTry = langSearchOrder[targetLang] || [targetLang, targetLang.split('-')[0]];
        
        // --- Search Strategy ---
        // 1. Look for a high-quality, prioritized voice by name across the language and its fallbacks.
        for (const langCode of languagesToTry) {
            const priorityNames = voicePriorities[langCode as keyof typeof voicePriorities] || [];
            for (const name of priorityNames) {
                const foundVoice = voices.find(v => v.name === name);
                if (foundVoice) return foundVoice;
            }
        }

        // 2. If no high-quality voice is found, find the first available voice that matches the language code.
        for (const langCode of languagesToTry) {
            const foundVoice = voices.find(v => v.lang.startsWith(langCode));
            if (foundVoice) return foundVoice;
        }

        // 3. If no voice is found after all checks, return null.
        return null;
    };

    const selectedVoice = findBestVoice(lang, availableVoices);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log(`[TTS] Using selected voice: ${selectedVoice.name} (${selectedVoice.lang}) for language code '${lang}'`);
    } else {
      console.warn(`[TTS] No specific voice found for language '${lang}' or its fallbacks. Using browser default.`);
      if (availableVoices.length > 0) {
        console.log('[TTS] Available voices:', availableVoices.map(v => `${v.name} (${v.lang})`));
      } else {
        console.warn('[TTS] No voices available at all from the browser.');
      }
    }

    // Standard quality settings provide the most natural and clear speech.
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => resolve();
    
    utterance.onerror = (event) => {
      // The 'interrupted' error often occurs when we intentionally call `cancel()`,
      // so we can treat it as a successful cancellation rather than an error.
      if (event.error === 'interrupted') {
        console.warn('Speech synthesis was interrupted, likely by a new speech request.');
        resolve();
      } else {
        console.error('SpeechSynthesisUtterance.onerror:', event.error);
        reject(new Error(`Speech synthesis failed: ${event.error}`));
      }
    };
    
    // Ensure the speech synthesis engine is not in a paused state.
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  });
};
