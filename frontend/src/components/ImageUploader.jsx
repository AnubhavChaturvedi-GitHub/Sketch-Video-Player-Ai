import React, { useState, useCallback } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const ImageUploader = ({ onImagesUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const { toast } = useToast();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file) => {
    if (!file.type.includes('image/')) {
      return "File must be an image (JPG, PNG, WebP)";
    }
    if (file.size > 10 * 1024 * 1024) {
      return "File size must be less than 10MB";
    }
    return null;
  };

  const processFiles = (files) => {
    const fileList = Array.from(files);
    const validFiles = [];
    const errors = [];

    fileList.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else if (uploadedImages.length + validFiles.length < 20) {
        validFiles.push({
          id: Date.now() + Math.random(),
          file,
          name: file.name,
          size: file.size,
          url: URL.createObjectURL(file)
        });
      }
    });

    if (errors.length > 0) {
      toast({
        title: "Upload Errors",
        description: errors.join(', '),
        variant: "destructive"
      });
    }

    if (validFiles.length > 0) {
      const newImages = [...uploadedImages, ...validFiles];
      setUploadedImages(newImages);
      onImagesUpload(newImages);
      
      toast({
        title: "Images Uploaded",
        description: `${validFiles.length} image(s) added successfully`
      });
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    processFiles(files);
  }, [uploadedImages]);

  const handleFileInput = (e) => {
    const files = e.target.files;
    processFiles(files);
    e.target.value = '';
  };

  const removeImage = (imageId) => {
    const newImages = uploadedImages.filter(img => img.id !== imageId);
    setUploadedImages(newImages);
    onImagesUpload(newImages);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card className={`p-8 border-2 border-dashed transition-all duration-200 bg-white/80 backdrop-blur-sm ${
        dragActive ? 'border-slate-400 bg-slate-50' : 'border-slate-300'
      }`}>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className="text-center"
        >
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-slate-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            Upload Your Images
          </h3>
          <p className="text-slate-600 mb-6">
            Drag and drop your images here, or click to browse
          </p>
          
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          
          <Button 
            asChild
            className="bg-slate-800 hover:bg-slate-700 text-white transition-all duration-200"
          >
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Choose Images
            </label>
          </Button>
          
          <div className="mt-4 text-sm text-slate-500">
            {uploadedImages.length}/20 images • JPG, PNG up to 10MB each
          </div>
        </div>
      </Card>

      {/* Status Messages */}
      {uploadedImages.length > 0 && uploadedImages.length < 5 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center space-x-2 text-amber-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">
              Upload at least {5 - uploadedImages.length} more image(s) to continue
            </span>
          </div>
        </Card>
      )}

      {uploadedImages.length >= 5 && (
        <Card className="p-4 bg-emerald-50 border-emerald-200">
          <div className="flex items-center space-x-2 text-emerald-800">
            <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
            <span className="text-sm font-medium">
              Ready! You can now generate your sketch video
            </span>
          </div>
        </Card>
      )}

      {/* Uploaded Images Grid */}
      {uploadedImages.length > 0 && (
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">
              Uploaded Images ({uploadedImages.length})
            </h3>
            <Badge variant="outline" className="text-slate-600">
              {uploadedImages.length >= 5 ? 'Ready' : `${5 - uploadedImages.length} more needed`}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200"></div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <div className="mt-2 text-xs text-slate-600 truncate">
                  {image.name}
                </div>
                <div className="text-xs text-slate-500">
                  {formatFileSize(image.size)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ImageUploader;