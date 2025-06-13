import React, { useState } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from '@emotion/css';
import { Button, IconButton, Input, useStyles2, LoadingPlaceholder } from '@grafana/ui';
import { PanelDataErrorView } from '@grafana/runtime';

interface Props extends PanelProps<SimpleOptions> {}

interface LLMResponse {
  response: string;
  model_used: string;
  timestamp: string;
}

interface ServerResponse {
  status: string;
  message: string;
  llm_response?: LLMResponse;
  received_at: string;
}

const getStyles = () => {
  return {
    wrapper: css`
      font-family: Open Sans;
      position: relative;
      padding: 20px;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `,
    inputContainer: css`
      margin-bottom: 16px;
      flex-shrink: 0;
    `,
    input: css`
      margin-bottom: 8px;
      width: 100%;
    `,
    buttonContainer: css`
      display: flex;
      gap: 8px;
      align-items: center;
    `,
    error: css`
      color: red;
      margin-top: 8px;
    `,
    responseContainer: css`
      margin-top: 16px;
      padding: 16px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      overflow-y: auto;
      flex-grow: 1;
      width: calc(100% - 32px);
      position: relative;
    `,
    responseText: css`
      margin-bottom: 8px;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 14px;
      line-height: 1.5;
    `,
    modelInfo: css`
      font-size: 0.8em;
      color: #666;
      margin-top: 8px;
      border-top: 1px solid rgba(204, 204, 220, 0.15);
      padding-top: 8px;
    `,
    scrollContainer: css`
      overflow-y: auto;
      height: 100%;
      padding-right: 8px;
      margin-right: -8px;
    `,
    clearButton: css`
      position: absolute;
      top: 8px;
      right: 8px;
      opacity: 0.7;
      &:hover {
        opacity: 1;
      }
    `,
    loadingContainer: css`
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100px;
    `
  };
};

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, id }) => {
  const styles = useStyles2(getStyles);
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [llmResponse, setLLMResponse] = useState<LLMResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getDashboardUIDFromURL = (): string => {
    const path = window?.location?.pathname || '';
    const matches = path.match(/\/d\/([^/]+)/);
    return matches?.[1] || 'unknown';
  };

  const handleClear = () => {
    setInputText('');
    setError(null);
    setLLMResponse(null);
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLLMResponse(null);

    try {
      if (!options.backendUrl) {
        throw new Error('Backend URL is not configured');
      }

      console.log('Backend URL:', options.backendUrl);
      console.log('Full request URL:', options.backendUrl);

      const dashboardInfo = {
        dashboardId: getDashboardUIDFromURL(),
        panelId: id,
        dashboardTitle: document.title,
      };

      const payload = {
        text: inputText,
        dashboard: dashboardInfo,
        timestamp: new Date().toISOString(),
      };

      console.log('Sending payload:', payload);

      const response = await fetch(options.backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data: ServerResponse = await response.json();

      if (!response.ok) {
        throw new Error(`Failed to send data to server: ${data.message || 'Unknown error'}`);
      }

      if (!data.llm_response) {
        throw new Error('Server response missing LLM data');
      }

      setLLMResponse(data.llm_response);
      setInputText('');
      
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      setError(error.message || 'An unexpected error occurred');
      setLLMResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (data.series.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />;
  }

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
      onLoad={() => console.log('Panel wrapper div loaded')}
    >
      <div className={styles.scrollContainer}>
        <div className={styles.inputContainer}>
          <label>{options.inputLabel || 'Enter text:'}</label>
          <Input
            className={styles.input}
            value={inputText}
            onChange={(e) => {
              setInputText(e.currentTarget.value);
            }}
            // onFocus={() => console.log('Input focused')}
            placeholder="Type your message here..."
            disabled={isLoading}
          />
          <div className={styles.buttonContainer}>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
            {error && <div className={styles.error}>{error}</div>}
          </div>
        </div>
        {isLoading && (
          <div className={styles.loadingContainer}>
            <LoadingPlaceholder text="Getting response..." />
          </div>
        )}
        {!isLoading && llmResponse && (
          <div className={styles.responseContainer}>
            <IconButton
              className={styles.clearButton}
              name="times"
              onClick={handleClear}
              tooltip="Clear message"
            />
            <div className={styles.responseText}>
              {llmResponse.response || 'No response content'}
            </div>
            <div className={styles.modelInfo}>
              Model: {llmResponse.model_used || 'Unknown'}
              <br />
              Time: {new Date(llmResponse.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
