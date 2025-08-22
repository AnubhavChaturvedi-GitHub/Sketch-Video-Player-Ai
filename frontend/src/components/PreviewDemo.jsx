import React, { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Play, Pause, Volume2, Music, Mic, Download, Eye } from "lucide-react";

const PreviewDemo = () => {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Detecting edges...");
  
  const demoSteps = [
    "Detecting edges and contours...",
    "Calculating drawing paths...",
    "Starting progressive sketch animation...",
    "Drawing architectural details...",
    "Adding shading and texture...",
    "Completing final touches...",
    "Synchronizing with narration...",
    "Mixing background music...",
    "Finalizing video composition..."
  ];

  // Mock sketch animation effect
  useEffect(() => {
    if (isPlaying) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      canvas.width = 600;
      canvas.height = 400;
      
      // Clear canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      let animationFrame = 0;
      const maxFrames = 200;
      
      const animate = () => {
        if (!isPlaying) return;
        
        // Progressive sketch lines
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        
        // Draw random sketch lines to simulate edge detection
        for (let i = 0; i < 3; i++) {
          const x1 = Math.random() * canvas.width;
          const y1 = Math.random() * canvas.height;
          const x2 = x1 + (Math.random() - 0.5) * 50;
          const y2 = y1 + (Math.random() - 0.5) * 50;
          
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        
        animationFrame++;
        const currentProgress = (animationFrame / maxFrames) * 100;
        setProgress(currentProgress);
        
        // Update step
        const stepIndex = Math.floor((currentProgress / 100) * demoSteps.length);
        if (stepIndex < demoSteps.length) {
          setCurrentStep(demoSteps[stepIndex]);
        }
        
        if (animationFrame < maxFrames) {
          requestAnimationFrame(animate);
        } else {
          setIsPlaying(false);
          setCurrentStep("Preview complete - Ready for full generation!");
        }
      };
      
      animate();
    }
  }, [isPlaying]);

  const startDemo = () => {
    setIsPlaying(true);
    setProgress(0);
    setCurrentStep(demoSteps[0]);
  };

  const stopDemo = () => {
    setIsPlaying(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-slate-50 to-stone-50 border-slate-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            🎥 Live Preview: Advanced Sketch Video Generation
          </h2>
          <p className="text-slate-600">
            See how your images will transform into professional sketch animations with synchronized audio
          </p>
        </div>
      </Card>

      {/* Preview Canvas */}
      <Card className="p-0 overflow-hidden bg-white border-slate-200">
        <div className="bg-gradient-to-br from-slate-50 to-stone-100 p-6">
          <canvas
            ref={canvasRef}
            className="w-full max-w-full rounded-lg shadow-lg bg-white border border-slate-200"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
          
          {/* Overlay Indicators */}
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            Live Demo Mode
          </div>
          
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {Math.round(progress)}% Complete
          </div>
          
          {isPlaying && (
            <div className="absolute bottom-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Recording</span>
            </div>
          )}
        </div>
      </Card>

      {/* Progress and Status */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Processing Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-slate-700 to-slate-900 h-3 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Current Step */}
          <div className="text-center">
            <p className="text-slate-700 font-medium">{currentStep}</p>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={isPlaying ? stopDemo : startDemo}
              className="bg-slate-800 hover:bg-slate-700 text-white px-6"
            >
              {isPlaying ? (
                <><Pause className="w-4 h-4 mr-2" /> Pause Demo</>
              ) : (
                <><Play className="w-4 h-4 mr-2" /> Start Live Preview</>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Audio Composition Visualization */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
          <Volume2 className="w-5 h-5 mr-2" />
          Audio Composition Layers
        </h3>
        
        <div className="space-y-4">
          {/* TTS Track */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Mic className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Narration Track</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">StreamElements TTS</Badge>
            </div>
            <div className="bg-blue-200 h-2 rounded-full">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-blue-600 mt-1">Professional voice synthesis with natural intonation</p>
          </div>

          {/* Background Music Track */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Music className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-emerald-800">Background Music</span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800">Looped & Mixed</Badge>
            </div>
            <div className="bg-emerald-200 h-2 rounded-full">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-200"
                style={{ width: isPlaying ? '100%' : '0%' }}
              ></div>
            </div>
            <p className="text-xs text-emerald-600 mt-1">Synchronized with sketch animation timing</p>
          </div>

          {/* Video Track */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-800">Sketch Animation</span>
              </div>
              <Badge className="bg-purple-100 text-purple-800">30 FPS Canvas</Badge>
            </div>
            <div className="bg-purple-200 h-2 rounded-full">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-purple-600 mt-1">Progressive edge detection with natural drawing paths</p>
          </div>
        </div>
      </Card>

      {/* Final Output Preview */}
      <Card className="p-6 bg-gradient-to-r from-slate-800 to-slate-700 text-white">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold">🎬 Final Output Composition</h3>
          
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="font-medium mb-2">🎨 Visual Layer</div>
              <ul className="space-y-1 text-white/80">
                <li>• Progressive sketch animation</li>
                <li>• Edge detection algorithm</li>
                <li>• Natural drawing paths</li>
                <li>• Customizable line styles</li>
              </ul>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <div className="font-medium mb-2">🎵 Audio Layer</div>
              <ul className="space-y-1 text-white/80">
                <li>• Professional TTS narration</li>
                <li>• Background music mixing</li>
                <li>• Volume level balancing</li>
                <li>• Synchronized timing</li>
              </ul>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <div className="font-medium mb-2">📹 Output Format</div>
              <ul className="space-y-1 text-white/80">
                <li>• High-quality WebM video</li>
                <li>• 1080p resolution</li>
                <li>• 30 FPS smooth playback</li>
                <li>• Instant download ready</li>
              </ul>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="bg-white text-slate-800 hover:bg-white/90"
          >
            <Download className="w-4 h-4 mr-2" />
            Example Output: sketch-video-demo.webm
          </Button>
        </div>
      </Card>

      {/* Technical Details */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-4">🔧 Technical Implementation</h3>
        
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-slate-700 mb-2">Sketch Algorithm Features:</h4>
            <ul className="space-y-1 text-slate-600">
              <li>✓ Advanced edge detection with configurable threshold</li>
              <li>✓ Progressive line animation with natural path optimization</li>
              <li>✓ Customizable speed, thickness, and color settings</li>
              <li>✓ Real-time canvas rendering at 30 FPS</li>
              <li>✓ Professional pencil sketch effect</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 mb-2">Audio Synchronization:</h4>
            <ul className="space-y-1 text-slate-600">
              <li>✓ StreamElements TTS API integration</li>
              <li>✓ Multiple voice options (Brian, Amy, Emma, etc.)</li>
              <li>✓ Background music upload and mixing</li>
              <li>✓ Volume control for each audio layer</li>
              <li>✓ Perfect lip-sync timing with animation</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PreviewDemo;