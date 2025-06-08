import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface CodeReviewProps {
  code?: string;
}

const CodeReview: React.FC<CodeReviewProps> = ({ code: initialCode = '' }) => {
  const [code, setCode] = useState(initialCode);
  const [review, setReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    const fetchAvailableModels = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('API key is not configured');
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        if (!response.ok) {
          throw new Error('Failed to fetch available models');
        }

        const data = await response.json();
        const models = data.models?.map((model: any) => model.name) || [];
        setAvailableModels(models);
      } catch (err) {
        console.error('Error fetching models:', err);
      }
    };

    fetchAvailableModels();
  }, []);

  const analyzeCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to analyze');
      return;
    }

    setIsLoading(true);
    setError('');
    setReview('');

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API key is not configured. Please check your environment variables.');
      }

      // Use gemini-1.5-flash model
      const modelName = 'models/gemini-1.5-flash';

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Please review the following code and provide detailed feedback on:
1. Code quality and best practices
2. Potential bugs or issues
3. Performance considerations
4. Security concerns
5. Suggestions for improvement

Code to review:
\`\`\`
${code}
\`\`\`

Please provide a comprehensive review in a structured format.`
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to analyze code');
      }

      const data = await response.json();
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }

      const reviewText = data.candidates[0].content.parts[0].text;
      setReview(reviewText);
    } catch (err) {
      console.error('Code analysis error:', err);
      setError(err instanceof Error ? err.message : 'Error analyzing code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Code Review</h2>
          <p className="text-gray-600">
            Get AI-powered code review and suggestions for improvement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Code</h3>
            <Textarea
              value={code}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="min-h-[300px] font-mono"
            />
            <Button 
              onClick={analyzeCode} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Code'
              )}
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Code Review</h3>
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : review ? (
              <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap font-mono text-sm">
                {review}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg text-gray-500">
                Code review will appear here...
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CodeReview; 