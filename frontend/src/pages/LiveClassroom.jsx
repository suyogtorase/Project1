import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, Users } from 'lucide-react';
import { toast } from 'react-toastify';

// ICE Servers for NAT Traversal
const iceServers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ]
};

const LiveClassroom = () => {
    const { id: classroomId } = useParams();
    const navigate = useNavigate();
    const { socket, userData } = useContext(AppContent);

    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({});
    
    // UI state
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [participants, setParticipants] = useState(1);

    const localVideoRef = useRef(null);
    const peersRef = useRef({}); // Store RTCPeerConnections
    const screenStreamRef = useRef(null);
    const localStreamRef = useRef(null); // Keep a ref to avoid stale closures

    useEffect(() => {
        if (!socket || !userData) return;

        const initWebRTC = async () => {
            let stream = null;
            try {
                // 1. Try to get Local Media (Camera/Mic)
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            } catch (err) {
                console.warn("Could not get both video and audio. Trying just audio...", err);
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                    toast.warning("Camera unavailable, joined with audio only.");
                } catch (err2) {
                    console.warn("Could not get audio either. Joining as view-only...", err2);
                    toast.warning("Camera and Microphone unavailable, joined as view-only.");
                }
            }

            try {
                if (stream) {
                    setLocalStream(stream);
                    localStreamRef.current = stream;
                    
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream;
                    }
                }

                // 2. Join the Live Class Room via Socket
                socket.emit("join-live-class", classroomId);

                // 3. Socket Event Listeners for WebRTC Signaling
                socket.on("user-joined", handleUserJoined);
                socket.on("webrtc-offer", handleReceiveOffer);
                socket.on("webrtc-answer", handleReceiveAnswer);
                socket.on("webrtc-ice-candidate", handleReceiveICECandidate);
                socket.on("user-left", handleUserLeft);

            } catch (error) {
                console.error("Error accessing media devices.", error);
                toast.error("Could not access camera or microphone.");
            }
        };

        initWebRTC();

        return () => {
            // Cleanup on unmount
            socket.emit("leave-live-class", classroomId);
            socket.off("user-joined", handleUserJoined);
            socket.off("webrtc-offer", handleReceiveOffer);
            socket.off("webrtc-answer", handleReceiveAnswer);
            socket.off("webrtc-ice-candidate", handleReceiveICECandidate);
            socket.off("user-left", handleUserLeft);
            
            // Stop all tracks
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach(track => track.stop());
            }

            // Close all peer connections
            Object.values(peersRef.current).forEach(peer => peer.close());
        };
    }, [socket, userData, classroomId]);

    // ---------------------------------------------------------------------------
    // WebRTC Signaling Handlers
    // ---------------------------------------------------------------------------

    const createPeerConnection = (targetSocketId) => {
        const peerConnection = new RTCPeerConnection(iceServers);

        // Add local tracks to the connection
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStreamRef.current);
            });
        }

        // Handle receiving remote tracks
        peerConnection.ontrack = (event) => {
            setRemoteStreams(prev => ({
                ...prev,
                [targetSocketId]: event.streams[0]
            }));
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("webrtc-ice-candidate", {
                    targetSocketId,
                    candidate: event.candidate
                });
            }
        };

        peersRef.current[targetSocketId] = peerConnection;
        setParticipants(Object.keys(peersRef.current).length + 1);
        return peerConnection;
    };

    const handleUserJoined = async ({ userId, socketId }) => {
        console.log("User joined, creating offer for:", socketId);
        toast.info("A user joined the class");
        
        const peerConnection = createPeerConnection(socketId);
        
        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            
            socket.emit("webrtc-offer", {
                targetSocketId: socketId,
                offer
            });
        } catch (error) {
            console.error("Error creating offer", error);
        }
    };

    const handleReceiveOffer = async ({ senderSocketId, offer, senderUserId }) => {
        console.log("Received offer from:", senderSocketId);
        const peerConnection = createPeerConnection(senderSocketId);

        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            socket.emit("webrtc-answer", {
                targetSocketId: senderSocketId,
                answer
            });
        } catch (error) {
            console.error("Error handling offer", error);
        }
    };

    const handleReceiveAnswer = async ({ senderSocketId, answer }) => {
        console.log("Received answer from:", senderSocketId);
        const peerConnection = peersRef.current[senderSocketId];
        if (peerConnection) {
            try {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            } catch (error) {
                console.error("Error handling answer", error);
            }
        }
    };

    const handleReceiveICECandidate = async ({ senderSocketId, candidate }) => {
        const peerConnection = peersRef.current[senderSocketId];
        if (peerConnection) {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error("Error adding ICE candidate", error);
            }
        }
    };

    const handleUserLeft = ({ socketId }) => {
        if (peersRef.current[socketId]) {
            peersRef.current[socketId].close();
            delete peersRef.current[socketId];
            
            setRemoteStreams(prev => {
                const updated = { ...prev };
                delete updated[socketId];
                return updated;
            });
            
            setParticipants(Object.keys(peersRef.current).length + 1);
            toast.info("A user left the class");
        }
    };

    // ---------------------------------------------------------------------------
    // Controls
    // ---------------------------------------------------------------------------

    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    const toggleScreenShare = async () => {
        if (isScreenSharing) {
            // Stop screen sharing and revert to webcam
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            
            // Replace track in all peer connections
            Object.values(peersRef.current).forEach(peer => {
                const sender = peer.getSenders().find(s => s.track.kind === 'video');
                if (sender && videoTrack) {
                    sender.replaceTrack(videoTrack);
                }
            });
            
            localVideoRef.current.srcObject = localStreamRef.current;
            setIsScreenSharing(false);
            
        } else {
            // Start screen sharing
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStreamRef.current = screenStream;
                const screenTrack = screenStream.getVideoTracks()[0];
                
                // When user clicks 'Stop sharing' on browser UI
                screenTrack.onended = () => {
                    toggleScreenShare(); // revert to webcam
                };

                // Replace track in all peer connections
                Object.values(peersRef.current).forEach(peer => {
                    const sender = peer.getSenders().find(s => s.track.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(screenTrack);
                    }
                });

                localVideoRef.current.srcObject = screenStream;
                setIsScreenSharing(true);
            } catch (error) {
                console.error("Error sharing screen", error);
            }
        }
    };

    const handleLeave = () => {
        navigate(`/classroom/${classroomId}`);
    };

    // ---------------------------------------------------------------------------
    // Render Helpers
    // ---------------------------------------------------------------------------

    // Video Component for Remote Streams
    const RemoteVideo = ({ stream, id }) => {
        const videoRef = useRef(null);
        useEffect(() => {
            if (videoRef.current && stream) {
                videoRef.current.srcObject = stream;
            }
        }, [stream]);

        return (
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video shadow-lg border border-gray-800 flex items-center justify-center">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    Participant {id.substring(0, 4)}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header */}
            <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                    <h1 className="font-semibold text-lg">Live Classroom</h1>
                </div>
                <div className="flex items-center gap-2 text-sm bg-gray-800 px-4 py-1.5 rounded-full">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{participants} {participants === 1 ? 'Participant' : 'Participants'}</span>
                </div>
            </div>

            {/* Video Grid */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Local Video */}
                    <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video shadow-lg border-2 border-blue-500/30 flex items-center justify-center">
                        <video 
                            ref={localVideoRef} 
                            autoPlay 
                            playsInline 
                            muted // Mute local video to prevent echo
                            className={`w-full h-full object-cover ${!isScreenSharing ? 'scale-x-[-1]' : ''}`} // mirror webcam, but not screen
                        />
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
                            You {isScreenSharing && '(Screen)'}
                        </div>
                    </div>

                    {/* Remote Videos */}
                    {Object.entries(remoteStreams).map(([id, stream]) => (
                        <RemoteVideo key={id} stream={stream} id={id} />
                    ))}
                </div>
            </div>

            {/* Controls Bar */}
            <div className="h-24 bg-gray-900 border-t border-gray-800 flex items-center justify-center gap-4 px-6">
                <button 
                    onClick={toggleAudio}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                
                <button 
                    onClick={toggleVideo}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                >
                    {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
                
                <button 
                    onClick={toggleScreenShare}
                    className={`px-6 h-12 rounded-full flex items-center justify-center gap-2 font-medium transition-all ${isScreenSharing ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                >
                    <MonitorUp className="w-5 h-5" />
                    <span className="hidden sm:inline">{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
                </button>

                <div className="w-px h-8 bg-gray-700 mx-2"></div>

                <button 
                    onClick={handleLeave}
                    className="px-6 h-12 rounded-full flex items-center justify-center gap-2 font-medium bg-red-600 hover:bg-red-700 text-white transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                >
                    <PhoneOff className="w-5 h-5" />
                    <span className="hidden sm:inline">Leave Class</span>
                </button>
            </div>
        </div>
    );
};

export default LiveClassroom;
