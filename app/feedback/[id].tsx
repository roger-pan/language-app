import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type FeedbackParams = {
  id: string;
  feedback: string;
  userAnswer: string;
}

export default function FeedbackScreen() {
  const { id, feedback, userAnswer } = useLocalSearchParams<FeedbackParams>();
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>Feedback</Text>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Answer:</Text>
          <Text style={styles.answer}>{userAnswer}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teacher's Feedback:</Text>
          <Text style={styles.feedback}>{feedback}</Text>
        </View>

        <TouchableOpacity 
          style={styles.tryAgainButton}
          onPress={() => router.back()}
        >
          <Text style={styles.tryAgainText}>Try Another Answer</Text>
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  answer: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  feedback: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  tryAgainButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  tryAgainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 