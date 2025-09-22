import React, { useState, useEffect, useCallback } from 'react';
import { MutationStyle, PromptMutationRequest, PromptMutationResponse } from '../../lib/types';
import axios from 'axios';
import './PromptMutationPanel.css';

interface PromptMutationPanelProps {
  originalPrompt: string;
  onPromptMutated: (mutatedPrompt: string, style: MutationStyle) => void;
  theme: string;
}

const PromptMutationPanel: React.FC<PromptMutationPanelProps> = ({
  originalPrompt,
  onPromptMutated,
  theme
}) => {
  const [selectedStyle, setSelectedStyle] = useState<MutationStyle>(MutationStyle.Artistic);
  const [creativityLevel, setCreativityLevel] = useState(5);
  const [mutatedPrompt, setMutatedPrompt] = useState<string>('');
  const [mutationResponse, setMutationResponse] = useState<PromptMutationResponse | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [aiStatus, setAiStatus] = useState<{available: boolean, message: string}>({available: false, message: 'Checking...'});

  const apiUrl = process.env.REACT_APP_DOTNET_API_URL || 'http://localhost:5000';

  const styleDescriptions = {
    [MutationStyle.Artistic]: 'Focus on artistic styles, colors, and lighting',
    [MutationStyle.Technical]: 'Focus on technical details and composition',
    [MutationStyle.Emotional]: 'Focus on mood, atmosphere, and feelings',
    [MutationStyle.Descriptive]: 'Focus on detailed visual descriptions',
    [MutationStyle.Abstract]: 'Focus on abstract concepts and surreal elements',
    [MutationStyle.Realistic]: 'Focus on photorealistic details',
    [MutationStyle.Fantasy]: 'Focus on fantasy elements and magical aspects',
    [MutationStyle.Minimalist]: 'Focus on simplicity and clean lines'
  };

  const checkAIStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/v1/PromptMutation/status`);
      setAiStatus({
        available: response.data.openAIAvailable,
        message: response.data.message
      });
    } catch (error) {
      console.error('Failed to check AI status:', error);
      setAiStatus({
        available: false,
        message: 'AI service unavailable'
      });
    }
  }, [apiUrl]);

  const fetchSuggestions = useCallback(async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/v1/PromptMutation/suggestions?prompt=${encodeURIComponent(originalPrompt)}&style=${selectedStyle}`
      );
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  }, [apiUrl, originalPrompt, selectedStyle]);

  useEffect(() => {
    if (originalPrompt && showPanel) {
      fetchSuggestions();
    }
  }, [originalPrompt, selectedStyle, showPanel, fetchSuggestions]);

  useEffect(() => {
    checkAIStatus();
  }, [checkAIStatus]);

  const mutatePrompt = async () => {
    if (!originalPrompt.trim()) return;

    setLoading(true);
    try {
      const request: PromptMutationRequest = {
        originalPrompt,
        style: selectedStyle,
        creativityLevel,
        additionalContext: ''
      };

      const response = await axios.post(`${apiUrl}/api/v1/PromptMutation/mutate`, request);
      
      const mutationData: PromptMutationResponse = response.data;
      
      setMutatedPrompt(mutationData.mutatedPrompt);
      setMutationResponse(mutationData);
      onPromptMutated(mutationData.mutatedPrompt, selectedStyle);
    } catch (error) {
      console.error('Failed to mutate prompt:', error);
      alert('Failed to mutate prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    const enhancedPrompt = `${originalPrompt}, ${suggestion}`;
    setMutatedPrompt(enhancedPrompt);
    onPromptMutated(enhancedPrompt, selectedStyle);
  };

  const resetMutation = () => {
    setMutatedPrompt('');
    setMutationResponse(null);
    onPromptMutated(originalPrompt, selectedStyle);
  };

  return (
    <div className={`prompt-mutation-panel ${theme}`}>
      <div className="mutation-header">
        <div className="header-content">
          <h3>🎨 Prompt Enhancement</h3>
          <div className={`ai-status ${aiStatus.available ? 'ai-active' : 'ai-fallback'}`}>
            <span className="status-indicator">
              {aiStatus.available ? '🤖' : '⚙️'}
            </span>
            <span className="status-text">{aiStatus.message}</span>
          </div>
        </div>
        <button 
          className="toggle-btn"
          onClick={() => setShowPanel(!showPanel)}
        >
          {showPanel ? '−' : '+'}
        </button>
      </div>

      {showPanel && (
        <div className="mutation-content">
          <div className="original-prompt">
            <label>Original Prompt:</label>
            <p className="prompt-text">{originalPrompt}</p>
          </div>

          <div className="style-selection">
            <label>Enhancement Style:</label>
            <div className="style-grid">
              {Object.values(MutationStyle).map((style) => (
                <button
                  key={style}
                  className={`style-btn ${selectedStyle === style ? 'active' : ''}`}
                  onClick={() => setSelectedStyle(style)}
                  title={styleDescriptions[style]}
                >
                  {style}
                </button>
              ))}
            </div>
            <p className="style-description">{styleDescriptions[selectedStyle]}</p>
          </div>

          <div className="creativity-control">
            <label>Creativity Level: {creativityLevel}</label>
            <input
              type="range"
              min="1"
              max="10"
              value={creativityLevel}
              onChange={(e) => setCreativityLevel(Number(e.target.value))}
              className="creativity-slider"
            />
            <div className="creativity-labels">
              <span>Conservative</span>
              <span>Creative</span>
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="suggestions">
              <label>Quick Suggestions:</label>
              <div className="suggestion-buttons">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-btn"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mutation-actions">
            <button
              className="mutate-btn"
              onClick={mutatePrompt}
              disabled={loading || !originalPrompt.trim()}
            >
              {loading ? 'Enhancing...' : '✨ Enhance Prompt'}
            </button>
            
            {mutatedPrompt && (
              <button className="reset-btn" onClick={resetMutation}>
                🔄 Reset
              </button>
            )}
          </div>

          {mutationResponse && (
            <div className="mutation-result">
              <label>Enhanced Prompt:</label>
              <div className="mutated-prompt">
                <p>{mutationResponse.mutatedPrompt}</p>
              </div>
              
              <div className="mutation-details">
                <p><strong>Style:</strong> {mutationResponse.appliedStyle}</p>
                <p><strong>Creativity:</strong> {mutationResponse.creativityLevel}/10</p>
                <p><strong>Added Elements:</strong> {mutationResponse.addedElements.join(', ')}</p>
                <p><strong>Enhancement:</strong> {mutationResponse.mutationExplanation}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptMutationPanel;
