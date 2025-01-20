import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { openai } from '../utils/openai';

interface TopicContent {
  id: string;
  title: string;
  prompts: Array<{
    prompt: string;
    hint?: string;
  }>;
}

const topicContents: Record<string, TopicContent> = {
  'past-tense': {
    id: 'past-tense',
    title: 'Past Tense Practice',
    prompts: [
      {
        prompt: '¿Qué hiciste el fin de semana pasado?',
        hint: 'Use the preterite tense to describe what you did last weekend',
      },
      {
        prompt: '¿Qué has hecho hoy?',
        hint: 'Use the present perfect tense to describe what you have done today',
      },
      {
        prompt: '¿Qué hacías cuando eras niño?',
        hint: 'Use the imperfect tense to describe what you used to do as a child',
      },
    ],
  },
  'object-pronouns': {
    id: 'object-pronouns',
    title: 'Object Pronouns Practice',
    prompts: [
      {
        prompt: '¿Le diste el regalo a tu madre?',
        hint: 'Practice using indirect object pronouns (le) in your answer',
      },
      {
        prompt: '¿Me puedes ayudar con la tarea?',
        hint: 'Practice using direct and indirect object pronouns in your response',
      },
      {
        prompt: '¿Se lo explicaste a tus amigos?',
        hint: 'Practice using multiple object pronouns (se, lo) in your answer',
      },
    ],
  },
};

export default function TopicScreen() {
  const { id } = useLocalSearchParams();
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [spanishVoice, setSpanishVoice] = useState<Speech.Voice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  
  const topicContent = topicContents[id as string];
  const currentPrompt = topicContent?.prompts[currentPromptIndex];

  useEffect(() => {
    // Set up audio recording
    const setupAudio = async () => {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      } catch (error) {
        console.error('Failed to setup audio:', error);
      }
    };

    setupAudio();

    // Get available voices when component mounts
    const getVoices = async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        // Find a high-quality Spanish voice
        const bestSpanishVoice = voices.find(
          voice => 
            voice.language.startsWith('es') && 
            voice.quality === Speech.VoiceQuality.Enhanced
        ) || voices.find(
          voice => 
            voice.language.startsWith('es')
        );

        if (bestSpanishVoice) {
          setSpanishVoice(bestSpanishVoice);
        }
      } catch (error) {
        console.error('Failed to get voices:', error);
      }
    };

    getVoices();

    // Cleanup speech when component unmounts
    return () => {
      Speech.stop();
    };
  }, []);

  const speakPrompt = async () => {
    if (isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      await Speech.speak(currentPrompt.prompt, {
        language: 'es-ES',
        voice: spanishVoice?.identifier,
        rate: 0.9,
        pitch: 1.0,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error('Failed to speak:', error);
      setIsSpeaking(false);
    }
  };

  const startRecording = async () => {
    try {
      setIsProcessing(true);
      const { granted } = await Audio.requestPermissionsAsync();
      
      if (!granted) {
        Alert.alert('Permission required', 'Microphone access is needed for recording');
        return;
      }

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsProcessing(true);
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);

      if (!uri) {
        throw new Error('No recording URI available');
      }

      // Create form data for the audio file
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'audio/m4a',
        name: 'recording.m4a'
      } as any);
      formData.append('model', 'whisper-1');
      formData.append('language', 'es');

      // Send to OpenAI Whisper API
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const data = await response.json();
      if (data.text) {
        setAnswer(prev => prev + ' ' + data.text.trim());
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to process recording. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      Alert.alert('Error', 'Please provide an answer before submitting.');
      return;
    }

    try {
      setIsProcessing(true);

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a friendly and encouraging Spanish teacher. Evaluate this response to "${currentPrompt.prompt}".
                     Structure your feedback exactly like this:

                     What you did well:
                     • [List 1-2 specific things they did well, like good vocabulary usage or correct grammar]

                     Areas for improvement:
                     • [List 1-2 specific suggestions, focusing on the most important improvements needed]

                     Keep each bullet point brief and use natural, encouraging language. Focus on being helpful rather than critical.`
          },
          {
            role: 'user',
            content: answer
          }
        ],
        temperature: 0.7,
        max_tokens: 250
      });

      if (completion.choices[0]?.message?.content) {
        router.push({
          pathname: '/feedback/[id]',
          params: {
            id: id as string,
            feedback: completion.choices[0].message.content,
            userAnswer: answer,
          }
        });
      }
    } catch (error: any) {
      console.error('Failed to get feedback:', error?.message || error);
      Alert.alert('Error', 'Failed to get feedback. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextQuestion = () => {
    // Reset states
    setAnswer('');
    setShowHint(false);
    setIsRecording(false);
    setIsSpeaking(false);
    
    // Move to next prompt or cycle back to first
    setCurrentPromptIndex((prev) => 
      (prev + 1) % topicContent.prompts.length
    );
  };

  if (!topicContent) {
    return (
      <View style={styles.container}>
        <Text>Topic not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>{topicContent.title}</Text>

      <View style={styles.flashcard}>
        <View style={[styles.promptContainer, showHint && styles.promptContainerWithHint]}>
          <Text style={styles.prompt}>{currentPrompt.prompt}</Text>
          <View style={styles.iconContainer}>
            {currentPrompt.hint && (
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setShowHint(!showHint)}
              >
                <Ionicons 
                  name={showHint ? "bulb" : "bulb-outline"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={speakPrompt}
            >
              <Ionicons 
                name={isSpeaking ? "volume-mute" : "volume-high"} 
                size={24} 
                color="#333" 
              />
            </TouchableOpacity>
          </View>
        </View>
        {showHint && currentPrompt.hint && (
          <Text style={styles.hint}>{currentPrompt.hint}</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Type your answer here..."
          value={answer}
          onChangeText={setAnswer}
        />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.button, 
              styles.recordButton,
              isProcessing && styles.disabledButton
            ]}
            onPress={toggleRecording}
            disabled={isProcessing}
          >
            <Ionicons 
              name={isRecording ? "stop-circle" : "mic"} 
              size={24} 
              color="white" 
            />
            <Text style={styles.buttonText}>
              {isRecording ? 'Stop Recording' : 'Record Answer'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleNextQuestion}
        >
          <Text style={styles.skipButtonText}>Skip to Next Question</Text>
          <Ionicons name="arrow-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  flashcard: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  promptContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  promptContainerWithHint: {
    marginBottom: 12,
  },
  prompt: {
    flex: 1,
    fontSize: 20,
    color: '#333',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  hint: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  inputContainer: {
    flex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  recordButton: {
    backgroundColor: '#666',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 