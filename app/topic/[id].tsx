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
      {
        prompt: '¿Dónde estuviste de vacaciones el año pasado?',
        hint: 'Use the preterite tense with location and time expressions',
      },
      {
        prompt: '¿Has visitado algún país extranjero? ¿Cuándo fue?',
        hint: 'Combine present perfect and preterite to talk about past experiences',
      },
      {
        prompt: '¿Qué estabas haciendo cuando te llamé ayer?',
        hint: 'Use the past progressive to describe an ongoing action',
      },
      {
        prompt: '¿Cómo celebraste tu último cumpleaños?',
        hint: 'Use the preterite to describe a completed event',
      },
      {
        prompt: '¿Qué habías estudiado antes de aprender español?',
        hint: 'Use the past perfect to describe actions before another past event',
      },
      {
        prompt: '¿Cuál fue el mejor regalo que has recibido?',
        hint: 'Combine preterite and present perfect to describe past experiences',
      },
      {
        prompt: '¿Qué solías hacer los veranos cuando eras pequeño?',
        hint: 'Use imperfect tense with "solía" to describe habitual past actions',
      }
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
      {
        prompt: '¿Cuándo vas a devolverme el libro?',
        hint: 'Use the indirect object pronoun (me) with a future action',
      },
      {
        prompt: '¿Les has enviado el correo a tus colegas?',
        hint: 'Use indirect object pronouns (les) with present perfect',
      },
      {
        prompt: '¿Te lo puedo prestar mañana?',
        hint: 'Practice using both direct (lo) and indirect (te) object pronouns',
      },
      {
        prompt: '¿Nos puede traer la cuenta, por favor?',
        hint: 'Use indirect object pronouns (nos) in a polite request',
      },
      {
        prompt: '¿Se la vas a comprar a tu hermana?',
        hint: 'Use multiple pronouns (se, la) with a future expression',
      },
      {
        prompt: '¿Quién te lo dijo?',
        hint: 'Use both direct (lo) and indirect (te) pronouns in a question',
      },
      {
        prompt: '¿Por qué no me lo dijiste antes?',
        hint: 'Use both pronouns (me, lo) in a question about the past',
      }
    ],
  },
  'weather-expressions': {
    id: 'weather-expressions',
    title: 'Weather Expressions',
    prompts: [
      {
        prompt: '¿Qué tiempo hace en tu ciudad hoy?',
        hint: 'Use "Hace" and "Estamos a" to describe the weather',
      },
      {
        prompt: '¿Prefieres el clima cálido o frío? ¿Por qué?',
        hint: 'Use weather expressions and explain your preferences',
      },
      {
        prompt: '¿Qué tipo de clima prefieres para ir de vacaciones?',
        hint: 'Describe your ideal vacation weather using weather expressions',
      },
      {
        prompt: '¿Cómo está el clima durante el invierno en tu país?',
        hint: 'Use expressions like "hace frío", "nieva", "llueve"',
      },
      {
        prompt: '¿Qué actividades disfrutas hacer cuando hace buen tiempo?',
        hint: 'Connect activities with weather conditions',
      },
      {
        prompt: '¿Qué tipo de ropa sueles llevar cuando hace mucho viento?',
        hint: 'Use clothing vocabulary and weather expressions',
      },
      {
        prompt: '¿Te gusta que haga sol o prefieres un día nublado?',
        hint: 'Express preferences using weather terms',
      },
      {
        prompt: '¿Cómo está el clima en verano en tu ciudad? ¿Hace mucho calor?',
        hint: 'Describe summer weather using appropriate expressions',
      },
      {
        prompt: '¿Cómo cambia el clima en tu ciudad entre primavera y otoño?',
        hint: 'Compare seasons using weather expressions',
      },
      {
        prompt: '¿Qué harías si estuviera lloviendo ahora mismo?',
        hint: 'Use conditional tense with weather expressions',
      },
    ],
  },
  'useful-connectors': {
    id: 'useful-connectors',
    title: 'Useful Connectors',
    prompts: [
      {
        prompt: 'Según tu opinión, ¿cuál es el mejor sistema educativo?',
        hint: 'Start with "Según mi opinión..." and use connectors to organize your ideas',
      },
      {
        prompt: 'En primer lugar, ¿por qué decidiste aprender español?',
        hint: 'Use sequence connectors like "en primer lugar", "además", "finalmente"',
      },
      {
        prompt: 'Sin embargo, ¿qué desventajas encuentras en trabajar desde casa?',
        hint: 'Use contrasting connectors like "sin embargo", "pero", "aunque"',
      },
      {
        prompt: 'Por último, ¿qué consejo le darías a alguien que está aprendiendo español?',
        hint: 'Use conclusion connectors like "por último", "en conclusión"',
      },
      {
        prompt: 'Desde mi punto de vista, ¿qué es lo más importante para tener una vida equilibrada?',
        hint: 'Use opinion connectors and supporting arguments',
      },
      {
        prompt: 'Para empezar, ¿cómo te sentirías si cambiaras de ciudad?',
        hint: 'Use sequence connectors to organize your thoughts',
      },
      {
        prompt: 'En conclusión, ¿cómo crees que podemos reducir la contaminación?',
        hint: 'Use conclusion connectors to summarize your ideas',
      },
      {
        prompt: 'Por otro lado, ¿qué ventajas encuentras en vivir en una ciudad grande?',
        hint: 'Use contrasting connectors to present different viewpoints',
      },
      {
        prompt: '¿Cómo describirías tu experiencia aprendiendo español hasta ahora?',
        hint: 'Use time connectors and opinion expressions',
      },
      {
        prompt: 'A pesar de todo, ¿seguirías eligiendo el mismo trabajo que tienes hoy?',
        hint: 'Use concessive connectors like "a pesar de", "aunque"',
      },
    ],
  },
  'irregular-past': {
    id: 'irregular-past',
    title: 'Irregular Past Tense Verbs',
    prompts: [
      {
        prompt: '¿Qué hiciste el fin de semana pasado?',
        hint: 'Use "hacer" in the preterite tense',
      },
      {
        prompt: '¿Cómo fue tu experiencia la última vez que tuviste que viajar?',
        hint: 'Use "tener" and "ser" in the preterite tense',
      },
      // ... add remaining irregular past prompts ...
    ],
  },
  'future-tense': {
    id: 'future-tense',
    title: 'Future Tense',
    prompts: [
      {
        prompt: '¿Qué harás el próximo fin de semana?',
        hint: 'Use the future tense to describe your plans',
      },
      {
        prompt: '¿Cómo crees que será el mundo dentro de 50 años?',
        hint: 'Use the future tense to make predictions',
      },
      // ... add remaining future tense prompts ...
    ],
  },
  'reflexive-verbs': {
    id: 'reflexive-verbs',
    title: 'Reflexive Verbs',
    prompts: [
      {
        prompt: '¿A qué hora te despiertas normalmente los fines de semana?',
        hint: 'Use the reflexive verb "despertarse"',
      },
      {
        prompt: '¿Cómo te preparas por la mañana antes de salir de casa?',
        hint: 'Use reflexive verbs like "prepararse", "lavarse", "peinarse"',
      },
      // ... add remaining reflexive verb prompts ...
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
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.error('Failed to setup audio:', error);
      }
    };

    setupAudio();

    // Initialize speech
    const initSpeech = async () => {
      try {
        // Initialize speech without checking availability
        await Speech.stop(); // This will initialize the speech module
      } catch (error) {
        console.error('Failed to initialize speech:', error);
      }
    };

    initSpeech();

    // Cleanup speech when component unmounts
    return () => {
      Speech.stop();
    };
  }, []);

  const speakPrompt = async () => {
    try {
      if (isSpeaking) {
        await Speech.stop();
        setIsSpeaking(false);
        return;
      }

      setIsSpeaking(true);
      
      await Speech.speak(currentPrompt.prompt, {
        language: 'es-ES',
        rate: 0.75,
        pitch: 1.0,
        onDone: () => setIsSpeaking(false),
        onError: (error) => {
          console.error('Speech error:', error);
          setIsSpeaking(false);
          Alert.alert('Error', 'Failed to speak the prompt. Please try again.');
        },
      });
    } catch (error) {
      console.error('Failed to speak:', error);
      setIsSpeaking(false);
      Alert.alert('Error', 'Failed to speak the prompt. Please try again.');
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
    backgroundColor: '#FAFAFA',
    padding: 20,
  },
  backButton: {
    marginTop: 48,
    marginBottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  flashcard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  promptContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  promptContainerWithHint: {
    marginBottom: 16,
  },
  prompt: {
    flex: 1,
    fontSize: 22,
    color: '#1A1A1A',
    lineHeight: 32,
    fontWeight: '500',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    lineHeight: 24,
  },
  inputContainer: {
    flex: 1,
    gap: 16,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordButton: {
    backgroundColor: '#6B7280',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#10B981',
    flex: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 8,
    gap: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  progressDotActive: {
    backgroundColor: '#10B981',
  }
}); 