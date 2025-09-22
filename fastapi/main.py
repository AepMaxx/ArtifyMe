import base64
import io
import logging
import subprocess
import sys
from typing import Optional
from fastapi import FastAPI, Query, Request, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from diffusers import DiffusionPipeline
from PIL import Image
import torch

# ============================================================================
# CUDA PYTORCH AUTO-INSTALLATION
# ============================================================================

def check_and_install_cuda_pytorch():
    """Check if PyTorch has CUDA support, if not, install it automatically"""
    try:
        import torch
        cuda_available = torch.cuda.is_available()
        
        # Check if it's CPU-only version
        if torch.__version__.endswith('+cpu') or not cuda_available:
            logger.info("Installing GPU-enabled PyTorch...")
            
            try:
                cmd = [
                    sys.executable, "-m", "pip", "install", 
                    "--index-url", "https://download.pytorch.org/whl/cu124",
                    "torch", "torchvision", "torchaudio",
                    "--upgrade", "--force-reinstall"
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
                
                if result.returncode == 0:
                    logger.info("GPU PyTorch installed successfully!")
                    return True
                else:
                    logger.error("Failed to install GPU PyTorch")
                    return False
                    
            except Exception as e:
                logger.error("Installation failed")
                return False
        else:
            return True
            
    except ImportError:
        logger.info("Installing GPU PyTorch...")
        try:
            cmd = [
                sys.executable, "-m", "pip", "install", 
                "--index-url", "https://download.pytorch.org/whl/cu124",
                "torch", "torchvision", "torchaudio"
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            return result.returncode == 0
                
        except Exception as e:
            return False

# ============================================================================
# CONFIGURATION & LOGGING
# ============================================================================

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="ArtifyMe AI Service",
    description="AI-powered image generation using Stable Diffusion",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ============================================================================
# CORS CONFIGURATION
# ============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# ============================================================================
# AI MODEL INITIALIZATION
# ============================================================================

# Check and install GPU PyTorch if needed
cuda_installed = check_and_install_cuda_pytorch()

logger.info("Loading AI model...")

try:
    # Load the DiffusionPipeline
    model_id = "stabilityai/stable-diffusion-2-1-base"
    pipeline = DiffusionPipeline.from_pretrained(model_id)
    
    # Auto-detect best device
    if torch.cuda.is_available():
        device = "cuda"
        logger.info("Using GPU")
    elif torch.backends.mps.is_available():
        device = "mps"
        logger.info("Using Apple GPU")
    else:
        device = "cpu"
        logger.info("Using CPU")
    
    pipe = pipeline.to(device)
    pipe.enable_attention_slicing()
    
    logger.info(f"Stable Diffusion model loaded successfully on {device}!")
    
except Exception as e:
    logger.error("Failed to load AI model")
    raise

# ============================================================================
# REQUEST MODELS
# ============================================================================

class ImageGenerationRequest(BaseModel):
    base64_image: str = Field(..., description="Base64 encoded image")
    prompt: str = Field(..., description="Text prompt for image generation")
    strength: float = Field(0.75, ge=0.1, le=1.0, description="Strength of transformation")
    scale: int = Field(7, ge=1, le=10, description="CFG scale")
    sampling_steps: int = Field(10, ge=1, le=100, description="Sampling steps")
    num_inference_steps: int = Field(20, ge=1, le=100, description="Number of inference steps")

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "ArtifyMe AI Service is running!",
        "status": "healthy",
        "model": "stabilityai/stable-diffusion-2-1-base",
        "device": device
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_loaded": True,
        "device": device,
        "torch_version": torch.__version__,
        "cuda_available": torch.cuda.is_available(),
        "mps_available": torch.backends.mps.is_available()
    }

@app.get("/generate/text2img", response_class=StreamingResponse)
async def generate_text_to_image(
    prompt: str = Query(..., description="Text prompt for image generation"),
    temperature: float = Query(0.9, ge=0.1, le=1.0, description="Temperature for diversity"),
    width: int = Query(512, ge=64, le=1024, description="Image width"),
    height: int = Query(512, ge=64, le=1024, description="Image height"),
    scale: int = Query(7, ge=1, le=10, description="CFG scale"),
    seed: int = Query(-1, description="Random seed"),
    sampling_steps: int = Query(20, ge=1, le=100, description="Sampling steps"),
    num_inference_steps: int = Query(50, ge=1, le=100, description="Number of inference steps")
):
    """Generate image from text prompt"""
    try:
        logger.info(f"Generating image from text: '{prompt[:50]}...'")
        
        # Generate image
        image = pipe(
            prompt, 
            width=width,
            height=height, 
            num_inference_steps=num_inference_steps, 
            temperature=temperature, 
            scale=scale, 
            seed=seed, 
            sampling_steps=sampling_steps
        ).images[0]
        
        # Convert image to PNG format
        image_data = io.BytesIO()
        image.save(image_data, format="PNG")
        image_data.seek(0)
        
        logger.info("Image generated successfully")
        return StreamingResponse(image_data, media_type="image/png")
        
    except Exception as e:
        logger.error("Image generation failed")
        raise HTTPException(status_code=500, detail="Image generation failed")

@app.post("/generate/img2img")
async def generate_image_from_image(request: ImageGenerationRequest):
    """Generate image from existing image (sketch to artwork)"""
    try:
        logger.info(f"Generating image from sketch with prompt: '{request.prompt[:50]}...'")
        
        # Validate base64 image
        if not request.base64_image:
            raise HTTPException(status_code=400, detail="Base64 image is required")
        
        # Decode base64-encoded image
        try:
            image_bytes = base64.b64decode(request.base64_image.split(",")[-1])
            init_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            init_image = init_image.resize((768, 512))
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Generate image with the provided prompt
        images = pipe(
            prompt=request.prompt,
            image=init_image,
            strength=request.strength,
            num_inference_steps=request.num_inference_steps,
            sampling_steps=request.sampling_steps,
            scale=request.scale
        ).images
        generated_image = images[0]
        
        # Convert generated image to base64 format
        image_data = io.BytesIO()
        generated_image.save(image_data, format="PNG")
        image_data.seek(0)
        base64_image_str = base64.b64encode(image_data.getvalue()).decode('utf-8')
        
        logger.info("Image generated successfully from sketch")
        return JSONResponse({
            "base64_image": f"data:image/png;base64,{base64_image_str}",
            "status": "success",
            "prompt": request.prompt,
            "original_prompt": getattr(request, 'original_prompt', request.prompt)
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Image generation failed")
        raise HTTPException(status_code=500, detail="Image generation failed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)