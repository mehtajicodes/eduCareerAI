import React, { useState } from 'react';
import CodePlayground from './CodePlayground';
import CodeReview from './CodeReview';
import CollaborationSpace from './CollaborationSpace';
import Gamification from './Gamification';
import VideoConference from './VideoConference';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EnhancedLearningDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('playground');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Enhanced Learning Experience</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 gap-2">
          <TabsTrigger value="playground">Code Playground</TabsTrigger>
          <TabsTrigger value="review">Code Review</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="gamification">Gamification</TabsTrigger>
          <TabsTrigger value="video">Video Conference</TabsTrigger>
        </TabsList>

        <TabsContent value="playground">
          <CodePlayground />
        </TabsContent>

        <TabsContent value="review">
          <CodeReview code={`function example() {
  console.log('Hello, World!');
}`} />
        </TabsContent>

        <TabsContent value="collaboration">
          <CollaborationSpace />
        </TabsContent>

        <TabsContent value="gamification">
          <Gamification />
        </TabsContent>

        <TabsContent value="video">
          <VideoConference />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedLearningDashboard; 