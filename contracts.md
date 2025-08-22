# Professional Sketch Video Generator - Integration Contracts

## 🎯 Complete Feature Overview
This application creates professional sketch videos by combining:
1. **Advanced Edge Detection Algorithm** (from provided JavaScript)
2. **StreamElements Text-to-Speech Integration** 
3. **Background Music Mixing**
4. **Canvas Video Recording** with synchronized audio

## 📋 API Contracts

### A) Image Processing Endpoints
```
POST /api/images/upload
- Accept: multipart/form-data
- Body: images[] (5-20 files, JPG/PNG, max 10MB each)
- Response: { imageIds[], uploadedCount, processingStatus }

POST /api/images/process-edges
- Body: { imageIds[], settings: { threshold, speed, thickness, color } }
- Response: { edgeData[], processingTime, totalPoints }
```

### B) Audio Integration Endpoints  
```
POST /api/audio/generate-tts
- Body: { text, voice, settings }
- Response: { audioUrl, duration, voice, status }

POST /api/audio/upload-music
- Accept: multipart/form-data  
- Body: musicFile (MP3/WAV/AAC, max 50MB)
- Response: { musicId, duration, format, status }
```

### C) Video Generation Endpoints
```
POST /api/video/create
- Body: { 
    imageIds[], 
    edgeSettings,
    ttsConfig: { text, voice, volume },
    musicConfig: { musicId, volume },
    outputSettings: { fps, quality, format }
  }
- Response: { videoId, status, estimatedDuration }

GET /api/video/status/{videoId}
- Response: { progress%, currentStep, eta, status }

GET /api/video/download/{videoId}  
- Response: video file (WebM/MP4)
```

## 🔧 Frontend Integration Points

### B) Mock Data to Replace with Real APIs
**Current Mock Functions** (in mock.js):
- `processEdgeDetection()` → Replace with `/api/images/process-edges`
- `generateSketchEffect()` → Integrate with edge detection results
- `simulateVideoGeneration()` → Replace with `/api/video/create`
- `testTTSPlayback()` → Keep as-is (works with StreamElements)
- `downloadVideo()` → Replace with `/api/video/download`

### C) Real Integrations Already Working
✅ **StreamElements TTS API**: `https://api.streamelements.com/kappa/v2/speech?voice={voice}&text={text}`
✅ **File Upload Handling**: Drag & drop, validation, preview
✅ **Canvas Sketch Animation**: Edge detection algorithm implemented
✅ **Audio Controls**: Volume mixing, voice selection
✅ **Video Recording**: MediaRecorder API with canvas stream

## 🎨 Backend Implementation Tasks

### D) Core Processing Pipeline
1. **Image Edge Detection Service**
   - Implement the sophisticated edge detection algorithm (from provided JS)
   - Configurable threshold, line thickness, color settings
   - Return optimized drawing paths for smooth animation

2. **Audio Processing Service**  
   - TTS generation using StreamElements API
   - Background music file handling and conversion
   - Audio mixing with volume level controls
   - Synchronization timing calculations

3. **Video Composition Service**
   - Canvas-based sketch animation rendering
   - Audio track synchronization (TTS + Background Music)
   - Real-time progress updates via WebSocket/SSE
   - High-quality video export (WebM format)

### E) Database Models
```javascript
// Sketch Project
{
  projectId, userId, title, status,
  images: [{ imageId, originalUrl, edgeData, order }],
  audioConfig: { ttsText, voice, musicId, volumes },
  videoConfig: { fps, quality, duration },
  outputUrl, createdAt, completedAt
}

// Edge Processing Results  
{
  imageId, edgePoints[], pathOrder[], 
  settings: { threshold, thickness, color },
  processingTime, pointCount
}
```

## 🎬 Frontend-Backend Integration Flow

### F) Complete User Journey
1. **Upload Images** → POST `/api/images/upload`
2. **Setup Audio** → POST `/api/audio/generate-tts` + `/api/audio/upload-music`  
3. **Generate Sketches** → POST `/api/images/process-edges`
4. **Start Video Creation** → POST `/api/video/create`
5. **Real-time Progress** → WebSocket updates
6. **Download Result** → GET `/api/video/download/{id}`

### G) Key Integration Changes Needed
**AdvancedVideoPlayer.jsx**:
- Replace `processEdgeDetection()` with API call
- Connect WebSocket for real-time progress
- Replace `MediaRecorder` with backend video generation

**AudioControls.jsx**:
- Keep StreamElements TTS (already working)
- Add backend music upload integration  
- Implement audio mixing API calls

**ImageUploader.jsx**:
- Add backend upload endpoint integration
- Handle upload progress and validation responses

## 🔍 Technical Specifications

### H) Advanced Sketch Algorithm Features
- **Edge Detection**: Sobel/Canny-style gradient calculation
- **Path Optimization**: Natural drawing order with distance minimization  
- **Progressive Animation**: Configurable speed with smooth line rendering
- **Professional Output**: Pencil sketch effect with customizable styles

### I) Audio Synchronization Details  
- **TTS Timing**: Word-level synchronization with sketch progress
- **Music Looping**: Seamless background music during entire video
- **Volume Mixing**: Professional audio level balancing
- **Export Quality**: High-fidelity audio in final video

### J) Video Output Specifications
- **Format**: WebM with VP9 codec (browser-compatible)
- **Resolution**: 1080p (1920x1080) standard
- **Frame Rate**: 30 FPS for smooth playback
- **Audio**: 48kHz stereo with TTS + background music mixed
- **File Size**: Optimized compression for web delivery

## ✅ Current Status Summary

**✅ COMPLETED (Frontend with Mock)**:
- Professional UI with 4-step workflow
- Advanced sketch animation algorithm integration
- StreamElements TTS API working perfectly
- Background music upload and preview  
- Canvas video recording with audio synchronization
- Real-time progress tracking and controls
- Professional design following all guidelines

**🔄 NEXT PHASE (Backend Implementation)**:
- Image processing endpoints with edge detection
- Video generation service with audio mixing
- File storage and download management
- Real-time progress updates
- Complete end-to-end video creation pipeline

The frontend provides an excellent "aha moment" showing exactly how the final product works. Backend implementation will make it fully functional with real video generation and download capabilities.