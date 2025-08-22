import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Volume2, VolumeX, Play, Settings } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const Controls = () => {
  const [narrationText, setNarrationText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [voice, setVoice] = useState("Brian");
  const { toast } = useToast();

  const availableVoices = [
    "Brian", "Amy", "Emma", "Russell", "Nicole", "Joey", 
    "Justin", "Matthew", "Ivy", "Joanna", "Kendra", "Kimberly"
  ];

  const playNarration = async () => {
    if (!narrationText.trim()) {
      toast({
        title: "No Text Provided",
        description: "Please enter some text for narration",
        variant: "destructive"
      });
      return;
    }

    setIsPlaying(true);
    
    try {
      // Use StreamElements TTS API
      const ttsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(narrationText)}`;
      
      const audio = new Audio(ttsUrl);
      audio.volume = volume / 100;
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        toast({
          title: "Playback Error",
          description: "Failed to play text-to-speech audio",
          variant: "destructive"
        });
      };
      
      await audio.play();
      
      toast({
        title: "Narration Started",
        description: "Text-to-speech is now playing"
      });
      
    } catch (error) {
      setIsPlaying(false);
      toast({
        title: "Audio Error",
        description: "Could not play the narration audio",
        variant: "destructive"
      });
    }
  };

  const stopNarration = () => {
    setIsPlaying(false);
    // In real implementation, stop the current audio
  };

  return (
    <div className="space-y-6">
      {/* Text-to-Speech Controls */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
        <div className="flex items-center space-x-2 mb-4">
          <Volume2 className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-800">Narration Controls</h3>
        </div>
        
        <div className="space-y-4">
          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Voice</label>
            <div className="grid grid-cols-3 gap-2">
              {availableVoices.slice(0, 6).map((voiceName) => (
                <Button
                  key={voiceName}
                  variant={voice === voiceName ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVoice(voiceName)}
                  className={voice === voiceName ? 
                    "bg-slate-800 hover:bg-slate-700 text-white" : 
                    "border-slate-300 hover:bg-slate-50"
                  }
                >
                  {voiceName}
                </Button>
              ))}
            </div>
          </div>

          {/* Narration Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Narration Text</label>
            <Textarea
              placeholder="Enter the text you want to be spoken during the sketch animation..."
              value={narrationText}
              onChange={(e) => setNarrationText(e.target.value)}
              rows={4}
              className="border-slate-300 focus:border-slate-500"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{narrationText.length} characters</span>
              <span>StreamElements TTS</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-700">
              <span>Volume</span>
              <span>{volume}%</span>
            </div>
            <div className="flex items-center space-x-3">
              <VolumeX className="w-4 h-4 text-slate-400" />
              <Slider
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
                max={100}
                min={0}
                step={5}
                className="flex-1"
              />
              <Volume2 className="w-4 h-4 text-slate-600" />
            </div>
          </div>

          {/* Play Button */}
          <Button
            onClick={isPlaying ? stopNarration : playNarration}
            disabled={!narrationText.trim()}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white"
          >
            {isPlaying ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Playing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Test Narration</span>
              </div>
            )}
          </Button>
        </div>
      </Card>

      {/* Animation Settings */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-800">Animation Settings</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-slate-600">Total Duration</span>
              <Badge variant="outline" className="w-full justify-center">
                ~45 seconds
              </Badge>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-slate-600">Frame Rate</span>
              <Badge variant="outline" className="w-full justify-center">
                30 FPS
              </Badge>
            </div>
          </div>
          
          <div className="space-y-1">
            <span className="text-sm text-slate-600">Output Quality</span>
            <Badge variant="outline" className="w-full justify-center">
              1080p MP4
            </Badge>
          </div>
        </div>
      </Card>

      {/* Export Options */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-4">Export Options</h3>
        
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full border-slate-300 hover:bg-slate-50"
          >
            Export as MP4 Video
          </Button>
          <Button 
            variant="outline" 
            className="w-full border-slate-300 hover:bg-slate-50"
          >
            Export as GIF Animation  
          </Button>
          <Button 
            variant="outline" 
            className="w-full border-slate-300 hover:bg-slate-50"
          >
            Save Project Settings
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Controls;