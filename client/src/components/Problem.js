/**
 * Problem component for displaying and solving coding problems
 * Includes code editor, execution, and submission functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// Register C++ language for syntax highlighting
SyntaxHighlighter.registerLanguage('cpp', cpp);

// Configure axios to include credentials
axios.defaults.withCredentials = true;

function Problem() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  // Default C++ template
  const defaultCode = `#include <iostream>
using namespace std;

int main() {
    // Your code here
    
    return 0;
}`;

  // Fetch problem details
  const fetchProblem = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/problems/${id}`);
      setProblem(response.data);
      setCode(defaultCode);
    } catch (err) {
      setError('Failed to fetch problem');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  }, [id, navigate, defaultCode]);

  // Fetch problem on component mount
  useEffect(() => {
    fetchProblem();
  }, [fetchProblem]);

  // Handle code submission
  const handleSubmit = async () => {
    try {
      setError('');
      const response = await axios.post('http://localhost:5000/api/submit', { code });
      setOutput(response.data.code);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please login to submit code');
        navigate('/login');
      } else {
        setError('Failed to submit code. Please try again.');
      }
    }
  };

  // Handle code execution
  const handleRun = async () => {
    try {
      setIsRunning(true);
      setError('');
      setExecutionResult(null);
      
      const response = await axios.post('http://localhost:5000/api/execute', { code });
      setExecutionResult(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please login to run code');
        navigate('/login');
      } else {
        setError('Failed to run code. Please try again.');
      }
    } finally {
      setIsRunning(false);
    }
  };

  if (!problem) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="problem-layout">
        {/* Problem Description Section */}
        <div className="problem-statement">
          <h2>{problem.title}</h2>
          <div className="problem-description">
            {problem.description.split('\n').map((line, index) => (
              <p key={index} className={line.startsWith('Example') ? 'example-header' : ''}>
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Code Editor Section */}
        <div className="code-editor">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
            className="code-input"
          />
          
          {/* Action Buttons */}
          <div className="d-flex align-items-center gap-3 mt-3">
            <button
              className="btn btn-success"
              onClick={handleRun}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run'}
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              Submit
            </button>
            {showSuccess && (
              <div className="text-success d-flex align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-check-circle-fill me-2" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>
                Code submitted successfully!
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="text-danger mt-2">
              {error}
            </div>
          )}

          {/* Execution Results */}
          {executionResult && (
            <div className="output-section mt-3">
              <h4>Execution Results:</h4>
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Output:</h5>
                  <pre className="mb-3">{executionResult.output || 'No output'}</pre>
                  <div className="d-flex gap-3">
                    <div>
                      <strong>Status Code:</strong> {executionResult.statusCode}
                    </div>
                    <div>
                      <strong>Memory:</strong> {executionResult.memory} KB
                    </div>
                    <div>
                      <strong>CPU Time:</strong> {executionResult.cpuTime} sec
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submission Output */}
          {output && (
            <div className="output-section mt-3">
              <h4>Submission Output:</h4>
              <SyntaxHighlighter
                language="cpp"
                style={docco}
                customStyle={{
                  margin: 0,
                  padding: '15px',
                  background: '#f8f9fa',
                  borderRadius: '4px'
                }}
              >
                {output}
              </SyntaxHighlighter>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Problem; 