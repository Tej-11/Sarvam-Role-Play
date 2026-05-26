import type { TextToSpeechLanguage, TextToSpeechSpeaker } from "../types/sarvamAi.types.js";

export const getTextToSpeechLanguageCode = (language: string): TextToSpeechLanguage => {
    switch (language.toLowerCase()) {
        case 'english':
        case 'en':
            return 'en-IN';
        case 'hindi':
        case 'hi':
            return 'hi-IN';
        case 'telugu':
        case 'te':
            return 'te-IN';
        case 'kannada':
        case 'kn':
            return 'kn-IN';
        case 'bengali':
        case 'bn':
            return 'bn-IN';
        case 'tamil':
        case 'ta':
            return 'ta-IN';
        case 'odia':
        case 'od':
            return 'od-IN';
        case 'malayalam':
        case 'ml':
            return 'ml-IN';
        case 'marathi':
        case 'mr':
            return 'mr-IN';
        case 'punjabi':
        case 'pa':
            return 'pa-IN';
        case 'gujarati':
        case 'gu':
            return 'gu-IN';
        default:
            return 'en-IN'; // Default to English if language is not recognized
    }
}

export const getTextToSpeechSpeakerCode = (speaker: string): TextToSpeechSpeaker => {
    switch (speaker.toLowerCase()) {
        case 'mani':
            return 'mani';
        case 'priya':
            return 'priya';
        case 'ishita':
            return 'ishita';
        case 'varun':
            return 'varun';
        case 'roopa':
            return 'roopa';
        case 'shubh':
            return 'shubh';
        case 'pooja':
            return 'pooja';
        case 'sunny':
            return 'sunny';
        case 'ratan':
            return 'ratan';
        case 'rehan':
            return 'rehan';
        case 'ashutosh':
            return 'ashutosh';
        case 'amit':
            return 'amit';
        case 'rahul':
            return 'rahul';
        case 'aditya':
            return 'aditya';
        case 'simran':
            return 'simran';
        case 'suhani':
            return 'suhani';
        case 'shreya':
            return 'shreya';
        case 'anand':
            return 'anand';
        case 'rupali':
            return 'rupali';
        case 'neha':
            return 'neha';
        case 'ritu':
            return 'ritu';
        case 'manan':
            return 'manan';
        case 'dev':
            return 'dev';
        default:
            return 'shubh'; // Default to 'shubh' if speaker is not recognized
    }
}
