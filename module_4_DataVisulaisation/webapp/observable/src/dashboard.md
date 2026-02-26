---
title: EOA Metrics Dashboard
---

# EOA Metrics Dashboard

<style>
  :root {
    --primary: #4361ee;
    --primary-light: #4895ef;
    --secondary: #3f37c9;
    --success: #4cc9f0;
    --dark: #212529;
    --light: #f8f9fa;
    --gray-100: #f8f9fa;
    --gray-200: #e9ecef;
    --gray-300: #dee2e6;
    --gray-400: #ced4da;
    --gray-500: #adb5bd;
    --gray-600: #6c757d;
    --gray-700: #495057;
    --gray-800: #343a40;
    --gray-900: #212529;
    --border-radius: 8px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08);
    --shadow-lg: 0 10px 25px rgba(0,0,0,0.1), 0 5px 10px rgba(0,0,0,0.05);
    --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .dashboard-container {
    max-width: 1400px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }

  .dashboard-header {
    background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
    color: white;
    padding: 2rem;
    text-align: center;
  }

  .dashboard-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .dashboard-header p {
    font-size: 1.1rem;
    opacity: 0.9;
  }

  .node-info-section {
    padding: 1.5rem 2rem;
    background: var(--gray-100);
    border-bottom: 1px solid var(--gray-300);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .node-display {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1.1rem;
  }

  .node-id {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary);
    background: white;
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
  }

  .back-button {
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: var(--border-radius);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    text-decoration: none;
    display: inline-block;
  }

  .back-button:hover {
    background: linear-gradient(135deg, var(--primary-light), var(--primary));
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .metrics-overview {
    padding: 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .metric-card {
    background: white;
    padding: 1.5rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    border-left: 4px solid var(--primary);
    transition: var(--transition);
  }

  .metric-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .metric-card h3 {
    font-size: 1rem;
    color: var(--gray-600);
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .metric-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 0.5rem;
  }

  .metric-label {
    font-size: 0.9rem;
    color: var(--gray-500);
  }

  .overall-metric {
    grid-column: 1 / -1;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-align: center;
  }

  .overall-metric .metric-value {
    color: white;
    font-size: 3rem;
  }

  .overall-metric .metric-label {
    color: rgba(255, 255, 255, 0.9);
  }

  .charts-section {
    padding: 0 2rem 2rem;
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .chart-container {
    background: white;
    padding: 1.5rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--gray-200);
  }

  .chart-container h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--gray-800);
    margin-bottom: 1rem;
    text-align: center;
  }

  .chart-plot {
    width: 100%;
    height: 300px;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: var(--gray-600);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--gray-300);
    border-top: 4px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error-message {
    display: none;
    background: #fee;
    color: #c33;
    padding: 1rem;
    border-radius: var(--border-radius);
    border-left: 4px solid #c33;
    margin: 1rem 2rem;
  }

  /* Bar chart styling */
  .bar {
    fill: var(--primary);
    transition: var(--transition);
  }

  .bar:hover {
    fill: var(--primary-light);
    filter: brightness(1.1);
  }

  .axis text {
    font-size: 12px;
    fill: var(--gray-600);
  }

  .axis path,
  .axis line {
    fill: none;
    stroke: var(--gray-300);
    shape-rendering: crispEdges;
  }

  .axis-label {
    font-size: 12px;
    fill: var(--gray-600);
  }

  .tooltip {
    position: absolute;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    pointer-events: none;
    z-index: 1000;
  }

  .no-data {
    text-align: center;
    color: var(--gray-500);
    padding: 2rem;
    font-style: italic;
  }

  .chart-canvas {
    width: 100%;
    height: 100%;
    display: block;
  }

  @media (max-width: 768px) {
    .dashboard-container {
      margin: 10px;
      border-radius: 8px;
    }

    .dashboard-header {
      padding: 1.5rem 1rem;
    }

    .dashboard-header h1 {
      font-size: 2rem;
    }

    .node-info-section {
      padding: 1rem;
      flex-direction: column;
      align-items: stretch;
    }

    .charts-grid {
      grid-template-columns: 1fr;
    }

    .metrics-overview {
      padding: 1rem;
      grid-template-columns: 1fr;
    }
  }
</style>

<div class="dashboard-container">
  <header class="dashboard-header">
    <h1>EOA Metrics Dashboard</h1>
    <p>Detailed metrics for selected Ethereum account</p>
  </header>

  <section class="node-info-section">
    <div class="node-display">
      <span>Viewing metrics for Node ID:</span>
      <div class="node-id" id="currentNodeId">Loading...</div>
    </div>
    <a href="javascript:history.back()" class="back-button">← Back to Previous Page</a>
  </section>

  <div class="loading" id="loadingIndicator">
    <div class="loading-spinner"></div>
    <p>Loading metrics data...</p>
  </div>

  <div class="error-message" id="errorMessage"></div>

  <section class="metrics-overview" id="metricsOverview">
    <div class="metric-card overall-metric">
      <h3>Overall Average Score</h3>
      <div class="metric-value" id="overallAvgValue">-</div>
      <div class="metric-label">Average across all nodes</div>
    </div>
  </section>

  <section class="charts-section">
    <div class="charts-grid">
      <div class="chart-container">
        <h3>Liveness Metrics</h3>
        <div id="livenessChart" class="chart-plot">
          <div class="no-data">Chart will load shortly...</div>
        </div>
      </div>
      
      <div class="chart-container">
        <h3>Popularity Metrics</h3>
        <div id="popularityChart" class="chart-plot">
          <div class="no-data">Chart will load shortly...</div>
        </div>
      </div>
      
      <div class="chart-container">
        <h3>Diversification Metrics</h3>
        <div id="diversificationChart" class="chart-plot">
          <div class="no-data">Chart will load shortly...</div>
        </div>
      </div>
    </div>
  </section>
</div>

<script>
  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing dashboard...');
    
    // Configuration
    const API_BASE = 'http://gridnode4.iit.cnr.it:3000/dre';
    const APIS = {
      liveness: `${API_BASE}/eoa-liveness?address=&timeInterval=&sample=&type=`,
      popularity: `${API_BASE}/eoa-popularity?address=&timeInterval=&sample=`,
      diversification: `${API_BASE}/eoa-diversification?address=&timeInterval=&sample=&recvType=`,
      overallAvg: `${API_BASE}/eoa-overall-avg?address=&sample=&type=`
    };

    // DOM Elements - wait for them to be available
    const currentNodeIdElement = document.getElementById('currentNodeId');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    const overallAvgValue = document.getElementById('overallAvgValue');
    const livenessChart = document.getElementById('livenessChart');
    const popularityChart = document.getElementById('popularityChart');
    const diversificationChart = document.getElementById('diversificationChart');

    console.log('DOM elements:', {
      currentNodeIdElement,
      loadingIndicator,
      errorMessage,
      overallAvgValue,
      livenessChart,
      popularityChart,
      diversificationChart
    });

    // Get nodeId from URL parameters
    function getNodeIdFromURL() {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('nodeId') || urlParams.get('id') || '37028167';
    }

    // Initialize
    const nodeId = getNodeIdFromURL();
    if (currentNodeIdElement) {
      currentNodeIdElement.textContent = nodeId;
    }
    
    // Start data fetching
    fetchData(nodeId);

    // Main data fetching function
    async function fetchData(nodeId) {
      showLoading(true);
      hideError();

      try {
        console.log('Fetching data from APIs...');
        
        // Fetch all APIs in parallel
        const [livenessData, popularityData, diversificationData] = await Promise.all([
          fetchAPIData(APIS.liveness),
          fetchAPIData(APIS.popularity),
          fetchAPIData(APIS.diversification)
        ]);

        console.log('Data fetched:', {
          livenessData,
          popularityData,
          diversificationData
        });

        const currentData = {
          liveness: livenessData,
          popularity: popularityData,
          diversification: diversificationData,
          overallAvg: 12, // Hardcoded as per your file
          nodeId: nodeId
        };

        renderDashboard(currentData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        showError(`Failed to fetch data for node ${nodeId}: ${error.message}. Please check the console for details.`);
      } finally {
        showLoading(false);
      }
    }

    // Generic API fetch function
    async function fetchAPIData(url) {
      console.log('Fetching from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    }

    // Render the entire dashboard
    function renderDashboard(data) {
      console.log('Rendering dashboard with data:', data);
      renderOverallAverage(data.overallAvg);
      
      // Wait a bit to ensure DOM is ready for charts
      setTimeout(() => {
        renderSimpleBarChart('livenessChart', data.liveness, 'Liveness Metrics');
        renderSimpleBarChart('popularityChart', data.popularity, 'Popularity Metrics');
        renderSimpleBarChart('diversificationChart', data.diversification, 'Diversification Metrics');
      }, 100);
    }

    // Render overall average value
    function renderOverallAverage(avgData) {
      if (!overallAvgValue) {
        console.error('overallAvgValue element not found');
        return;
      }
      
      let avgValue = '-';
      
      if (typeof avgData === 'number') {
        avgValue = avgData.toFixed(2);
      } else if (avgData && typeof avgData === 'object') {
        avgValue = avgData.value || avgData.average || avgData.avg || '-';
        if (typeof avgValue === 'number') {
          avgValue = avgValue.toFixed(2);
        }
      }
      
      overallAvgValue.textContent = avgValue;
      console.log('Set overall average to:', avgValue);
    }

    // Simple bar chart renderer using Canvas
    function renderSimpleBarChart(containerId, data, title) {
      console.log(`Rendering chart for ${containerId} with data:`, data);
      
      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
      }

      // Clear container safely
      container.innerHTML = '';

      if (!data || Object.keys(data).length === 0) {
        const noDataMsg = document.createElement('div');
        noDataMsg.className = 'no-data';
        noDataMsg.textContent = 'No data available';
        container.appendChild(noDataMsg);
        console.log(`No data for ${containerId}`);
        return;
      }

      // Prepare data for chart
      const chartData = Object.entries(data).map(([key, value]) => ({
        metric: key,
        value: typeof value === 'number' ? value : 0
      }));

      // Create canvas for chart
      const canvas = document.createElement('canvas');
      canvas.className = 'chart-canvas';
      canvas.width = container.clientWidth || 400;
      canvas.height = 300;
      container.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      
      // Chart dimensions
      const margin = { top: 40, right: 30, bottom: 60, left: 60 };
      const width = canvas.width - margin.left - margin.right;
      const height = canvas.height - margin.top - margin.bottom;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate scales
      const maxValue = Math.max(...chartData.map(d => d.value));
      const barWidth = (width / chartData.length) * 0.7;
      const xScale = width / chartData.length;
      const yScale = height / (maxValue || 1);

      // Draw bars
      chartData.forEach((d, i) => {
        const x = margin.left + (i * xScale) + (xScale * 0.15);
        const barHeight = d.value * yScale;
        const y = margin.top + height - barHeight;

        // Draw bar
        ctx.fillStyle = '#4361ee';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Draw value label
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(d.value.toFixed(2), x + barWidth / 2, y - 8);

        // Draw metric label
        ctx.fillStyle = '#6c757d';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(d.metric, x + barWidth / 2, margin.top + height + 15);
      });

      // Draw axes
      ctx.strokeStyle = '#dee2e6';
      ctx.lineWidth = 1;

      // Y-axis
      ctx.beginPath();
      ctx.moveTo(margin.left, margin.top);
      ctx.lineTo(margin.left, margin.top + height);
      ctx.stroke();

      // X-axis
      ctx.beginPath();
      ctx.moveTo(margin.left, margin.top + height);
      ctx.lineTo(margin.left + width, margin.top + height);
      ctx.stroke();

      // Draw Y-axis grid lines
      ctx.strokeStyle = '#f8f9fa';
      ctx.lineWidth = 1;
      const gridLines = 5;
      for (let i = 0; i <= gridLines; i++) {
        const y = margin.top + (i * height / gridLines);
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(margin.left + width, y);
        ctx.stroke();
      }

      // Draw axis labels
      ctx.fillStyle = '#6c757d';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      
      // Y-axis label
      ctx.save();
      ctx.translate(15, margin.top + height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Value', 0, 0);
      ctx.restore();

      // X-axis label
      ctx.fillText('Metrics', margin.left + width / 2, margin.top + height + 40);

      console.log(`Chart rendered for ${containerId}`);
    }

    // UI helper functions
    function showLoading(show) {
      if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'flex' : 'none';
        console.log('Loading indicator:', show ? 'shown' : 'hidden');
      }
    }

    function showError(message) {
      if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        console.log('Error message shown:', message);
      }
    }

    function hideError() {
      if (errorMessage) {
        errorMessage.style.display = 'none';
      }
    }
  });
</script>
