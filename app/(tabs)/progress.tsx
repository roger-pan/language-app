import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Define valid icon names as constants to fix TypeScript errors
const ICONS = {
  TIME: 'time-outline' as keyof typeof Ionicons.glyphMap,
  CHECKMARK: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
  STAR: 'star-outline' as keyof typeof Ionicons.glyphMap,
  TRENDING: 'trending-up-outline' as keyof typeof Ionicons.glyphMap,
  SCHOOL: 'school-outline' as keyof typeof Ionicons.glyphMap,
  BOOK: 'book-outline' as keyof typeof Ionicons.glyphMap,
  CHAT: 'chatbubbles-outline' as keyof typeof Ionicons.glyphMap,
  TROPHY: 'trophy-outline' as keyof typeof Ionicons.glyphMap,
} as const;

interface StatisticProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

const Statistic: React.FC<StatisticProps> = ({ icon, label, value }) => (
  <View style={styles.statisticCard}>
    <View style={styles.statisticIconContainer}>
      <Ionicons name={icon} size={24} color="#10B981" />
    </View>
    <View style={styles.statisticContent}>
      <Text style={styles.statisticValue}>{value}</Text>
      <Text style={styles.statisticLabel}>{label}</Text>
    </View>
  </View>
);

interface AchievementProps {
  title: string;
  description: string;
  progress: number;
  icon: keyof typeof Ionicons.glyphMap;
}

const Achievement: React.FC<AchievementProps> = ({ title, description, progress, icon }) => (
  <View style={styles.achievementCard}>
    <View style={styles.achievementHeader}>
      <View style={styles.achievementIconContainer}>
        <Ionicons name={icon} size={24} color="#10B981" />
      </View>
      <View style={styles.achievementTitleContainer}>
        <Text style={styles.achievementTitle}>{title}</Text>
        <Text style={styles.achievementDescription}>{description}</Text>
      </View>
    </View>
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
    <Text style={styles.progressText}>{progress}% Complete</Text>
  </View>
);

export default function ProgressScreen() {
  const statistics = [
    { icon: ICONS.TIME, label: 'Learning Time', value: '2.5 hours' },
    { icon: ICONS.CHECKMARK, label: 'Topics Completed', value: '3' },
    { icon: ICONS.STAR, label: 'Total Score', value: '850' },
    { icon: ICONS.TRENDING, label: 'Current Streak', value: '5 days' },
  ];

  const achievements = [
    {
      title: 'Grammar Master',
      description: 'Complete all past tense exercises',
      progress: 60,
      icon: ICONS.SCHOOL,
    },
    {
      title: 'Vocabulary Builder',
      description: 'Learn 100 new words',
      progress: 45,
      icon: ICONS.BOOK,
    },
    {
      title: 'Conversation Pro',
      description: 'Complete 20 speaking exercises',
      progress: 30,
      icon: ICONS.CHAT,
    },
  ];

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <View style={styles.iconContainer}>
          <Ionicons name={ICONS.TROPHY} size={32} color="#10B981" />
        </View>
      </View>
      
      <View style={styles.statisticsContainer}>
        {statistics.map((stat, index) => (
          <Statistic key={index} {...stat} />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Achievements</Text>
      <View style={styles.achievementsContainer}>
        {achievements.map((achievement, index) => (
          <Achievement key={index} {...achievement} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 60,
    marginBottom: 24,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0FDF9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statisticsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  statisticCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '47%',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statisticIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statisticContent: {
    gap: 4,
  },
  statisticValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statisticLabel: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  achievementsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementTitleContainer: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
}); 