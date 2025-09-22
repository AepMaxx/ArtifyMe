import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../lib/AppContext';
import { sketchcolors } from '../lib/constants';
import RainbowTitle from '../components/shared/RainbowTitle';
import './Canvas.css';

interface Point {
  x: number;
  y: number;
}

interface Path {
  points: Point[];
  color: string;
  size: number;
}

const Canvas: React.FC = () => {
  const navigate = useNavigate();
  const { paths, setPaths, theme, authenticated } = useAppContext();
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedBrushSize, setSelectedBrushSize] = useState(2);
  const [currentPath, setCurrentPath] = useState<Path>({ points: [], color: sketchcolors[selectedColorIndex], size: selectedBrushSize });
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authenticated) {
      navigate('/login');
    }
  }, [authenticated, navigate]);

  useEffect(() => {
    setCurrentPath(prev => ({ ...prev, color: sketchcolors[selectedColorIndex] }));
  }, [selectedColorIndex]);

  useEffect(() => {
    setCurrentPath(prev => ({ ...prev, size: selectedBrushSize }));
  }, [selectedBrushSize]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPath: Path = {
      points: [{ x, y }],
      color: sketchcolors[selectedColorIndex],
      size: selectedBrushSize
    };
    setCurrentPath(newPath);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentPath(prev => ({
      ...prev,
      points: [...prev.points, { x, y }]
    }));
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (currentPath.points.length > 0) {
      setPaths((prevPaths: any[]) => [...prevPaths, currentPath]);
    }
    setCurrentPath({ points: [], color: sketchcolors[selectedColorIndex], size: selectedBrushSize });
  };

  const clearCanvas = () => {
    setPaths([]);
    setCurrentPath({ points: [], color: sketchcolors[selectedColorIndex], size: selectedBrushSize });
  };

  const undoLastPath = () => {
    if (paths.length > 0) {
      setPaths((prevPaths: any[]) => prevPaths.slice(0, -1));
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  const drawPath = (ctx: CanvasRenderingContext2D, path: Path) => {
    if (path.points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(path.points[0].x, path.points[0].y);
    for (let i = 1; i < path.points.length; i++) {
      ctx.lineTo(path.points[i].x, path.points[i].y);
    }
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all paths
    paths.forEach((path: any) => {
      drawPath(ctx, path);
    });

    // Draw current path
    if (currentPath.points.length > 0) {
      drawPath(ctx, currentPath);
    }
  }, [paths, currentPath]);

  return (
    <div className={`canvas-page ${theme}`}>
      <div className="canvas-header">
        <RainbowTitle titleText="Canvas" />
        <div className="canvas-controls">
          <button className="control-btn brush-btn" onClick={() => setShowColorPicker(!showColorPicker)}>
            <div className="brush-preview" style={{ backgroundColor: sketchcolors[selectedColorIndex], width: `${selectedBrushSize * 2}px`, height: `${selectedBrushSize * 2}px` }}></div>
            <span>Brush</span>
          </button>
          <button className="control-btn close-btn" onClick={handleClose}>
            ✕ Close
          </button>
        </div>
      </div>

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="drawing-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      <div className="canvas-toolbar">
        <button className="toolbar-btn clear-btn" onClick={clearCanvas}>
          🗑️ Clear
        </button>
        <button className="toolbar-btn undo-btn" onClick={undoLastPath}>
          ↶ Undo
        </button>
        <button className="toolbar-btn brush-btn" onClick={() => setShowColorPicker(!showColorPicker)}>
          🎨 Color/Size
        </button>
      </div>

      {showColorPicker && (
        <div className="color-picker-modal">
          <div className="color-picker-content">
            <h3>Brush Settings</h3>
            
            <div className="brush-sizes">
              <h4>Brush Size</h4>
              <div className="size-options">
                {[2, 4, 6, 8, 10].map((size) => (
                  <button
                    key={size}
                    className={`size-btn ${selectedBrushSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedBrushSize(size)}
                  >
                    <div 
                      className="size-preview" 
                      style={{ 
                        backgroundColor: sketchcolors[selectedColorIndex], 
                        width: `${size * 2}px`, 
                        height: `${size * 2}px` 
                      }}
                    ></div>
                  </button>
                ))}
              </div>
            </div>

            <div className="color-options">
              <h4>Colors</h4>
              <div className="color-grid">
                {sketchcolors.map((color, index) => (
                  <button
                    key={color}
                    className={`color-btn ${selectedColorIndex === index ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColorIndex(index)}
                  />
                ))}
              </div>
            </div>

            <button className="confirm-btn" onClick={() => setShowColorPicker(false)}>
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
