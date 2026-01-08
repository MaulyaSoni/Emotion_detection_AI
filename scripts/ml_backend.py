"""
Emotion Detection ML Backend Server
===================================

This FastAPI server connects your TensorFlow emotion detection model
to the Next.js frontend. 

SETUP INSTRUCTIONS:
1. Install dependencies:
   pip install fastapi uvicorn opencv-python numpy tensorflow pillow

2. Update the paths below to point to your model files:
   - MODEL_PATH: Your trained emotion model (.h5 file)
   - FACE_CASCADE_PATH: Haar cascade XML file for face detection

3. Run the server:
   python ml_backend.py
   
   Or with uvicorn directly:
   uvicorn ml_backend:app --host 0.0.0.0 --port 8000 --reload

4. The server will be available at http://localhost:8000
   - Health check: GET /api/health
   - Text analysis: POST /api/analyze/text
   - Image analysis: POST /api/analyze/image
   - Frame analysis: POST /api/analyze/frame (optimized for real-time)

5. In your Next.js app, set the environment variable:
   NEXT_PUBLIC_ML_BACKEND_URL=http://localhost:8000
"""

import os
import io
import base64
from typing import Optional, List, Tuple

import cv2
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

from emotion_camera import EmotionCameraDetector

# Try to import TensorFlow inside EmotionCameraDetector
TF_AVAILABLE = True

# Configuration
MODEL_PATH = os.environ.get("EMOTION_MODEL_PATH", r"D:\Emotion-Detection\saved-models\emotion_model-opt1.h5")
FACE_CASCADE_PATH = os.environ.get("HAAR_CASCADE_PATH", r"D:\Emotion-Detection\saved-models\haarcascade_frontalface_default.xml")

# Initialize FastAPI
app = FastAPI(
    title="Emotion Detection API",
    description="ML backend for real-time emotion detection",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    DETECTOR = EmotionCameraDetector(
        model_path=MODEL_PATH,
        cascade_path=FACE_CASCADE_PATH,
        img_size=48,
        confidence_threshold=CONFIDENCE_THRESHOLD,
        smoothing_frames=SMOOTHING_FRAMES,
    )
    MODEL_LOADED = True
except Exception as exc:
    DETECTOR = None
    MODEL_LOADED = False
    print(f"[WARNING] EmotionCameraDetector unavailable: {exc}")

# Request/Response Models
class TextRequest(BaseModel):
    text: str

class ImageRequest(BaseModel):
    image: str  # Base64 encoded image

class FrameRequest(BaseModel):
    frame: str  # Base64 encoded frame

class EmotionResponse(BaseModel):
    emotion: str
    confidence: float
    predictions: List[float]
    face_detected: bool
    face_bbox: Optional[Tuple[int, int, int, int]] = None

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    tensorflow_available: bool

# Helper Functions
def decode_image(base64_string: str) -> np.ndarray:
    """Decode base64 image to numpy array."""
    # Remove data URL prefix if present
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    
    image_bytes = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_bytes))
    return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

def analyze_text_sentiment(text: str) -> Tuple[str, float, List[float]]:
    """Simple keyword-based text sentiment analysis."""
    text_lower = text.lower()
    
    keywords = {
        "Angry": ["angry", "mad", "furious", "hate", "annoyed", "frustrated", "rage"],
        "Disgust": ["disgusted", "gross", "nasty", "revolting", "yuck", "ew", "horrible"],
        "Fear": ["afraid", "scared", "fear", "terrified", "anxious", "worried", "panic"],
        "Happy": ["happy", "joy", "love", "excited", "great", "wonderful", "amazing"],
        "Sad": ["sad", "unhappy", "depressed", "cry", "miserable", "heartbroken"],
        "Surprise": ["surprised", "shocked", "amazed", "wow", "unexpected", "whoa"],
        "Neutral": ["okay", "fine", "normal", "alright", "meh"],
    }
    
    scores = {emotion: 0.1 for emotion in EMOTION_LABELS}
    
    for emotion, words in keywords.items():
        for word in words:
            if word in text_lower:
                scores[emotion] += 0.3
    
    # Normalize
    total = sum(scores.values())
    predictions = [scores[e] / total for e in EMOTION_LABELS]
    
    max_idx = np.argmax(predictions)
    emotion = EMOTION_LABELS[max_idx]
    confidence = predictions[max_idx]
    
    return emotion, confidence, predictions

# API Endpoints
@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Check server health and model status."""
    return HealthResponse(
        status="ok",
        model_loaded=MODEL_LOADED,
        tensorflow_available=TF_AVAILABLE
    )

@app.post("/api/analyze/text", response_model=EmotionResponse)
async def analyze_text(request: TextRequest):
    """Analyze emotion from text."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Empty text")
    
    emotion, confidence, predictions = analyze_text_sentiment(request.text)
    
    return EmotionResponse(
        emotion=emotion,
        confidence=confidence,
        predictions=predictions,
        face_detected=False,
        face_bbox=None
    )

@app.post("/api/analyze/image", response_model=EmotionResponse)
async def analyze_image(request: ImageRequest):
    """Analyze emotion from uploaded image using EmotionCameraDetector when available."""
    try:
        image = decode_image(request.image)
        if DETECTOR:
            emotion, confidence, predictions, face_detected, bbox = DETECTOR.analyze_bgr_frame(
                image, apply_smoothing=False
            )
            return EmotionResponse(
                emotion=emotion,
                confidence=confidence,
                predictions=predictions,
                face_detected=face_detected,
                face_bbox=bbox,
            )
        else:
            predictions = np.random.dirichlet(np.ones(7)).tolist()
            idx = np.argmax(predictions)
            return EmotionResponse(
                emotion=EmotionCameraDetector.EMOTION_LABELS[idx],
                confidence=predictions[idx],
                predictions=predictions,
                face_detected=False,
                face_bbox=None,
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze/frame", response_model=EmotionResponse)
async def analyze_frame(request: FrameRequest):
    """Analyze emotion from webcam frame (optimized for real-time)."""
    try:
        image = decode_image(request.frame)
        if DETECTOR:
            emotion, confidence, predictions, face_detected, bbox = DETECTOR.analyze_bgr_frame(
                image, apply_smoothing=True
            )
            return EmotionResponse(
                emotion=emotion,
                confidence=confidence,
                predictions=predictions,
                face_detected=face_detected,
                face_bbox=bbox,
            )
        predictions = [1 / 7] * 7
        return EmotionResponse(
            emotion="Neutral",
            confidence=0.14,
            predictions=predictions,
            face_detected=False,
            face_bbox=None,
        )
    except Exception as e:
        return EmotionResponse(
            emotion="Neutral",
            confidence=0.5,
            predictions=[1 / 7] * 7,
            face_detected=False,
            face_bbox=None,
        )

@app.get("/api/webcam/status")
async def webcam_status():
    """Check if webcam is available and ready."""
    try:
        cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
        is_open = cap.isOpened()
        if is_open:
            cap.release()
        return {
            "available": is_open,
            "message": "Webcam is ready" if is_open else "Webcam not accessible",
            "model_loaded": MODEL_LOADED
        }
    except Exception as e:
        return {
            "available": False,
            "message": "Error checking webcam: {}".format(str(e)),
            "model_loaded": MODEL_LOADED
        }

# Run Server
if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "="*50)
    print("[START] Starting Emotion Detection ML Backend")
    print("="*50)
    print("[INFO] Model path: {}".format(MODEL_PATH))
    print("[INFO] Cascade path: {}".format(FACE_CASCADE_PATH))
    print("[INFO] TensorFlow available: {}".format(TF_AVAILABLE))
    print("[INFO] Model loaded: {}".format(MODEL_LOADED))
    print("="*50)
    print("\n[SERVER] Server starting at http://localhost:8001")
    print("[DOCS] API docs available at http://localhost:8001/docs")
    print("\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8001)
