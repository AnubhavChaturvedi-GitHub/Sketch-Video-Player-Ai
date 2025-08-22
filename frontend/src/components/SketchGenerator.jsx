import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import ImageUploader from "./ImageUploader";
import VideoPlayer from "./VideoPlayer";
import Controls from "./Controls";
import { Upload, Wand2, Download } from "lucide-react";

const SketchGenerator = () => {
  const [images, setImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sketches, setSketches] = useState([]);
  const [currentStep, setCurrentStep] = useState("upload"); // upload, generate, play

  const handleImagesUpload = (uploadedImages) => {
    setImages(uploadedImages);
    if (uploadedImages.length >= 5) {
      setCurrentStep("generate");
    }
  };

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    // Mock generation process
    setTimeout(() => {
      setSketches(images.map((img, idx) => ({
        id: idx,
        original: img,
        sketch: img, // In real implementation, this would be the sketched version
        progress: 0
      })));
      setIsGenerating(false);
      setCurrentStep("play");
    }, 2000);
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-stone-700 bg-clip-text text-transparent mb-4">
            Professional Sketch Video Generator
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Transform your images into stunning pencil sketch animations with synchronized narration
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
              currentStep === "upload" ? "bg-slate-800 text-white" : "bg-white text-slate-600"
            }`}>
              <Upload className="w-4 h-4" />
              <span className="font-medium">Upload Images</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-300"></div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
              currentStep === "generate" ? "bg-slate-800 text-white" : "bg-white text-slate-600"
            }`}>
              <Wand2 className="w-4 h-4" />
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
                <h3 className="font-semibold text-slate-800 mb-4">Features</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div>• Professional pencil sketch conversion</div>
                  <div>• Synchronized text-to-speech narration</div>
                  <div>• Adjustable sketch animation speed</div>
                  <div>• High-quality video export</div>
                  <div>• Canvas preview with controls</div>
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
                <p className="text-slate-600">
                  {images.length} images uploaded and ready for sketch conversion
                </p>
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
                    <span>Generating Sketches...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Wand2 className="w-4 h-4" />
                    <span>Generate Sketch Video</span>
                  </div>
                )}
              </Button>
            </Card>
          </div>
        )}

        {currentStep === "play" && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <VideoPlayer sketches={sketches} />
            </div>
            <div>
              <Controls />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SketchGenerator;