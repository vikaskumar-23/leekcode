/**
 * Problem component for displaying and solving coding problems
 * Includes code editor, execution, and submission functionality
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import Editor from '@monaco-editor/react';

// Register C++ language for syntax highlighting
SyntaxHighlighter.registerLanguage('cpp', cpp);

// Get API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Default C++ template
const DEFAULT_CODE = `#include <iostream>
using namespace std;

int main() {
    // Your code here
    
    return 0;
}`;

function Problem() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [judgeResult, setJudgeResult] = useState(null);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTestIndex, setSelectedTestIndex] = useState(0);
  const [testResults, setTestResults] = useState([]);
  const [customResult, setCustomResult] = useState(null);
  const saveTimeout = useRef(null);
  const lastSavedCode = useRef('');

  // Fetch problem details
  const fetchProblem = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/problems/${id}`);
      setProblem(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching problem:', err);
      setError('Failed to fetch problem. Please try again.');
    }
  }, [id]);

  // Fetch problem on component mount
  useEffect(() => {
    fetchProblem();
  }, [fetchProblem]);

  // Load saved code for this problem on mount
  useEffect(() => {
    const fetchSavedCode = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/get-code/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.code && res.data.code.trim() !== '') {
          setCode(res.data.code);
          lastSavedCode.current = res.data.code;
        } else {
          // No saved code, use problem's defaultCode or DEFAULT_CODE
          if (problem && problem.defaultCode) {
            setCode(problem.defaultCode);
            lastSavedCode.current = problem.defaultCode;
          } else {
            setCode(DEFAULT_CODE);
            lastSavedCode.current = DEFAULT_CODE;
          }
        }
      } catch (err) {
        // If error (e.g. not logged in), fallback to default code
        if (problem && problem.defaultCode) {
          setCode(problem.defaultCode);
          lastSavedCode.current = problem.defaultCode;
        } else {
          setCode(DEFAULT_CODE);
          lastSavedCode.current = DEFAULT_CODE;
        }
      }
    };
    fetchSavedCode();
    // eslint-disable-next-line
  }, [id, problem]);

  // Auto-save code on change (debounced)
  useEffect(() => {
    if (code === lastSavedCode.current) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/api/save-code`, {
          problemId: id,
          code
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        lastSavedCode.current = code;
      } catch (err) {
        // Optionally show error
      }
    }, 1000); // 1 second debounce
    return () => clearTimeout(saveTimeout.current);
    // eslint-disable-next-line
  }, [code, id]);

  // Handle code execution and judging
  const handleJudge = async () => {
    setIsRunning(true);
    setError('');
    setJudgeResult(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/local-judge`, {
        code,
        input,
        expectedOutput
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setJudgeResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to judge code.');
    } finally {
      setIsRunning(false);
    }
  };

  // Run all premade test cases
  const handleRunAll = async () => {
    setIsRunning(true);
    setTestResults([]);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const results = [];
      for (const testCase of problem.testCases || []) {
        const response = await axios.post(`${API_URL}/api/local-judge`, {
          code,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        results.push(response.data);
      }
      setTestResults(results);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to run test cases.');
    } finally {
      setIsRunning(false);
    }
  };

  // Run a single premade test case
  const handleRunSingle = async (idx) => {
    setIsRunning(true);
    setError('');
    setSelectedTestIndex(idx);
    try {
      const token = localStorage.getItem('token');
      const testCase = problem.testCases[idx];
      const response = await axios.post(`${API_URL}/api/local-judge`, {
        code,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newResults = [...testResults];
      newResults[idx] = response.data;
      setTestResults(newResults);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to run test case.');
    } finally {
      setIsRunning(false);
    }
  };

  // Run custom test case
  const handleRunCustom = async () => {
    setIsRunning(true);
    setCustomResult(null);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/local-judge`, {
        code,
        input,
        expectedOutput
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to run custom test case.');
    } finally {
      setIsRunning(false);
    }
  };

  if (!problem) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container" style={{ maxWidth: '100vw', padding: 0 }}>
      {/* Top split: Problem (left) and Code Editor (right) */}
      <div style={{ display: 'flex', height: 'calc(100vh - 40px)', borderBottom: '2px solid #e0e0e0' }}>
        {/* Problem Description Section */}
        <div className="problem-statement" style={{ width: '40%', height: '100%', overflowY: 'auto', borderRight: '1px solid #e0e0e0', borderRadius: 0 }}>
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
        <div style={{ width: '60%', height: '100%', background: '#181818', borderRadius: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Editor
            height="100%"
            defaultLanguage="cpp"
            language="cpp"
            value={code}
            onChange={value => setCode(value || '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              formatOnType: true,
              formatOnPaste: true,
              tabSize: 4,
              lineNumbers: 'on',
              autoIndent: 'full',
              matchBrackets: 'always',
              renderLineHighlight: 'all',
              contextmenu: true,
              folding: true,
              scrollbar: { vertical: 'auto' }
            }}
          />
        </div>
      </div>
      {/* Test Cases/Results Section (full width, always visible) */}
      <div style={{ width: '100%', minHeight: 200, background: '#23272e', color: '#fff', padding: '24px 32px', boxSizing: 'border-box' }}>
        <div className="premade-tests">
          <h5 style={{ color: '#fff' }}>Test Cases</h5>
          {problem.testCases && problem.testCases.length > 0 ? (
            <div>
              {problem.testCases.map((tc, idx) => (
                <div key={idx} className="card mb-2" style={{ background: '#23272e', color: '#fff', border: '1px solid #444' }}>
                  <div className="card-body p-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Input:</strong> <pre style={{ display: 'inline', color: '#b5cea8' }}>{tc.input}</pre>
                        <br />
                        <strong>Expected:</strong> <pre style={{ display: 'inline', color: '#dcdcaa' }}>{tc.expectedOutput}</pre>
                      </div>
                      <button className="btn btn-outline-success btn-sm ms-2" onClick={() => handleRunSingle(idx)} disabled={isRunning}>
                        Run
                      </button>
                    </div>
                    {testResults[idx] && (
                      <div className="mt-2">
                        <strong>Output:</strong> <pre style={{ display: 'inline', color: '#9cdcfe' }}>{testResults[idx].output}</pre>
                        <br />
                        <strong>Match:</strong> {testResults[idx].match ? (
                          <span className="text-success">✔</span>
                        ) : (
                          <span className="text-danger">✘</span>
                        )}
                        {testResults[idx].error && (
                          <div className="text-danger">Error: {testResults[idx].error}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>No test cases available.</div>
          )}
        </div>
        {/* Custom Test Case */}
        <div className="custom-test mt-4">
          <h5 style={{ color: '#fff' }}>Custom Test Case</h5>
          <label className="form-label">Input:</label>
          <textarea
            className="form-control mb-2"
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter input for your code (one per line)"
          />
          <label className="form-label">Expected Output:</label>
          <textarea
            className="form-control mb-2"
            rows={2}
            value={expectedOutput}
            onChange={e => setExpectedOutput(e.target.value)}
            placeholder="Enter expected output to auto-judge"
          />
          <button className="btn btn-primary mt-2" onClick={handleRunCustom} disabled={isRunning}>
            Run Custom Test
          </button>
          {customResult && (
            <div className="output-section mt-3">
              <strong>Output:</strong> <pre style={{ display: 'inline', color: '#9cdcfe' }}>{customResult.output}</pre>
              <br />
              <strong>Match:</strong> {customResult.match ? (
                <span className="text-success">✔</span>
              ) : (
                <span className="text-danger">✘</span>
              )}
              {customResult.error && (
                <div className="text-danger">Error: {customResult.error}</div>
              )}
            </div>
          )}
        </div>
        {/* Error Display */}
        {error && (
          <div className="text-danger mt-2">
            {error}
          </div>
        )}
        {/* Run All Button at Bottom */}
        <div style={{ width: '100%', background: '#23272e', borderTop: '1px solid #444', padding: '10px 0', textAlign: 'center', marginTop: 24 }}>
          <button className="btn btn-outline-primary" onClick={handleRunAll} disabled={isRunning || !problem.testCases?.length}>
            Run All
          </button>
        </div>
      </div>
    </div>
  );
}

export default Problem; 