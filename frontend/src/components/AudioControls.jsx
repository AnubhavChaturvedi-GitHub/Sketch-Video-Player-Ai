import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Upload, Music, Volume2, Play, Mic } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const AudioControls = ({ narrationText, setNarrationText, backgroundMusic, setBackgroundMusic }) => {
  const [voice, setVoice] = useState("Brian");
  const [isTestingTTS, setIsTestingTTS] = useState(false);
  const { toast } = useToast();

  const availableVoices = [
    "Brian", "Amy", "Emma", "Russell", "Nicole", "Joey", 
    "Justin", "Matthew", "Ivy", "Joanna", "Kendra", "Kimberly"
  ];

  const handleBackgroundMusicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        setBackgroundMusic(url);
        toast({
          title: "Background Music Uploaded",
          description: `${file.name} loaded successfully`
        });
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload an audio file (MP3, WAV, etc.)",
          variant: "destructive"
        });
      }
    }
  };

  const testNarration = async () => {
    if (!narrationText.trim()) {
      toast({
        title: "No Text Provided",
        description: "Please enter some text for narration",
        variant: "destructive"
      });
      return;
    }

    setIsTestingTTS(true);
    
    try {
      const ttsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(narrationText)}`;
      const audio = new Audio(ttsUrl);
      
      audio.onended = () => {
        setIsTestingTTS(false);
      };
      
      audio.onerror = () => {
        setIsTestingTTS(false);
        toast({
          title: "Playback Error",
          description: "Failed to play text-to-speech audio",
          variant: "destructive"
        });
      };
      
      await audio.play();
      
      toast({
        title: "Testing Narration",
        description: "Text-to-speech preview is playing"
      });
      
    } catch (error) {
      setIsTestingTTS(false);
      toast({
        title: "Audio Error",
        description: "Could not play the narration audio",
        variant: "destructive"
      });
    }
  };

  const calculateDuration = () => {
    if (!narrationText) return "0:00";
    const words = narrationText.trim().split(/\s+/).length;
    const seconds = Math.round(words * 0.6); // Average speaking rate
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Text-to-Speech Controls */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
        <div className="flex items-center space-x-2 mb-4">
          <Mic className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-800">Narration Setup</h3>
        </div>
        
        <div className="space-y-4">
          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Voice Selection</label>
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
            
            {/* More voices - show remaining in dropdown style */}
            <div className="grid grid-cols-3 gap-2">
              {availableVoices.slice(6).map((voiceName) => (
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
            <label className="text-sm font-medium text-slate-700">Narration Script</label>
            <Textarea
              placeholder="Enter the text you want to be spoken during the sketch animation. This will be synchronized with your image sequence..."
              value={narrationText}
              onChange={(e) => setNarrationText(e.target.value)}
              rows={5}
              className="border-slate-300 focus:border-slate-500"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{narrationText.length} characters • {narrationText.trim().split(/\s+/).length} words</span>
              <span>Estimated duration: {calculateDuration()}</span>
            </div>
          </div>

          {/* Test Button */}
          <Button
            onClick={testNarration}
            disabled={!narrationText.trim() || isTestingTTS}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white"
          >
            {isTestingTTS ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Playing Preview...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Test Narration ({voice})</span>
              </div>
            )}
          </Button>
        </div>
      </Card>

      {/* Background Music Upload */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
        <div className="flex items-center space-x-2 mb-4">
          <Music className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-800">Background Music</h3>
        </div>
        
        <div className="space-y-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
            <div className="space-y-2">
              <Music className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-slate-600">Upload background music</p>
              <p className="text-xs text-slate-500">MP3, WAV, AAC up to 50MB</p>
              
              <input
                type="file"
                accept="audio/*"
                onChange={handleBackgroundMusicUpload}
                className="hidden"
                id="music-upload"
              />
              
              <Button asChild variant="outline" className="border-slate-300 hover:bg-slate-50">
                <label htmlFor="music-upload" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Audio File
                </label>
              </Button>
            </div>
          </div>

          {/* Music Status */}
          {backgroundMusic ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-emerald-800">
                <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                <span className="text-sm font-medium">Background music loaded</span>
              </div>
              <p className="text-xs text-emerald-600 mt-1">Music will play continuously during animation</p>
              
              {/* Preview Audio */}
              <audio controls className="w-full mt-3" src={backgroundMusic}>
                Your browser does not support audio playback.
              </audio>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-amber-800">
                <Volume2 className="w-4 h-4" />
                <span className="text-sm">No background music selected</span>
              </div>
              <p className="text-xs text-amber-600 mt-1">Add music to enhance your sketch video</p>
            </div>
          )}
        </div>
      </Card>

      {/* Audio Mixing Preview */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-4">Audio Composition</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <Mic className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Narration Track</p>
                <p className="text-xs text-slate-500">{voice} voice • {calculateDuration()}</p>
              </div>
            </div>
            <Badge variant={narrationText ? "default" : "outline"}>
              {narrationText ? "Ready" : "Empty"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <Music className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Background Music</p>
                <p className="text-xs text-slate-500">Looped during animation</p>
              </div>
            </div>
            <Badge variant={backgroundMusic ? "default" : "outline"}>
              {backgroundMusic ? "Loaded" : "None"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Final Mix</p>
                <p className="text-xs text-slate-500">Narration + Music + Animation</p>
              </div>
            </div>
            <Badge variant={narrationText && backgroundMusic ? "default" : "outline"}>
              {narrationText && backgroundMusic ? "Ready to Record" : "Incomplete"}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AudioControls;