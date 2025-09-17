import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import { SparklesIcon, SendIcon, UserIcon, MicrophoneIcon, SpeakerIcon } from '../common/icons';
import { streamGeminiResponse, translateText, translateToEnglish } from '../../services/gemini';
import { speakText } from '../../services/voice';
import { useAppContext } from '../../context/AppContext';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({ isOpen, onClose }) => {
  const { language } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([
      { sender: 'bot', text: "Hello! I'm Aqua, your personal water quality assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Setup Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = language;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        setInput(event.results[0][0].transcript);
      };
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, [language]);

  useEffect(() => {
    if (isOpen) {
        setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const botMessagePlaceholder: Message = { sender: 'bot', text: "" };
    setMessages(prev => [...prev, botMessagePlaceholder]);

    try {
        // 1. Translate user input to English if necessary
        let promptForGemini = userMessage.text;
        if (language !== 'en-US') {
            promptForGemini = await translateToEnglish(userMessage.text, language);
        }

        // 2. Get full response from Gemini (in English)
        let fullEnglishResponse = "";
        const stream = streamGeminiResponse(promptForGemini);
        for await (const chunk of stream) {
            fullEnglishResponse += chunk;
        }

        // 3. Translate response back to the user's language if necessary
        let finalBotResponse = fullEnglishResponse;
        if (language !== 'en-US' && fullEnglishResponse) {
            finalBotResponse = await translateText(fullEnglishResponse, language);
        }
        
        // 4. Update the placeholder message with the final, translated response
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { sender: 'bot', text: finalBotResponse || "Sorry, I couldn't get a response." };
            return newMessages;
        });

    } catch (error) {
        console.error("Error getting response from Gemini:", error);
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { sender: 'bot', text: "I'm having trouble connecting right now. Please try again later." };
            return newMessages;
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSpeak = async (text: string) => {
    let translatedText = text;
    // The bot's internal text is now in the user's language, so we can speak it directly.
    await speakText(translatedText, language);
  };

  const handleClose = () => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Ask Aqua AI">
      <div className="flex flex-col h-[70vh] max-h-[500px]">
        <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-gradient-to-b from-slate-800/40 to-slate-900/40">
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''} animate-fade-in-up group`} style={{ animationDuration: '400ms' }}>
                    {msg.sender === 'bot' && (
                        <div className="w-8 h-8 flex-shrink-0 bg-purple-500 text-white rounded-full flex items-center justify-center">
                           <SparklesIcon className="w-5 h-5"/>
                        </div>
                    )}
                    <div className={`relative max-w-xs md:max-w-md p-3 rounded-lg text-white ${msg.sender === 'user' ? 'bg-cyan-600 rounded-br-none' : 'bg-slate-700 rounded-bl-none'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        {msg.sender === 'bot' && msg.text && !isLoading && (
                             <button 
                                onClick={() => handleSpeak(msg.text)} 
                                className="absolute -bottom-3 -right-3 p-1.5 bg-slate-600 rounded-full text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 hover:text-white active:scale-90"
                                aria-label="Read message aloud"
                            >
                                <SpeakerIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                     {msg.sender === 'user' && (
                        <div className="w-8 h-8 flex-shrink-0 bg-slate-600 text-white rounded-full flex items-center justify-center">
                           <UserIcon className="w-5 h-5"/>
                        </div>
                    )}
                </div>
            ))}
            {isLoading && messages[messages.length-1].text === "" && (
                 <div className="flex items-start gap-3 animate-fade-in-up" style={{ animationDuration: '400ms' }}>
                    <div className="w-8 h-8 flex-shrink-0 bg-purple-500 text-white rounded-full flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5 animate-pulse"/>
                    </div>
                    <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-slate-700 rounded-bl-none">
                        <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '75ms'}}></span>
                            <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '150ms'}}></span>
                            <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '300ms'}}></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-slate-700">
            <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about water safety..."
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg py-3 pl-4 pr-24 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                    {recognitionRef.current && (
                         <button
                            type="button"
                            onClick={handleMicClick}
                            className={`p-2 rounded-full transition-all mr-2 ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-gray-400 hover:text-white'} active:scale-90`}
                            aria-label={isListening ? 'Stop listening' : 'Start listening'}
                          >
                            <MicrophoneIcon className="w-5 h-5" />
                          </button>
                    )}
                  <button onClick={handleSend} disabled={isLoading || !input.trim()} className="flex items-center justify-center w-12 text-cyan-400 hover:text-cyan-300 disabled:text-gray-500 transition-transform active:scale-90">
                      <SendIcon />
                  </button>
                </div>
            </div>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(ChatbotModal);