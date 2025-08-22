import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import ImageUploader from "./ImageUploader";
import AdvancedVideoPlayer from "./AdvancedVideoPlayer";
import AudioControls from "./AudioControls";
import { Upload, Wand2, Download, Play } from "lucide-react";

const SketchGenerator = () => {
  const [images, setImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sketches, setSketches] = useState([]);
  const [currentStep, setCurrentStep] = useState("upload"); // upload, setup, generate, play
  const [narrationText, setNarrationText] = useState("");
  const [backgroundMusic, setBackgroundMusic] = useState(null);

  const handleImagesUpload = (uploadedImages) => {
    setImages(uploadedImages);
    if (uploadedImages.length >= 5) {
      setCurrentStep("setup");
    }
  };

  const handleSetupComplete = () => {
    if (narrationText.trim()) {
      setCurrentStep("generate");
    }
  };

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    // Mock generation process - convert images to sketch format
    setTimeout(() => {
      setSketches(images.map((img, idx) => ({
        id: idx,
        original: img,
        sketch: img, // In real implementation, this would be the processed sketch
        progress: 0
      })));
      setIsGenerating(false);
      setCurrentStep("play");
    }, 2000);
  };

  const canProceedToSetup = images.length >= 5;
  const canProceedToGenerate = canProceedToSetup && narrationText.trim();
  const isAudioReady = narrationText.trim();

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-stone-700 bg-clip-text text-transparent mb-4">
            Professional Sketch Video Generator
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Transform images into stunning pencil sketch animations with synchronized narration and background music
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
              currentStep === "upload" ? "bg-slate-800 text-white" : 
              canProceedToSetup ? "bg-emerald-500 text-white" : "bg-white text-slate-600"
            }`}>
              <Upload className="w-4 h-4" />
              <span className="font-medium">Upload Images</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-300"></div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
              currentStep === "setup" ? "bg-slate-800 text-white" : 
              canProceedToGenerate ? "bg-emerald-500 text-white" : "bg-white text-slate-600"
            }`}>
              <Wand2 className="w-4 h-4" />
              <span className="font-medium">Setup Audio</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-300"></div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
              currentStep === "generate" ? "bg-slate-800 text-white" : "bg-white text-slate-600"
            }`}>
              <Play className="w-4 h-4" />
              <span className="font-medium">Generate</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-300"></div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
              currentStep === "play" ? "bg-slate-800 text-white" : "bg-white text-slate-600"
            }`}>
              <Download className="w-4 h-4" />
              <span className="font-medium">Download</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {currentStep === "upload" && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ImageUploader onImagesUpload={handleImagesUpload} />
            </div>
            <div className="space-y-6">
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-4">Requirements</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Minimum Images</span>
                    <Badge variant="outline">5 images</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Maximum Images</span>
                    <Badge variant="outline">20 images</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Format</span>
                    <Badge variant="outline">JPG, PNG</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Max Size</span>
                    <Badge variant="outline">10MB each</Badge>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-4">Advanced Features</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div>• Professional edge detection algorithm</div>
                  <div>• Progressive sketch line animation</div>
                  <div>• Synchronized text-to-speech narration</div>
                  <div>• Background music integration</div>
                  <div>• Customizable sketch settings</div>
                  <div>• High-quality video recording (WebM)</div>
                  <div>• Real-time canvas preview</div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {currentStep === "setup" && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AudioControls 
                narrationText={narrationText}
                setNarrationText={setNarrationText}
                backgroundMusic={backgroundMusic}
                setBackgroundMusic={setBackgroundMusic}
              />
              
              <div className="mt-6 text-center">
                <Button 
                  onClick={handleSetupComplete}
                  disabled={!isAudioReady}
                  size="lg"
                  className="bg-slate-800 hover:bg-slate-700 text-white px-8"
                >
                  Continue to Generation
                </Button>
              </div>
            </div>
            <div className="space-y-6">
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-4">Audio Setup Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Images Uploaded</span>
                    <Badge variant="default" className="bg-emerald-500">{images.length} Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Narration Text</span>
                    <Badge variant={narrationText ? "default" : "outline"}>
                      {narrationText ? "Complete" : "Required"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Background Music</span>
                    <Badge variant={backgroundMusic ? "default" : "outline"}>
                      {backgroundMusic ? "Loaded" : "Optional"}
                    </Badge>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-4">Final Output</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div>• Synchronized audio and video</div>
                  <div>• Professional sketch animation</div>
                  <div>• WebM format with high quality</div>
                  <div>• Downloadable final video</div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {currentStep === "generate" && (
          <div className="text-center">
            <Card className="max-w-md mx-auto p-8 bg-white/80 backdrop-blur-sm border-slate-200">
              <div className="mb-6">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Ready to Generate</h3>
                <p className="text-slate-600 mb-4">
                  {images.length} images • Audio configured • Ready for advanced sketch generation
                </p>
                
                <div className="space-y-2 text-sm text-slate-500 mb-6">
                  <div>✓ Edge detection algorithm prepared</div>
                  <div>✓ Progressive animation paths calculated</div>
                  <div>✓ Audio tracks ready for synchronization</div>
                  <div>✓ Video recording setup complete</div>
                </div>
              </div>
              
              <Button 
                onClick={handleGenerateVideo}
                disabled={isGenerating}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white transition-all duration-200"
                size="lg"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Edge Detection...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Start Advanced Generation</span>
                  </div>
                )}
              </Button>
            </Card>
          </div>
        )}

        {currentStep === "play" && (
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <AdvancedVideoPlayer 
                sketches={sketches} 
                narrationText={narrationText}
                backgroundMusic={backgroundMusic}
              />
            </div>
            <div className="space-y-6">
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-4">Generation Complete</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div>• {sketches.length} images processed</div>
                  <div>• Edge detection applied</div>
                  <div>• Animation paths optimized</div>
                  <div>• Audio tracks synchronized</div>
                  <div>• Ready for recording</div>
                </div>
              </Card>
              
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-4">Instructions</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div>1. Adjust sketch settings if needed</div>
                  <div>2. Set audio volume levels</div>
                  <div>3. Click "Start Full Animation"</div>
                  <div>4. Recording will begin automatically</div>
                  <div>5. Download will start when complete</div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SketchGenerator;