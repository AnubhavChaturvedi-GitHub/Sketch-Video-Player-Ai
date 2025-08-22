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

  // Start video recording with audio
  const startRecording = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const stream = canvas.captureStream(30);
    
    // Add audio tracks
    if (audioRef.current && backgroundMusicRef.current) {
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();
      
      // TTS audio
      const ttsSource = audioContext.createMediaElementSource(audioRef.current);
      const ttsGain = audioContext.createGain();
      ttsGain.gain.value = settings.narrationVolume;
      
      // Background music
      const musicSource = audioContext.createMediaElementSource(backgroundMusicRef.current);
      const musicGain = audioContext.createGain();
      musicGain.gain.value = settings.backgroundVolume;
      
      // Connect audio graph
      ttsSource.connect(ttsGain).connect(destination);
      musicSource.connect(musicGain).connect(destination);
      
      // Add audio track to video stream
      destination.stream.getAudioTracks().forEach(track => {
        stream.addTrack(track);
      });
    }
    
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    const chunks = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      downloadVideo(url);
    };
    
    videoRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  }, [settings]);

  // Start complete animation with audio
  const startAnimation = useCallback(() => {
    setIsPlaying(true);
    setCurrentImageIndex(0);
    setAnimationIndex(0);
    setCurrentPath([]);
    setAnimationProgress(0);
    setOverallProgress(0);
    
    // Start background music
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = settings.backgroundVolume;
      backgroundMusicRef.current.play();
    }
    
    // Start narration
    if (audioRef.current && narrationText) {
      audioRef.current.volume = settings.narrationVolume;
      audioRef.current.play();
    }
    
    // Start recording
    startRecording();
    
    // Start sketch animation
    animationRef.current = requestAnimationFrame(animateSketch);
  }, [narrationText, settings, startRecording, animateSketch]);

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
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
    }
    
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.currentTime = 0;
      backgroundMusicRef.current.pause();
    }
    
    if (videoRecorderRef.current && isRecording) {
      videoRecorderRef.current.stop();
      setIsRecording(false);
    }
    
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
    
    if (videoRecorderRef.current && isRecording) {
      videoRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    toast({
      title: "Animation Complete!",
      description: "Your sketch video with synchronized audio is ready for download"
    });
  }, [isRecording, toast]);

  const downloadVideo = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `sketch-video-${Date.now()}.webm`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Create TTS audio URL
  const ttsUrl = narrationText ? 
    `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(narrationText)}` : 
    null;

  return (
    <div className="space-y-6">
      {/* Hidden Audio Elements */}
      {ttsUrl && (
        <audio ref={audioRef} preload="auto" crossOrigin="anonymous">
          <source src={ttsUrl} type="audio/mpeg" />
        </audio>
      )}
      
      {backgroundMusic && (
        <audio ref={backgroundMusicRef} preload="auto" loop crossOrigin="anonymous">
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