import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Play, Pause, RotateCcw, Download, Music, Volume2, Settings } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const AdvancedVideoPlayer = ({ sketches, narrationText, backgroundMusic }) => {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const backgroundMusicRef = useRef(null);
  const videoRecorderRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  
  // Animation settings
  const [settings, setSettings] = useState({
    speed: 5,
    thickness: 1.5,
    threshold: 50,
    color: '#2d3748',
    frameDelay: 3000, // 3 seconds per image
    backgroundVolume: 0.3,
    narrationVolume: 0.8
  });

  // Animation state
  const [edgePoints, setEdgePoints] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [animationIndex, setAnimationIndex] = useState(0);
  const animationRef = useRef(null);
  
  const { toast } = useToast();

  // Edge detection and sketch animation (from provided JavaScript)
  const processEdgeDetection = useCallback(async (image, threshold = 50) => {
    return new Promise((resolve) => {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      const maxWidth = 800;
      const maxHeight = 600;
      let { width, height } = image;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      tempCanvas.width = width;
      tempCanvas.height = height;
      tempCtx.drawImage(image, 0, 0, width, height);
      
      const imageData = tempCtx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const detectedEdges = [];
      
      // Edge detection algorithm
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;
          
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          const rightGray = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
          const bottomGray = (data[idx + width * 4] + data[idx + width * 4 + 1] + data[idx + width * 4 + 2]) / 3;
          
          const gradient = Math.abs(gray - rightGray) + Math.abs(gray - bottomGray);
          
          if (gradient > threshold) {
            detectedEdges.push({ x, y });
          }
        }
      }
      
      // Sort points for natural drawing path
      const sortedPoints = [];
      const remaining = [...detectedEdges];
      
      if (remaining.length > 0) {
        let current = remaining.shift();
        sortedPoints.push(current);
        
        while (remaining.length > 0) {
          let minDist = Infinity;
          let nextIndex = 0;
          
          for (let i = 0; i < remaining.length; i++) {
            const dist = Math.sqrt(
              Math.pow(current.x - remaining[i].x, 2) + 
              Math.pow(current.y - remaining[i].y, 2)
            );
            if (dist < minDist) {
              minDist = dist;
              nextIndex = i;
            }
          }
          
          current = remaining.splice(nextIndex, 1)[0];
          sortedPoints.push(current);
        }
      }
      
      resolve({ edges: sortedPoints, dimensions: { width, height } });
    });
  }, []);

  // Setup canvas for current image
  const setupCanvas = useCallback((dimensions) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
  }, []);

  // Draw path on canvas
  const drawPath = useCallback((ctx, path, color, thickness) => {
    if (path.length < 2) return;
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
  }, []);

  // Animate single image sketch
  const animateSketch = useCallback(() => {
    if (!canvasRef.current || edgePoints.length === 0) return;
    
    const ctx = canvasRef.current.getContext('2d');
    const pointsPerFrame = settings.speed;
    
    let pathDrawn = false;
    
    for (let i = 0; i < pointsPerFrame && animationIndex < edgePoints.length; i++) {
      const point = edgePoints[animationIndex];
      
      if (currentPath.length === 0) {
        setCurrentPath([point]);
      } else {
        const lastPoint = currentPath[currentPath.length - 1];
        const distance = Math.sqrt(
          Math.pow(point.x - lastPoint.x, 2) + 
          Math.pow(point.y - lastPoint.y, 2)
        );
        
        if (distance < 10) {
          setCurrentPath(prev => [...prev, point]);
        } else {
          drawPath(ctx, currentPath, settings.color, settings.thickness);
          setCurrentPath([point]);
          pathDrawn = true;
        }
      }
      
      setAnimationIndex(prev => prev + 1);
    }
    
    // Draw current path
    if (currentPath.length > 0) {
      drawPath(ctx, currentPath, settings.color, settings.thickness);
    }
    
    // Update progress
    const imageProgress = (animationIndex / edgePoints.length) * 100;
    setAnimationProgress(imageProgress);
    
    const totalProgress = ((currentImageIndex * 100) + imageProgress) / sketches.length;
    setOverallProgress(totalProgress);
    
    if (animationIndex >= edgePoints.length) {
      // Move to next image
      setTimeout(() => {
        if (currentImageIndex < sketches.length - 1) {
          setCurrentImageIndex(prev => prev + 1);
          setAnimationIndex(0);
          setCurrentPath([]);
          setAnimationProgress(0);
        } else {
          completeAnimation();
        }
      }, 500);
    } else if (isPlaying) {
      animationRef.current = requestAnimationFrame(animateSketch);
    }
  }, [edgePoints, animationIndex, currentPath, isPlaying, settings, currentImageIndex, sketches.length, drawPath]);

  // Process current image for edge detection
  useEffect(() => {
    if (sketches.length > 0 && currentImageIndex < sketches.length) {
      const currentSketch = sketches[currentImageIndex];
      const img = new Image();
      img.onload = async () => {
        const result = await processEdgeDetection(img, settings.threshold);
        setEdgePoints(result.edges);
        setupCanvas(result.dimensions);
      };
      img.src = currentSketch.original.url;
    }
  }, [currentImageIndex, sketches, settings.threshold, processEdgeDetection, setupCanvas]);

  // Audio context management
  const audioContextRef = useRef(null);
  const ttsSourceRef = useRef(null);
  const musicSourceRef = useRef(null);
  const recordedChunks = useRef([]);

  // Initialize audio context safely
  const initializeAudioContext = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    audioContextRef.current = new AudioContext();
    return audioContextRef.current;
  }, []);

  // Start video recording with properly managed audio
  const startRecording = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
      // Clear any existing chunks
      recordedChunks.current = [];
      
      // Create canvas stream
      const canvasStream = canvas.captureStream(30);
      let finalStream = canvasStream;
      
      // Handle audio if available
      if (narrationText || backgroundMusic) {
        const audioContext = initializeAudioContext();
        await audioContext.resume();
        
        const destination = audioContext.createMediaStreamDestination();
        let hasAudioSources = false;
        
        // Add TTS audio if available
        if (audioRef.current && narrationText) {
          try {
            // Ensure audio element is not already connected
            if (ttsSourceRef.current) {
              ttsSourceRef.current.disconnect();
            }
            
            ttsSourceRef.current = audioContext.createMediaElementSource(audioRef.current);
            const ttsGain = audioContext.createGain();
            ttsGain.gain.value = settings.narrationVolume;
            
            ttsSourceRef.current.connect(ttsGain).connect(destination);
            hasAudioSources = true;
          } catch (error) {
            console.warn('TTS audio source creation failed:', error);
          }
        }
        
        // Add background music if available
        if (backgroundMusicRef.current && backgroundMusic) {
          try {
            // Ensure music element is not already connected
            if (musicSourceRef.current) {
              musicSourceRef.current.disconnect();
            }
            
            musicSourceRef.current = audioContext.createMediaElementSource(backgroundMusicRef.current);
            const musicGain = audioContext.createGain();
            musicGain.gain.value = settings.backgroundVolume;
            
            musicSourceRef.current.connect(musicGain).connect(destination);
            hasAudioSources = true;
          } catch (error) {
            console.warn('Background music source creation failed:', error);
          }
        }
        
        // Combine video and audio streams if we have audio
        if (hasAudioSources) {
          const audioTrack = destination.stream.getAudioTracks()[0];
          if (audioTrack) {
            finalStream = new MediaStream([
              ...canvasStream.getVideoTracks(),
              audioTrack
            ]);
          }
        }
      }
      
      // Setup recorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      
      const recorder = new MediaRecorder(finalStream, {
        mimeType: mimeType,
        videoBitsPerSecond: 2500000 // 2.5 Mbps for good quality
      });
      
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        handleRecordingComplete();
      };
      
      recorder.onerror = (event) => {
        console.error('Recording error:', event);
        setIsRecording(false);
        toast({
          title: "Recording Error",
          description: "Failed to record video. Please try again.",
          variant: "destructive"
        });
      };
      
      videoRecorderRef.current = recorder;
      recorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      toast({
        title: "Recording Failed", 
        description: "Could not initialize video recording.",
        variant: "destructive"
      });
    }
  }, [settings, narrationText, backgroundMusic, initializeAudioContext, toast]);

  // Handle recording completion and download
  const handleRecordingComplete = useCallback(() => {
    if (recordedChunks.current.length === 0) {
      toast({
        title: "Recording Error",
        description: "No video data was recorded.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const blob = new Blob(recordedChunks.current, { 
        type: 'video/webm' 
      });
      
      // Create download URL
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `sketch-video-${timestamp}.webm`;
      
      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      toast({
        title: "Video Downloaded!",
        description: `Saved as ${filename}`,
      });
      
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Error",
        description: "Failed to save video file.",
        variant: "destructive"
      });
    } finally {
      setIsRecording(false);
      recordedChunks.current = [];
    }
  }, [toast]);

  // Start complete animation with audio
  const startAnimation = useCallback(async () => {
    try {
      setIsPlaying(true);
      setCurrentImageIndex(0);
      setAnimationIndex(0);
      setCurrentPath([]);
      setAnimationProgress(0);
      setOverallProgress(0);
      
      // Start recording first (before audio to avoid context conflicts)
      await startRecording();
      
      // Small delay to ensure recording is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Start background music
      if (backgroundMusicRef.current && backgroundMusic) {
        try {
          backgroundMusicRef.current.volume = settings.backgroundVolume;
          backgroundMusicRef.current.currentTime = 0;
          await backgroundMusicRef.current.play();
        } catch (error) {
          console.warn('Background music play failed:', error);
        }
      }
      
      // Start narration
      if (audioRef.current && narrationText) {
        try {
          audioRef.current.volume = settings.narrationVolume;
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
        } catch (error) {
          console.warn('Narration play failed:', error);
        }
      }
      
      // Start sketch animation
      animationRef.current = requestAnimationFrame(animateSketch);
      
      toast({
        title: "Animation Started",
        description: "Recording sketch video with synchronized audio..."
      });
      
    } catch (error) {
      console.error('Failed to start animation:', error);
      setIsPlaying(false);
      toast({
        title: "Start Failed",
        description: "Could not start animation. Please try again.",
        variant: "destructive"
      });
    }
  }, [narrationText, settings, startRecording, animateSketch, backgroundMusic, toast]);

  const pauseAnimation = useCallback(() => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (audioRef.current) audioRef.current.pause();
    if (backgroundMusicRef.current) backgroundMusicRef.current.pause();
  }, []);

  const resetAnimation = useCallback(() => {
    setIsPlaying(false);
    setCurrentImageIndex(0);
    setAnimationIndex(0);
    setCurrentPath([]);
    setAnimationProgress(0);
    setOverallProgress(0);
    
    // Stop animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Stop and reset audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
    }
    
    // Stop recording and cleanup
    if (videoRecorderRef.current && isRecording) {
      try {
        videoRecorderRef.current.stop();
      } catch (error) {
        console.warn('Error stopping recorder:', error);
      }
      setIsRecording(false);
    }
    
    // Cleanup audio context
    if (ttsSourceRef.current) {
      try {
        ttsSourceRef.current.disconnect();
      } catch (error) {
        console.warn('Error disconnecting TTS source:', error);
      }
      ttsSourceRef.current = null;
    }
    
    if (musicSourceRef.current) {
      try {
        musicSourceRef.current.disconnect();
      } catch (error) {
        console.warn('Error disconnecting music source:', error);
      }
      musicSourceRef.current = null;
    }
    
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (error) {
        console.warn('Error closing audio context:', error);
      }
      audioContextRef.current = null;
    }
    
    // Clear recorded chunks
    recordedChunks.current = [];
    
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [isRecording]);

  const completeAnimation = useCallback(() => {
    setIsPlaying(false);
    setOverallProgress(100);
    
    // Stop recording and trigger download
    if (videoRecorderRef.current && isRecording) {
      try {
        videoRecorderRef.current.stop();
        // handleRecordingComplete will be called automatically via onstop event
      } catch (error) {
        console.error('Error stopping recorder:', error);
        setIsRecording(false);
        toast({
          title: "Recording Error",
          description: "Failed to complete video recording.",
          variant: "destructive"
        });
      }
    } else {
      // If not recording, show completion message
      toast({
        title: "Animation Complete!",
        description: "Sketch animation finished successfully"
      });
    }
  }, [isRecording, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup audio context and connections
      if (ttsSourceRef.current) {
        try { ttsSourceRef.current.disconnect(); } catch (e) {}
      }
      if (musicSourceRef.current) {
        try { musicSourceRef.current.disconnect(); } catch (e) {}
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  // Create TTS audio URL
  const ttsUrl = narrationText ? 
    `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(narrationText)}` : 
    null;

  return (
    <div className="space-y-6">
      {/* Hidden Audio Elements */}
      {ttsUrl && (
        <audio 
          ref={audioRef} 
          preload="auto" 
          crossOrigin="anonymous"
          onError={(e) => console.warn('TTS audio error:', e)}
        >
          <source src={ttsUrl} type="audio/mpeg" />
        </audio>
      )}
      
      {backgroundMusic && (
        <audio 
          ref={backgroundMusicRef} 
          preload="auto" 
          loop 
          crossOrigin="anonymous"
          onError={(e) => console.warn('Background music error:', e)}
        >
          <source src={backgroundMusic} type="audio/mpeg" />
        </audio>
      )}

      {/* Canvas Container */}
      <Card className="p-0 overflow-hidden bg-white border-slate-200">
        <div className="relative bg-gradient-to-br from-slate-50 to-stone-100 p-6">
          <canvas
            ref={canvasRef}
            className="w-full max-w-full rounded-lg shadow-lg bg-white border border-slate-200"
            style={{ maxHeight: '500px', objectFit: 'contain' }}
          />
          
          {/* Overlay Info */}
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            Image {currentImageIndex + 1} of {sketches.length}
          </div>
          
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {Math.round(animationProgress)}% Complete
          </div>
          
          {isRecording && (
            <div className="absolute bottom-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Recording</span>
            </div>
          )}
        </div>
      </Card>

      {/* Advanced Controls */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
        <div className="space-y-6">
          {/* Main Playback Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={resetAnimation}
              className="border-slate-300 hover:bg-slate-50"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={isPlaying ? pauseAnimation : startAnimation}
              disabled={sketches.length === 0 || !narrationText}
              size="lg"
              className="bg-slate-800 hover:bg-slate-700 text-white px-8"
            >
              {isPlaying ? (
                <><Pause className="w-5 h-5 mr-2" /> Pause</>
              ) : (
                <><Play className="w-5 h-5 mr-2" /> Start Full Animation</>
              )}
            </Button>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Overall Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-slate-700 to-slate-900 h-3 rounded-full transition-all duration-200"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Animation Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Sketch Speed</span>
                <span>{settings.speed}x</span>
              </div>
              <Slider
                value={[settings.speed]}
                onValueChange={(value) => setSettings(prev => ({ ...prev, speed: value[0] }))}
                max={10}
                min={1}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Line Thickness</span>
                <span>{settings.thickness}</span>
              </div>
              <Slider
                value={[settings.thickness]}
                onValueChange={(value) => setSettings(prev => ({ ...prev, thickness: value[0] }))}
                max={3}
                min={0.5}
                step={0.1}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Edge Sensitivity</span>
                <span>{settings.threshold}</span>
              </div>
              <Slider
                value={[settings.threshold]}
                onValueChange={(value) => setSettings(prev => ({ ...prev, threshold: value[0] }))}
                max={100}
                min={10}
                step={5}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-slate-600">Stroke Color</label>
              <input
                type="color"
                value={settings.color}
                onChange={(e) => setSettings(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-9 border border-slate-300 rounded-md"
              />
            </div>
          </div>

          {/* Audio Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Volume2 className="w-4 h-4" />
                <span>Narration Volume</span>
                <span>{Math.round(settings.narrationVolume * 100)}%</span>
              </div>
              <Slider
                value={[settings.narrationVolume]}
                onValueChange={(value) => setSettings(prev => ({ ...prev, narrationVolume: value[0] }))}
                max={1}
                min={0}
                step={0.1}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Music className="w-4 h-4" />
                <span>Background Music</span>
                <span>{Math.round(settings.backgroundVolume * 100)}%</span>
              </div>
              <Slider
                value={[settings.backgroundVolume]}
                onValueChange={(value) => setSettings(prev => ({ ...prev, backgroundVolume: value[0] }))}
                max={1}
                min={0}
                step={0.1}
              />
            </div>
          </div>

          {/* Status Display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <Badge variant="outline" className="w-full justify-center">
                {edgePoints.length} Edge Points
              </Badge>
            </div>
            <div>
              <Badge variant="outline" className="w-full justify-center">
                30 FPS Recording
              </Badge>
            </div>
            <div>
              <Badge variant="outline" className="w-full justify-center">
                {isRecording ? 'Recording...' : 'Ready'}
              </Badge>
            </div>
            <div>
              <Badge variant="outline" className="w-full justify-center">
                WebM Output
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdvancedVideoPlayer;