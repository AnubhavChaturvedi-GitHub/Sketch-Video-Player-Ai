// Mock data and utilities for the Sketch Video Generator

export const mockImages = [
  {
    id: 1,
    name: "landscape1.jpg",
    size: 2485760,
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=entropy&auto=format"
  },
  {
    id: 2,
    name: "portrait1.jpg", 
    size: 1847296,
    url: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop&crop=entropy&auto=format"
  },
  {
    id: 3,
    name: "nature1.jpg",
    size: 3254784,
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=entropy&auto=format"
  },
  {
    id: 4,
    name: "cityscape1.jpg",
    size: 2937856,
    url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop&crop=entropy&auto=format"
  },
  {
    id: 5,
    name: "architecture1.jpg",
    size: 2147483,
    url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop&crop=entropy&auto=format"
  }
];

export const mockSketchingSteps = [
  "Analyzing image composition...",
  "Detecting edges and contours...", 
  "Generating pencil strokes...",
  "Adding shading details...",
  "Finalizing sketch texture..."
];

export const mockTTSVoices = [
  "Brian", "Amy", "Emma", "Russell", "Nicole", "Joey",
  "Justin", "Matthew", "Ivy", "Joanna", "Kendra", "Kimberly"
];

export const generateSketchEffect = (imageUrl) => {
  // Mock function to simulate sketch generation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        sketchUrl: imageUrl, // In real implementation, this would be the processed sketch
        progress: 100,
        processing_time: Math.random() * 2000 + 1000
      });
    }, 1500);
  });
};

export const simulateVideoGeneration = (images, narrationText, settings) => {
  return new Promise((resolve) => {
    const duration = images.length * (settings.frameDelay || 3000);
    
    setTimeout(() => {
      resolve({
        videoUrl: "mock-video-url.mp4",
        duration: duration,
        frames: images.length,
        narration_duration: narrationText ? narrationText.split(' ').length * 0.6 : 0,
        fileSize: Math.round(duration / 1000 * 2.5) // Mock file size calculation
      });
    }, 3000);
  });
};

export const downloadVideo = (videoData) => {
  // Mock download function
  const link = document.createElement('a');
  link.href = '#';
  link.download = `sketch-video-${Date.now()}.mp4`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return {
    status: 'success',
    message: 'Video download started'
  };
};

export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPG, PNG, and WebP images are allowed'
    };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image must be smaller than 10MB'
    };
  }
  
  return {
    valid: true,
    error: null
  };
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const calculateEstimatedDuration = (imageCount, sketchSpeed = 50) => {
  const baseTimePerImage = 3000; // 3 seconds per image
  const speedMultiplier = 100 / sketchSpeed;
  return Math.round((imageCount * baseTimePerImage * speedMultiplier) / 1000);
};

// StreamElements TTS API integration helper
export const createTTSUrl = (text, voice = 'Brian') => {
  const baseUrl = 'https://api.streamelements.com/kappa/v2/speech';
  const params = new URLSearchParams({
    voice: voice,
    text: text.substring(0, 500) // Limit text length
  });
  
  return `${baseUrl}?${params.toString()}`;
};

export const testTTSPlayback = async (text, voice, volume = 0.8) => {
  try {
    const ttsUrl = createTTSUrl(text, voice);
    const audio = new Audio(ttsUrl);
    audio.volume = volume;
    
    return new Promise((resolve, reject) => {
      audio.oncanplaythrough = () => {
        resolve({
          success: true,
          duration: audio.duration,
          url: ttsUrl
        });
      };
      
      audio.onerror = () => {
        reject({
          success: false,
          error: 'Failed to load TTS audio'
        });
      };
      
      audio.load();
    });
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};