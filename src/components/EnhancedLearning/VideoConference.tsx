import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Peer, { Instance, SignalData } from 'simple-peer';
import { io, Socket } from 'socket.io-client';

interface Participant {
  id: string;
  name: string;
  stream: MediaStream | null;
  peer: Instance | null;
}

const VideoConference: React.FC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [roomId, setRoomId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<{ [key: string]: Instance }>({});
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const userIdRef = useRef<string>(`user-${Math.random().toString(36).substr(2, 9)}`);

  const initializeLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Failed to access camera and microphone');
      return null;
    }
  };

  const createPeer = (userId: string, stream: MediaStream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    });

    peer.on('signal', (signal: SignalData) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('offer', {
          roomId,
          userId: userIdRef.current,
          targetUserId: userId,
          signal
        });
      }
    });

    peer.on('stream', (remoteStream: MediaStream) => {
      setParticipants(prev => prev.map(p => 
        p.id === userId ? { ...p, stream: remoteStream } : p
      ));
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      setError('Connection error occurred');
    });

    return peer;
  };

  const handleUserJoined = async (userId: string) => {
    if (!localStream) {
      const stream = await initializeLocalStream();
      if (!stream) return;
    }

    // Add the new participant to the list
    setParticipants(prev => [...prev, {
      id: userId,
      name: `User${Math.floor(Math.random() * 1000)}`,
      stream: null,
      peer: null
    }]);

    const peer = createPeer(userId, localStream!);
    peersRef.current[userId] = peer;
  };

  const handleOffer = async (offer: SignalData, userId: string) => {
    if (!localStream) {
      const stream = await initializeLocalStream();
      if (!stream) return;
    }

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: isScreenSharing ? screenStreamRef.current! : localStream!
    });

    peer.on('signal', (signal: SignalData) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('answer', {
          roomId,
          userId: userIdRef.current,
          targetUserId: userId,
          signal
        });
      }
    });

    peer.on('stream', (remoteStream: MediaStream) => {
      setParticipants(prev => prev.map(p => 
        p.id === userId ? { ...p, stream: remoteStream } : p
      ));
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      setError('Connection error occurred');
    });

    await peer.signal(offer);
    peersRef.current[userId] = peer;
  };

  const handleAnswer = (answer: SignalData, userId: string) => {
    const peer = peersRef.current[userId];
    if (peer) {
      peer.signal(answer);
    }
  };

  const handleIceCandidate = (candidate: RTCIceCandidate, userId: string) => {
    const peer = peersRef.current[userId];
    if (peer) {
      peer.signal({
        type: 'candidate',
        candidate
      });
    }
  };

  const handleUserLeft = (userId: string) => {
    const peer = peersRef.current[userId];
    if (peer) {
      peer.destroy();
      delete peersRef.current[userId];
    }
    setParticipants(prev => prev.filter(p => p.id !== userId));
  };

  const endRoom = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('end-room', {
        roomId,
        userId: userIdRef.current
      });
    }

    // Close all peer connections
    Object.values(peersRef.current).forEach(peer => {
      peer.destroy();
    });
    peersRef.current = {};

    // Stop all media tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Close WebSocket connection
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Reset states
    setLocalStream(null);
    setParticipants([]);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setIsHost(false);
    setIsInRoom(false);
    setError('');
  };

  useEffect(() => {
    if (!roomId || !isInRoom) return;

    setIsConnecting(true);
    const socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      query: {
        roomId,
        userId: userIdRef.current
      }
    });
    socketRef.current = socket;

    socket.on('connect', async () => {
      console.log('Connected to signaling server');
      try {
        const stream = await initializeLocalStream();
        if (!stream) {
          setError('Failed to initialize media devices');
          setIsConnecting(false);
          return;
        }

        if (isHost) {
          socket.emit('create-room', {
            roomId,
            userId: userIdRef.current
          });
        } else {
          socket.emit('join-room', {
            roomId,
            userId: userIdRef.current
          });
        }
        setIsConnecting(false);
      } catch (error) {
        console.error('Error initializing connection:', error);
        setError('Failed to initialize connection');
        setIsConnecting(false);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Connection error occurred');
      setIsConnecting(false);
    });

    socket.on('error', (data) => {
      console.error('Server error:', data);
      setError(data.message || 'An error occurred');
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (isInRoom) {
        setError('Connection closed');
      }
      setIsConnecting(false);
    });

    socket.on('room-created', () => {
      console.log('Room created successfully');
    });

    socket.on('room-joined', () => {
      console.log('Joined room successfully');
    });

    socket.on('room-ended', () => {
      endRoom();
    });

    socket.on('user-joined', (data) => {
      handleUserJoined(data.id);
    });

    socket.on('user-left', (data) => {
      handleUserLeft(data.userId);
    });

    socket.on('new-host', (data) => {
      if (data.newHostId === userIdRef.current) {
        setIsHost(true);
      }
    });

    socket.on('offer', (data) => {
      handleOffer(data.signal, data.userId);
    });

    socket.on('answer', (data) => {
      handleAnswer(data.signal, data.userId);
    });

    socket.on('ice-candidate', (data) => {
      handleIceCandidate(data.candidate, data.userId);
    });

    socket.on('existing-participants', (participants) => {
      participants.forEach((participant: any) => {
        handleUserJoined(participant.id);
      });
    });

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [roomId, isInRoom, isHost]);

  const createRoom = async () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }
    setIsHost(true);
    setIsInRoom(true);
  };

  const joinRoom = async () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }
    setIsInRoom(true);
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Get screen stream
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always"
          },
          audio: false
        });
        screenStreamRef.current = screenStream;

        // Update local video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        // Update all peer connections with the new screen stream
        Object.entries(peersRef.current).forEach(([userId, peer]) => {
          const videoTrack = screenStream.getVideoTracks()[0];
          peer.replaceTrack(
            peer.streams[0].getVideoTracks()[0],
            videoTrack,
            peer.streams[0]
          );
        });

        // Handle screen sharing stop
        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };

        setIsScreenSharing(true);
      } else {
        // Stop screen sharing
        screenStreamRef.current?.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;

        // Restore camera stream
        if (localStream) {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }

          // Update all peer connections with the camera stream
          Object.entries(peersRef.current).forEach(([userId, peer]) => {
            const videoTrack = localStream.getVideoTracks()[0];
            peer.replaceTrack(
              peer.streams[0].getVideoTracks()[0],
              videoTrack,
              peer.streams[0]
            );
          });
        }

        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error('Error toggling screen share:', err);
      setError('Failed to share screen');
    }
  };

  const sendMessage = (message: string) => {
    if (!socketRef.current?.connected) {
      setError('Not connected to server');
      return;
    }

    try {
      socketRef.current.emit('send-message', {
        roomId,
        message: {
          id: Date.now(),
          text: message,
          userId: userIdRef.current,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Card className="p-4">
        {!isInRoom ? (
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setRoomId(e.target.value)}
            />
            <Button onClick={createRoom}>Create Room</Button>
            <Button onClick={joinRoom}>Join Room</Button>
          </div>
        ) : (
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Room ID: {roomId}</span>
              {isHost && <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">Host</span>}
            </div>
            <Button variant="destructive" onClick={endRoom}>End Room</Button>
          </div>
        )}
        
        {error && <p className="text-red-500">{error}</p>}
        {isConnecting && <p className="text-blue-500">Connecting...</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Local video */}
          <div className="relative aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full rounded-lg object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              You {isHost && "(Host)"} {isScreenSharing && "(Screen Sharing)"}
            </div>
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <span className="text-white">Camera Off</span>
              </div>
            )}
          </div>

          {/* Remote videos */}
          {participants.map((participant) => (
            <div key={participant.id} className="relative aspect-video">
              <video
                autoPlay
                playsInline
                className="w-full h-full rounded-lg object-cover"
                ref={(video) => {
                  if (video && participant.stream) {
                    video.srcObject = participant.stream;
                  }
                }}
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                {participant.name}
              </div>
              {!participant.stream?.getVideoTracks()[0]?.enabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <span className="text-white">Camera Off</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {isInRoom && (
          <div className="flex justify-center gap-4 mt-4">
            <Button
              variant={isMuted ? "destructive" : "default"}
              onClick={toggleMute}
            >
              {isMuted ? "Unmute" : "Mute"}
            </Button>
            <Button
              variant={isVideoOff ? "destructive" : "default"}
              onClick={toggleVideo}
            >
              {isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
            </Button>
            <Button
              variant={isScreenSharing ? "destructive" : "default"}
              onClick={toggleScreenShare}
            >
              {isScreenSharing ? "Stop Sharing" : "Share Screen"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VideoConference; 