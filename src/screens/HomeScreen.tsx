import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface TopicItem {
  id: string;
  title: string;
  description: string;
}

const topics: TopicItem[] = [
  {
    id: 'past-tense',
    title: 'Past Tense',
    description: 'Learn about preterite, perfect, and imperfect tenses in Spanish',
  },
  {
    id: 'object-pronouns',
    title: 'Object Pronouns',
    description: 'Master direct and indirect object pronouns in Spanish',
  },
];

export const HomeScreen = () => {
  const handleTopicSelect = (topicId: string) => {
    // Navigation will be implemented later
    console.log(`Selected topic: ${topicId}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>¡Bienvenidos!</Text>
      <Text style={styles.subtitle}>Choose a topic to start learning</Text>
      
      <View style={styles.topicsContainer}>
        {topics.map((topic) => (
          <TouchableOpacity
            key={topic.id}
            style={styles.topicCard}
            onPress={() => handleTopicSelect(topic.id)}
          >
            <Text style={styles.topicTitle}>{topic.title}</Text>
            <Text style={styles.topicDescription}>{topic.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  topicsContainer: {
    gap: 16,
  },
  topicCard: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  topicTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  topicDescription: {
    fontSize: 16,
    color: '#666',
  },
}); 