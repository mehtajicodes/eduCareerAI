import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  type: 'text' | 'code';
}

interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  isTyping: boolean;
}

const CollaborationSpace: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 60000
    });

    // Set up event listeners
    const setupSocketListeners = () => {
      newSocket.on('connect', () => {
        console.log('Connected to server with ID:', newSocket.id);
        setIsConnected(true);
        
        // Create initial user object
        const initialUser: User = {
          id: newSocket.id || 'unknown',
          name: `User${Math.floor(Math.random() * 1000)}`,
          avatar: '👤',
          status: 'online',
          isTyping: false
        };
        
        console.log('Setting current user:', initialUser);
        setCurrentUser(initialUser);
        newSocket.emit('join-collaboration', {
          roomId: 'collaboration',
          userId: initialUser.id
        });
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
        setCurrentUser(null);
      });

      newSocket.on('user-list', (userList) => {
        console.log('Received user list:', userList);
        setUsers(userList);
      });

      newSocket.on('message', (message) => {
        console.log('Received message:', message);
        if (message && message.id && message.sender && message.content) {
          setMessages(prev => {
            // Check if message already exists
            const messageExists = prev.some((msg: Message) => msg.id === message.id);
            if (!messageExists) {
              return [...prev, message];
            }
            return prev;
          });
          scrollToBottom();
        }
      });

      newSocket.on('existing-messages', (data) => {
        console.log('Received existing messages:', data);
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(prev => {
            // Filter out any duplicate messages
            const newMessages = data.messages.filter(
              (msg: Message) => !prev.some(existing => existing.id === msg.id)
            );
            return [...prev, ...newMessages];
          });
          scrollToBottom();
        }
      });

      newSocket.on('user-typing', (data) => {
        if (data.userId !== currentUser?.id) {
          setUsers(prev => prev.map(user => 
            user.id === data.userId ? { ...user, isTyping: true } : user
          ));
        }
      });

      newSocket.on('user-stopped-typing', (data) => {
        if (data.userId !== currentUser?.id) {
          setUsers(prev => prev.map(user => 
            user.id === data.userId ? { ...user, isTyping: false } : user
          ));
        }
      });

      newSocket.on('user-left', (data) => {
        if (data.userId) {
          setUsers(prev => prev.filter(user => user.id !== data.userId));
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setIsConnected(false);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    };

    setupSocketListeners();
    setSocket(newSocket);

    return () => {
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('user-list');
      newSocket.off('message');
      newSocket.off('existing-messages');
      newSocket.off('user-typing');
      newSocket.off('user-stopped-typing');
      newSocket.off('user-left');
      newSocket.off('connect_error');
      newSocket.off('error');
      newSocket.disconnect();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    if (!socket || !currentUser) {
      console.error('Cannot send message:', { socket: !!socket, currentUser: !!currentUser });
      return;
    }

    try {
      const messageType: 'text' | 'code' = message.includes('```') ? 'code' : 'text';
      const newMessage = {
        roomId: 'collaboration',
        message: {
          id: Date.now().toString(),
          sender: currentUser.name,
          content: message,
          timestamp: new Date().toISOString(),
          type: messageType
        }
      };
      
      console.log('Sending message:', newMessage);
      socket.emit('message', newMessage);
      
      // Only clear the input and typing state
      setMessage('');
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    if (!socket || !currentUser) return;

    try {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('typing', {
          roomId: 'collaboration',
          userId: currentUser.id
        });
      }

      if (typingTimeout) clearTimeout(typingTimeout);
      
      const timeout = setTimeout(() => {
        setIsTyping(false);
        socket.emit('stopped-typing', {
          roomId: 'collaboration',
          userId: currentUser.id
        });
      }, 2000);
      
      setTypingTimeout(timeout);
    } catch (error) {
      console.error('Error handling typing:', error);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Collaboration Space</h2>
          <div className="flex items-center gap-2">
            {users.map(user => (
              <div 
                key={user.id} 
                className={`flex items-center gap-1 cursor-pointer p-2 rounded-lg ${
                  selectedUser?.id === user.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <span className="text-xl">{user.avatar}</span>
                <div className="flex flex-col">
                  <span className={`text-sm ${user.status === 'online' ? 'text-green-500' : 'text-gray-500'}`}>
                    {user.name}
                  </span>
                  {user.isTyping && (
                    <span className="text-xs text-gray-500">typing...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 h-[500px]">
          {/* Chat Messages */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.sender === currentUser?.name ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{msg.sender}</span>
                    <span className="text-xs text-gray-500">{msg.timestamp}</span>
                  </div>
                  {msg.type === 'code' ? (
                    <pre className="mt-1 p-2 bg-gray-100 rounded-lg whitespace-pre-wrap font-mono text-sm">
                      {msg.content}
                    </pre>
                  ) : (
                    <p className="mt-1 p-2 bg-white rounded-lg max-w-[80%]">
                      {msg.content}
                    </p>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="w-1/2 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Shared Code Editor</h3>
            <div className="h-full bg-white rounded-lg p-4 font-mono text-sm">
              <pre className="whitespace-pre-wrap">
{`def bubble_sort_optimized(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr

# Test the function
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = bubble_sort_optimized(numbers)
print("Sorted array:", sorted_numbers)`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CollaborationSpace; 