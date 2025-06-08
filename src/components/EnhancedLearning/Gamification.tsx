import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  completed: boolean;
  category: 'Algorithm' | 'Data Structure' | 'Problem Solving';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  total: number;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  points: number;
  rank: number;
  streak: number;
}

const Gamification: React.FC = () => {
  const [challenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Palindrome Checker',
      description: 'Write a function to check if a string is a palindrome',
      difficulty: 'Easy',
      points: 100,
      completed: true,
      category: 'Algorithm'
    },
    {
      id: '2',
      title: 'Binary Search Tree',
      description: 'Implement a binary search tree with insert, delete, and search operations',
      difficulty: 'Medium',
      points: 250,
      completed: false,
      category: 'Data Structure'
    },
    {
      id: '3',
      title: 'Dijkstra\'s Algorithm',
      description: 'Implement Dijkstra\'s shortest path algorithm',
      difficulty: 'Hard',
      points: 500,
      completed: false,
      category: 'Algorithm'
    },
    {
      id: '4',
      title: 'Dynamic Programming',
      description: 'Solve the knapsack problem using dynamic programming',
      difficulty: 'Hard',
      points: 500,
      completed: false,
      category: 'Problem Solving'
    }
  ]);

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Code Warrior',
      description: 'Complete 10 coding challenges',
      icon: '🏆',
      unlocked: true,
      progress: 10,
      total: 10
    },
    {
      id: '2',
      title: 'Algorithm Master',
      description: 'Solve 5 algorithm challenges',
      icon: '🎯',
      unlocked: false,
      progress: 3,
      total: 5
    },
    {
      id: '3',
      title: 'Data Structure Expert',
      description: 'Implement 3 complex data structures',
      icon: '📊',
      unlocked: false,
      progress: 1,
      total: 3
    },
    {
      id: '4',
      title: 'Streak Champion',
      description: 'Maintain a 7-day coding streak',
      icon: '🔥',
      unlocked: false,
      progress: 4,
      total: 7
    }
  ]);

  const [leaderboard] = useState<LeaderboardEntry[]>([
    {
      id: '1',
      name: 'Alice',
      avatar: '👩‍💻',
      points: 1250,
      rank: 1,
      streak: 5
    },
    {
      id: '2',
      name: 'Bob',
      avatar: '👨‍💻',
      points: 1000,
      rank: 2,
      streak: 3
    },
    {
      id: '3',
      name: 'Charlie',
      avatar: '👨‍💻',
      points: 750,
      rank: 3,
      streak: 2
    }
  ]);

  const [selectedTab, setSelectedTab] = useState<'challenges' | 'achievements' | 'leaderboard'>('challenges');

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Coding Games & Challenges</h2>
          <div className="flex gap-2">
            <Button
              variant={selectedTab === 'challenges' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('challenges')}
            >
              Challenges
            </Button>
            <Button
              variant={selectedTab === 'achievements' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('achievements')}
            >
              Achievements
            </Button>
            <Button
              variant={selectedTab === 'leaderboard' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('leaderboard')}
            >
              Leaderboard
            </Button>
          </div>
        </div>

        {selectedTab === 'challenges' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{challenge.title}</h3>
                    <p className="text-sm text-gray-600">{challenge.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {challenge.difficulty}
                  </span>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">{challenge.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{challenge.points} points</span>
                    <Button
                      variant={challenge.completed ? 'outline' : 'default'}
                      size="sm"
                    >
                      {challenge.completed ? 'Completed' : 'Start Challenge'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <div className="mt-2">
                      <Progress
                        value={(achievement.progress / achievement.total) * 100}
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{achievement.progress}/{achievement.total}</span>
                        <span>{achievement.unlocked ? 'Unlocked' : 'In Progress'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedTab === 'leaderboard' && (
          <div className="space-y-4">
            {leaderboard.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{entry.avatar}</span>
                  <div>
                    <h3 className="font-semibold">{entry.name}</h3>
                    <p className="text-sm text-gray-600">Rank #{entry.rank}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-sm text-gray-600">Points</span>
                    <p className="font-semibold">{entry.points}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-sm text-gray-600">Streak</span>
                    <p className="font-semibold">{entry.streak} days</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Gamification; 