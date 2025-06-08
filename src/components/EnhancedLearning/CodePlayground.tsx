import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CodePlaygroundProps {
  initialCode?: string;
}

const CodePlayground: React.FC<CodePlaygroundProps> = ({
  initialCode = '# Write your Python code here\nprint("Hello, World!")',
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');

  const handleEditorChange = (value: string | undefined) => {
    if (value) setCode(value);
  };

  const runCode = async () => {
    setIsRunning(true);
    setError('');
    setOutput('');

    try {
      const result = await simulatePythonExecution(code);
      setOutput(result);
    } catch (error) {
      setError(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const checkPythonSyntax = (pythonCode: string): string | null => {
    // Check for common Python syntax errors
    const lines = pythonCode.split('\n');
    
    // Check for unmatched parentheses, brackets, or braces
    const stack: string[] = [];
    const pairs: { [key: string]: string } = {
      '(': ')',
      '[': ']',
      '{': '}'
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (pairs[char]) {
          stack.push(char);
        } else if (Object.values(pairs).includes(char)) {
          if (stack.length === 0 || pairs[stack.pop()!] !== char) {
            return `SyntaxError: Unmatched ${char} on line ${i + 1}`;
          }
        }
      }
    }
    
    if (stack.length > 0) {
      return `SyntaxError: Unmatched ${stack[stack.length - 1]}`;
    }

    // Check for invalid indentation
    let currentIndent = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') continue;
      
      const indent = lines[i].search(/\S/);
      if (indent % 4 !== 0 && line[0] !== '#') {
        return `IndentationError: Expected an indented block on line ${i + 1}`;
      }
    }

    // Check for invalid syntax in print statements
    const printRegex = /print\s*\([^)]*$/;
    if (printRegex.test(pythonCode)) {
      return 'SyntaxError: Missing closing parenthesis in print statement';
    }

    // Check for invalid function definitions
    const functionRegex = /def\s+\w+\s*\([^)]*$/;
    if (functionRegex.test(pythonCode)) {
      return 'SyntaxError: Missing closing parenthesis in function definition';
    }

    return null;
  };

  const simulatePythonExecution = async (pythonCode: string): Promise<string> => {
    // First check for syntax errors
    const syntaxError = checkPythonSyntax(pythonCode);
    if (syntaxError) {
      throw new Error(syntaxError);
    }

    // If no syntax errors, simulate execution
    return new Promise((resolve) => {
      setTimeout(() => {
        if (pythonCode.includes('print(')) {
          const printStatements = pythonCode.match(/print\((.*?)\)/g) || [];
          const outputs = printStatements.map(statement => {
            const content = statement.match(/print\((.*?)\)/)?.[1] || '';
            return content.replace(/['"]/g, '');
          });
          resolve(outputs.join('\n'));
        } else if (pythonCode.includes('def ')) {
          resolve('Function defined successfully');
        } else if (pythonCode.includes('import ')) {
          resolve('Module imported successfully');
        } else {
          resolve('Code executed successfully');
        }
      }, 1000);
    });
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Python Code Playground</h2>
          <Button onClick={runCode} disabled={isRunning}>
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
        </div>
        
        <div className="h-[400px] border rounded-lg overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="python"
            defaultValue={initialCode}
            theme="vs-dark"
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
            }}
          />
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Output:</h3>
          {error ? (
            <pre className="text-red-600 whitespace-pre-wrap">{error}</pre>
          ) : (
            <pre className="whitespace-pre-wrap bg-white p-4 rounded">
              {output || 'Click "Run Code" to execute your Python code'}
            </pre>
          )}
        </div>

        <div className="text-sm text-gray-500">
          <p>Note: This is a simulation. In a real implementation, the code would be executed on a Python backend server.</p>
        </div>
      </div>
    </Card>
  );
};

export default CodePlayground; 