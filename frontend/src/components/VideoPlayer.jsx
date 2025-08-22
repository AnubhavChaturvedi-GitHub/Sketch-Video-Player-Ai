import React, { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Play, Pause, RotateCcw, Download } from "lucide-react";

const VideoPlayer = ({ sketches }) => {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef(null);
  const [sketchSpeed, setSketchSpeed] = useState(50);

  useEffect(() => {
    if (sketches.length > 0) {
      drawCurrentFrame();
    }
  }, [sketches, currentFrame, progress]);

  const drawCurrentFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas || sketches.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const currentSketch = sketches[currentFrame];
    
    if (currentSketch) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set canvas background
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw sketch effect (mock implementation)
      const img = new Image();
      img.onload = () => {
        // Apply sketch filter effect
        ctx.filter = 'grayscale(100%) contrast(120%) brightness(110%)';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Add sketch lines overlay
        if (progress > 0) {
          ctx.filter = 'none';
          ctx.strokeStyle = '#2d3748';
          ctx.lineWidth = 1;
          ctx.globalAlpha = progress / 100;
          
          // Draw progressive sketch lines
          const lineCount = Math.floor((progress / 100) * 50);
          for (let i = 0; i < lineCount; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
      };
      img.src = currentSketch.original.url;
    }
  };

  const startAnimation = () => {
    setIsPlaying(true);
    
    const animate = () => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next frame
          setCurrentFrame(current => {
            if (current >= sketches.length - 1) {
              setIsPlaying(false);
              return 0;
            }
            return current + 1;
          });
          return 0;
        }
        return prev + (sketchSpeed / 10);
      });
      
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const resetAnimation = () => {
    pauseAnimation();
    setCurrentFrame(0);
    setProgress(0);
  };

  const downloadVideo = () => {
    // Mock download functionality
    const link = document.createElement('a');
    link.download = 'sketch-video.mp4';
    link.href = '#';
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Canvas */}
      <Card className="p-0 overflow-hidden bg-white border-slate-200">
        <div className="relative bg-gradient-to-br from-slate-50 to-stone-100 p-6">
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="w-full max-w-full rounded-lg shadow-lg bg-white border border-slate-200"
          />
          
          {/* Overlay Info */}
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            Frame {currentFrame + 1} of {sketches.length}
          </div>
          
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {Math.round(progress)}% Complete
          </div>
        </div>
      </Card>

      {/* Controls */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
        <div className="space-y-4">
          {/* Playback Controls */}
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
              size="lg"
              className="bg-slate-800 hover:bg-slate-700 text-white px-8"
            >
              {isPlaying ? (
                <><Pause className="w-5 h-5 mr-2" /> Pause</>
              ) : (
                <><Play className="w-5 h-5 mr-2" /> Play</>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={downloadVideo}
              className="border-slate-300 hover:bg-slate-50"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Animation Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-slate-800 h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Sketch Speed</span>
              <span>{sketchSpeed}%</span>
            </div>
            <Slider
              value={[sketchSpeed]}
              onValueChange={(value) => setSketchSpeed(value[0])}
              max={100}
              min={10}
              step={10}
              className="w-full"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VideoPlayer;