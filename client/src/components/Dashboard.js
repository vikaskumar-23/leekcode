/**
 * Dashboard component for displaying available coding problems
 * Includes problem list and logout functionality
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Get API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Dashboard() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [error, setError] = useState('');

  // Fetch problems on component mount
  useEffect(() => {
    const fetchProblems = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${API_URL}/api/problems`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProblems(response.data);
        setError(''); // Clear any previous errors
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Failed to fetch problems');
        }
      }
    };
    fetchProblems();
  }, [navigate]);

  // Handle user logout
  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      setError('Logout failed. Please try again.');
    }
  };

  return (
    <div className="container">
      {/* Header with Logout Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Problems</h2>
        <button 
          className="btn btn-outline-danger"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Problems Grid */}
      <div className="row">
        {problems.map(problem => (
          <div key={problem._id} className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{problem.title}</h5>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/problem/${problem._id}`)}
                >
                  Solve
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard; 