import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface TopicItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const topics: TopicItem[] = [
  {
    id: 'past-tense',
    title: 'Past Tense',
    description: 'Learn about preterite, perfect, and imperfect tenses in Spanish',
    icon: 'time-outline',
  },
  {
    id: 'object-pronouns',
    title: 'Object Pronouns',
    description: 'Master direct and indirect object pronouns in Spanish',
    icon: 'person-outline',
  },
  {
    id: 'weather-expressions',
    title: 'Weather Expressions',
    description: 'Learn to talk about weather and climate in Spanish',
    icon: 'sunny-outline',
  },
  {
    id: 'useful-connectors',
    title: 'Useful Connectors',
    description: 'Master connecting words and phrases in Spanish',
    icon: 'git-network-outline',
  },
  {
    id: 'irregular-past',
    title: 'Irregular Past Tense',
    description: 'Practice irregular verbs in the past tense',
    icon: 'refresh-outline',
  },
  {
    id: 'future-tense',
    title: 'Future Tense',
    description: 'Learn to talk about future plans and predictions',
    icon: 'arrow-forward-outline',
  },
  {
    id: 'reflexive-verbs',
    title: 'Reflexive Verbs',
    description: 'Master reflexive verbs and daily routines',
    icon: 'repeat-outline',
  },
];

export default function HomeScreen() {
  const handleTopicSelect = (topicId: string) => {
    router.push(`/topic/${topicId}`);
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Antonio</Text>
        <Text style={styles.logoSubtext}>Your Spanish Tutor</Text>
      </View>
      
      <View style={styles.welcomeContainer}>
        <Text style={styles.title}>¡Bienvenidos!</Text>
        <Text style={styles.subtitle}>Choose a topic to start learning</Text>
      </View>
      
      <View style={styles.topicsContainer}>
        {topics.map((topic) => (
          <TouchableOpacity
            key={topic.id}
            style={styles.topicCard}
            onPress={() => handleTopicSelect(topic.id)}
          >
            <View style={styles.topicIconContainer}>
              <Ionicons name={topic.icon} size={24} color="#10B981" />
            </View>
            <View style={styles.topicContent}>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Text style={styles.topicDescription}>{topic.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: Platform.select({
      ios: 100, // Extra padding for iOS tab bar
      android: 80, // Slightly less padding for Android
      default: 16,
    }),
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 32,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: -1,
  },
  logoSubtext: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  welcomeContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  topicsContainer: {
    gap: 16,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  topicIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
