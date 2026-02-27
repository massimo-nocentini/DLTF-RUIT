---
title: Network Graph Visualization
---

# Network Graph Visualization

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

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: var(--gray-800);
    background-color: #f5f7fa;
    line-height: 1.6;
    margin: 0;
    padding: 0;
  }

  #graph-container {
    display: flex;
    height: 700px;
    border: 1px solid var(--gray-300);
    margin: 20px;
    padding: 0;
    border-radius: var(--border-radius);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    background: white;
  }
  
  #graph-svg {
    flex: 2;
    min-width: 0;
    background: var(--gray-100);
  }
  
  #side-panel {
    flex: 1;
    min-width: 350px;
    padding: 1.5rem;
    background: #fff;
    border-left: 1px solid var(--gray-300);
    overflow-y: auto;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 14px;
  }
  
  .detail-section {
    margin-bottom: 1.8rem;
    padding-bottom: 1.2rem;
    border-bottom: 1px solid var(--gray-200);
  }
  
  .detail-title {
    font-weight: 600;
    margin-bottom: 0.8rem;
    font-size: 15px;
    color: var(--gray-800);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .detail-title svg {
    width: 16px;
    height: 16px;
  }
  
  .detail-item {
    display: flex;
    margin-bottom: 0.6rem;
  }
  
  .detail-label {
    font-weight: 500;
    min-width: 100px;
    color: var(--gray-600);
  }
  
  .detail-value {
    color: var(--gray-800);
    word-break: break-all;
  }
  
  .node-type-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    margin-left: 0.5rem;
  }
  
  .node-type-eoa {
    background-color: rgba(67, 97, 238, 0.1);
    color: var(--primary);
  }
  
  .node-type-sc {
    background-color: rgba(76, 201, 240, 0.1);
    color: var(--success);
  }
  
  .plot-container {
    height: 220px;
    margin-top: 1.2rem;
    background: var(--gray-100);
    padding: 0.75rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
  }
  
  .average-metric {
    font-size: 1.1rem;
    padding: 1rem;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
    border-radius: var(--border-radius);
    text-align: center;
    margin: 1.2rem 0;
    box-shadow: var(--shadow-sm);
    border-left: 4px solid var(--primary);
  }
  
  .plot svg {
    display: block;
    margin: 0 auto;
    width: 100%;
  }
  
  .bar {
    fill: var(--primary);
    transition: var(--transition);
  }
  
  .bar:hover {
    fill: var(--primary-light);
    filter: brightness(1.1);
  }
  
  .axis text {
    font-size: 11px;
    fill: var(--gray-600);
  }
  
  .axis path,
  .axis line {
    fill: none;
    stroke: var(--gray-300);
    shape-rendering: crispEdges;
  }
  
  text {
    font-size: 12px;
  }
  
  .connections-list {
    list-style: none;
    padding-left: 0;
    margin-top: 0.5rem;
  }
  
  .connection-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    background: var(--gray-100);
    border-radius: 4px;
    font-size: 0.9rem;
    transition: var(--transition);
  }
  
  .connection-item:hover {
    background: var(--gray-200);
  }
  
  .connection-direction {
    margin: 0 0.5rem;
    color: var(--gray-500);
  }
  
  .connection-type {
    margin-left: auto;
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    background: var(--gray-200);
    border-radius: 4px;
    color: var(--gray-700);
  }
  
  .loading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    color: var(--gray-500);
  }
  
  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--gray-300);
    border-top: 2px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Graph styling */
  .node {
    stroke: #fff;
    stroke-width: 2px;
    transition: var(--transition);
    cursor: pointer;
  }
  
  .node:hover {
    stroke: var(--primary-light);
    stroke-width: 3px;
    filter: brightness(1.1);
  }
  
  .node-center {
    fill: #ff7f0e;
  }
  
  .node-eoa {
    fill: #4361ee;
  }
  
  .node-sc {
    fill: #4cc9f0;
  }
  
  .link {
    stroke: #999;
    stroke-width: 2;
    stroke-opacity: 0.6;
    cursor: pointer;
    transition: var(--transition);
  }
  
  .link:hover {
    stroke: var(--primary);
    stroke-opacity: 0.9;
    stroke-width: 3;
  }
  
  .node-label {
    font-size: 11px;
    font-weight: 500;
    text-anchor: middle;
    pointer-events: none;
    fill: var(--gray-800);
    text-shadow: 0 1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff, 0 -1px 0 #fff;
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--gray-300);
  }
  
  .panel-header h3 {
    font-weight: 600;
    color: var(--gray-800);
  }
  
  .panel-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--gray-500);
    text-align: center;
  }
  
  .panel-placeholder svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .navigation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: var(--gray-100);
    border-radius: var(--border-radius);
    border-left: 4px solid var(--primary);
  }

  .nav-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .nav-button {
    padding: 0.5rem 1rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: var(--transition);
  }

  .nav-button:hover:not(:disabled) {
    background: var(--primary-light);
    transform: translateY(-1px);
  }

  .nav-button:disabled {
    background: var(--gray-400);
    cursor: not-allowed;
    opacity: 0.6;
  }

  .current-node {
    font-weight: 600;
    color: var(--primary);
    font-size: 1.1rem;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .breadcrumb-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .breadcrumb-link {
    color: var(--primary);
    text-decoration: none;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: var(--transition);
  }

  .breadcrumb-link:hover {
    background: var(--gray-200);
  }

  .breadcrumb-separator {
    color: var(--gray-500);
  }
</style>

<div id="graph-container">
  <div id="graph-svg"></div>
  <div id="side-panel">
    <div class="panel-header">
      <h3>Details</h3>
    </div>
    <div class="navigation-header">
      <div class="nav-buttons">
        <button id="nav-back" class="nav-button" disabled>← Back</button>
        <button id="nav-forward" class="nav-button" disabled>Forward →</button>
      </div>
      <div class="current-node">Current: <span id="current-node-id">15</span></div>
    </div>
    <div id="breadcrumb" class="breadcrumb"></div>
    <div class="panel-placeholder">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
      <p>Click on any node or link to view details</p>
    </div>
  </div>
</div>

<script type="module">
const d3 = await import("https://cdn.jsdelivr.net/npm/d3@7/+esm");

// ======================
// 1. API CONFIGURATION & STATE MANAGEMENT
// ======================

const WEBGRAPH_API_BASE = 'http://gridnode4.iit.cnr.it:8800/webgraph-api';
const DRE_API_BASE = 'http://gridnode4.iit.cnr.it:3000/dre';

// Navigation state
const navigationState = {
  history: ['15'], // Start with node 15
  currentIndex: 0,
  maxHistory: 10 // Limit history size
};

// ======================
// 2. NAVIGATION FUNCTIONS
// ======================

function updateNavigationUI() {
  const backButton = document.getElementById('nav-back');
  const forwardButton = document.getElementById('nav-forward');
  const currentNodeElement = document.getElementById('current-node-id');
  const breadcrumbElement = document.getElementById('breadcrumb');
  
  if (!backButton || !forwardButton || !currentNodeElement || !breadcrumbElement) return;
  
  // Update buttons
  backButton.disabled = navigationState.currentIndex === 0;
  forwardButton.disabled = navigationState.currentIndex === navigationState.history.length - 1;
  
  // Update current node display
  currentNodeElement.textContent = navigationState.history[navigationState.currentIndex];
  
  // Update breadcrumb
  updateBreadcrumb(breadcrumbElement);
}

function updateBreadcrumb(breadcrumbElement) {
  if (!breadcrumbElement) return;
  
  breadcrumbElement.innerHTML = '';
  
  navigationState.history.forEach((nodeId, index) => {
    const breadcrumbItem = document.createElement('div');
    breadcrumbItem.className = 'breadcrumb-item';
    
    const link = document.createElement('a');
    link.className = 'breadcrumb-link';
    link.textContent = `Node ${nodeId}`;
    link.title = `Go back to node ${nodeId}`;
    
    if (index === navigationState.currentIndex) {
      link.style.fontWeight = 'bold';
      link.style.color = 'var(--secondary)';
      link.style.cursor = 'default';
    } else {
      link.onclick = () => navigateToHistoryIndex(index);
    }
    
    breadcrumbItem.appendChild(link);
    breadcrumbElement.appendChild(breadcrumbItem);
    
    // Add separator if not last item
    if (index < navigationState.history.length - 1) {
      const separator = document.createElement('span');
      separator.className = 'breadcrumb-separator';
      separator.textContent = '›';
      breadcrumbElement.appendChild(separator);
    }
  });
}

function navigateToHistoryIndex(index) {
  if (index >= 0 && index < navigationState.history.length) {
    navigationState.currentIndex = index;
    const nodeId = navigationState.history[index];
    updateNavigationUI();
    renderGraph(nodeId);
  }
}

function addToHistory(nodeId) {
  // If we're not at the end of history, remove future items
  if (navigationState.currentIndex < navigationState.history.length - 1) {
    navigationState.history = navigationState.history.slice(0, navigationState.currentIndex + 1);
  }
  
  // Add new node to history
  navigationState.history.push(nodeId);
  
  // Limit history size
  if (navigationState.history.length > navigationState.maxHistory) {
    navigationState.history.shift();
    navigationState.currentIndex = navigationState.maxHistory - 1;
  } else {
    navigationState.currentIndex = navigationState.history.length - 1;
  }
  
  updateNavigationUI();
}

function setupNavigationEventListeners() {
  const backButton = document.getElementById('nav-back');
  const forwardButton = document.getElementById('nav-forward');
  
  if (backButton) {
    backButton.onclick = () => {
      if (navigationState.currentIndex > 0) {
        navigationState.currentIndex--;
        const nodeId = navigationState.history[navigationState.currentIndex];
        renderGraph(nodeId);
      }
    };
  }
  
  if (forwardButton) {
    forwardButton.onclick = () => {
      if (navigationState.currentIndex < navigationState.history.length - 1) {
        navigationState.currentIndex++;
        const nodeId = navigationState.history[navigationState.currentIndex];
        renderGraph(nodeId);
      }
    };
  }
}

// ======================
// 3. HELPER FUNCTIONS
// ======================

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    throw error;
  }
}

async function fetchGraphData(nodeId = '15') {
  const url = `${WEBGRAPH_API_BASE}/egonet/${nodeId}`;
  return await fetchData(url);
}

async function fetchPlotData(nodeAddress, dataType) {
  try {
    let url;
    if (dataType === 'liveness') {
      url = `${DRE_API_BASE}/sc-liveness?address=${nodeAddress}&timeInterval=0&sample=0`;
    } else if (dataType === 'popularity') {
      url = `${DRE_API_BASE}/sc-popularity?address=${nodeAddress}&timeInterval=0&sample=0`;
    } else if (dataType === 'overallAvg') {
      url = `${DRE_API_BASE}/sc-overall-avg?address=${nodeAddress}&sample=0`;
    }
    
    console.log(`Fetching ${dataType} from:`, url);
    const data = await fetchData(url);
    console.log(`${dataType} data:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching ${dataType} data:`, error);
    return null;
  }
}

async function renderBarPlot(containerId, data, title) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div class="detail-title">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
      ${title}
    </div>
    <div class="plot"></div>
  `;
  
  if (!data || data.length === 0) {
    container.innerHTML += `<p>No data available</p>`;
    return;
  }

  // Ensure data has the correct structure
  const plotData = Array.isArray(data) ? data : 
                  data.samples ? data.samples : 
                  data.values ? data.values : 
                  [];
  
  if (plotData.length === 0) {
    container.innerHTML += `<p>No plot data available</p>`;
    return;
  }

  const margin = {top: 20, right: 20, bottom: 40, left: 50};
  const width = 280 - margin.left - margin.right;
  const height = 150 - margin.top - margin.bottom;

  const svg = d3.select(`#${containerId} .plot`)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(plotData.map((d, i) => d.sample || d.label || `Sample ${i + 1}`))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(plotData, d => +d.value)]).nice()
    .range([height, 0]);

  svg.selectAll(".bar")
    .data(plotData)
    .join("rect")
      .attr("class", "bar")
      .attr("x", (d, i) => x(d.sample || d.label || `Sample ${i + 1}`))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", "var(--primary)")
      .on("mouseover", function() {
        d3.select(this).attr("fill", "var(--primary-light)");
      })
      .on("mouseout", function() {
        d3.select(this).attr("fill", "var(--primary)");
      });

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .attr("dx", "-0.5em")
      .attr("dy", "0.5em");

  svg.append("g")
    .call(d3.axisLeft(y));

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Value");
}

// ======================
// 4. DETAIL PANEL FUNCTIONS
// ======================

async function showNodeDetails(node) {
  const panel = document.getElementById('side-panel');
  if (!panel) return;
  
  panel.innerHTML = `
    <div class="panel-header">
      <h3>Node Details</h3>
    </div>
    <div class="navigation-header">
      <div class="nav-buttons">
        <button id="nav-back" class="nav-button" disabled>← Back</button>
        <button id="nav-forward" class="nav-button" disabled>Forward →</button>
      </div>
      <div class="current-node">Current: <span id="current-node-id">${node.id}</span></div>
    </div>
    <div id="breadcrumb" class="breadcrumb"></div>
    <div class="detail-section">
      <div class="detail-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        Node ID: ${node.id}
      </div>
      <div class="detail-item">
        <span class="detail-label">Type:</span>
        <span class="detail-value">${node.type_name} 
          <span class="node-type-badge node-type-${node.type_name ? node.type_name.toLowerCase() : 'unknown'}">${node.type_name || 'Unknown'}</span>
        </span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Address:</span>
        <span class="detail-value">${node.address || 'N/A'}</span>
      </div>
      <div class="loading-indicator">
        <div class="loading-spinner"></div>
        Loading additional data...
      </div>
    </div>
  `;

  // Update navigation UI immediately
  updateNavigationUI();
  setupNavigationEventListeners();

  try {
    const addressParam = node.address || "0";
    console.log('Fetching plot data for address:', addressParam);
    
    const [livenessData, popularityData, overallAvg] = await Promise.all([
      fetchPlotData(addressParam, 'liveness'),
      fetchPlotData(addressParam, 'popularity'),
      fetchPlotData(addressParam, 'overallAvg')
    ]);

    console.log('Plot data received:', { livenessData, popularityData, overallAvg });

    panel.innerHTML = `
      <div class="panel-header">
        <h3>Node Details</h3>
      </div>
      <div class="navigation-header">
        <div class="nav-buttons">
          <button id="nav-back" class="nav-button" disabled>← Back</button>
          <button id="nav-forward" class="nav-button" disabled>Forward →</button>
        </div>
        <div class="current-node">Current: <span id="current-node-id">${node.id}</span></div>
      </div>
      <div id="breadcrumb" class="breadcrumb"></div>
      <div class="detail-section">
        <div class="detail-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
          Node ID: ${node.id}
        </div>
        <div class="detail-item">
          <span class="detail-label">Type:</span>
          <span class="detail-value">${node.type_name || 'Unknown'} 
            <span class="node-type-badge node-type-${node.type_name ? node.type_name.toLowerCase() : 'unknown'}">${node.type_name || 'Unknown'}</span>
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Address:</span>
          <span class="detail-value">${node.address || 'N/A'}</span>
        </div>
        ${node.creation_timestamp ? `
        <div class="detail-item">
          <span class="detail-label">Created:</span>
          <span class="detail-value">${new Date(node.creation_timestamp).toLocaleString()}</span>
        </div>` : ''}
        <div class="detail-item">
          <span class="detail-label">In Degree:</span>
          <span class="detail-value">${node.indegree || 0}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Out Degree:</span>
          <span class="detail-value">${node.outdegree || 0}</span>
        </div>
      </div>

      <div class="detail-section">
        <div class="average-metric">
          Account Overall Average: <strong>${overallAvg?.value || overallAvg?.avg || overallAvg || 'N/A'}</strong>
        </div>
      </div>

      <div class="detail-section">
        <div id="liveness-plot" class="plot-container"></div>
      </div>

      <div class="detail-section">
        <div id="popularity-plot" class="plot-container"></div>
      </div>

      <div class="detail-section">
        <div class="detail-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
          Connections
        </div>
        <ul class="connections-list">
          ${window.currentGraphData && window.currentGraphData.links ?
            window.currentGraphData.links
              .filter(l => l.source_id === node.id || l.target_id === node.id)
              .map(link => {
                const otherId = link.source_id === node.id ? link.target_id : link.source_id;
                const direction = link.source_id === node.id ? '→' : '←';
                return `
                <li class="connection-item">
                  <span>${node.id}</span>
                  <span class="connection-direction">${direction}</span>
                  <span>${otherId}</span>
                  <span class="connection-type">${link.type_name || 'connection'}</span>
                </li>`;
              })
              .join('') : 
            '<li>No connections found</li>'
          }
        </ul>
      </div>
    `;

    // Update navigation UI again after content is loaded
    updateNavigationUI();
    setupNavigationEventListeners();

    // Render plots with the actual data
    if (livenessData) {
      await renderBarPlot("liveness-plot", livenessData, "Account Liveness");
    } else {
      const livenessPlot = document.getElementById('liveness-plot');
      if (livenessPlot) livenessPlot.innerHTML += `<p>No liveness data available</p>`;
    }
    
    if (popularityData) {
      await renderBarPlot("popularity-plot", popularityData, "Account Popularity");
    } else {
      const popularityPlot = document.getElementById('popularity-plot');
      if (popularityPlot) popularityPlot.innerHTML += `<p>No popularity data available</p>`;
    }

  } catch (error) {
    console.error("Error loading node details:", error);
    panel.innerHTML += `<div style="color:red; padding: 1rem;">Error loading additional data: ${error.message}</div>`;
  }
}

function showLinkDetails(link) {
  const panel = document.getElementById('side-panel');
  if (!panel) return;

  panel.innerHTML = `
    <div class="panel-header">
      <h3>Link Details</h3>
    </div>
    <div class="navigation-header">
      <div class="nav-buttons">
        <button id="nav-back" class="nav-button" disabled>← Back</button>
        <button id="nav-forward" class="nav-button" disabled>Forward →</button>
      </div>
      <div class="current-node">Current: <span id="current-node-id">${navigationState.history[navigationState.currentIndex]}</span></div>
    </div>
    <div id="breadcrumb" class="breadcrumb"></div>
    <div class="detail-section">
      <div class="detail-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
        Connection: ${link.source_id} → ${link.target_id}
      </div>
      <div class="detail-item">
        <span class="detail-label">Type:</span>
        <span class="detail-value">${link.type_name || 'N/A'}</span>
      </div>
      ${link.amount ? `
      <div class="detail-item">
        <span class="detail-label">Amount:</span>
        <span class="detail-value">${link.amount}</span>
      </div>` : ''}
      ${link.timestamp ? `
      <div class="detail-item">
        <span class="detail-label">Timestamp:</span>
        <span class="detail-value">${new Date(link.timestamp).toLocaleString()}</span>
      </div>` : ''}
    </div>
  `;
  
  updateNavigationUI();
  setupNavigationEventListeners();
}

// ======================
// 5. GRAPH RENDERING
// ======================

async function renderGraph(nodeId = '15') {
  const width = 800, height = 600;
  const container = d3.select("#graph-svg");
  container.selectAll("*").remove();
  
  const svg = container.append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", [0, 0, width, height]);

  try {
    // Show loading state
    const sidePanel = document.getElementById('side-panel');
    if (sidePanel) {
      sidePanel.innerHTML = `
        <div class="loading-indicator">
          <div class="loading-spinner"></div>
          Loading graph data for node ${nodeId}...
        </div>
      `;
    }

    // Fetch graph data from API
    const graphData = await fetchGraphData(nodeId);
    console.log('Fetched graph data:', graphData);
    
    if (!graphData.nodes || !graphData.links) {
      throw new Error('Invalid graph data structure received from API');
    }
    
    window.currentGraphData = graphData;
    
    // Ensure the center node exists, if not create it
    let centerNode = graphData.nodes.find(node => node.id == nodeId);
    if (!centerNode) {
      console.log('Center node not found in API response, creating it...');
      centerNode = {
        id: nodeId,
        address: '0x0',
        type_name: 'EOA',
        indegree: 0,
        outdegree: graphData.links.filter(link => link.source_id == nodeId).length
      };
      graphData.nodes.push(centerNode);
    }
    
    // Create node map for easy lookup
    const nodeMap = new Map();
    graphData.nodes.forEach(node => {
      nodeMap.set(node.id, node);
    });
    
    // Process links and ensure source/target nodes exist
    const validLinks = [];
    
    graphData.links.forEach(link => {
      let sourceNode = nodeMap.get(link.source_id);
      let targetNode = nodeMap.get(link.target_id);
      
      // Create missing nodes if needed
      if (!sourceNode) {
        sourceNode = {
          id: link.source_id,
          address: '0x0',
          type_name: 'Unknown',
          indegree: 0,
          outdegree: 0
        };
        nodeMap.set(link.source_id, sourceNode);
        graphData.nodes.push(sourceNode);
      }
      
      if (!targetNode) {
        targetNode = {
          id: link.target_id,
          address: '0x0',
          type_name: 'Unknown',
          indegree: 0,
          outdegree: 0
        };
        nodeMap.set(link.target_id, targetNode);
        graphData.nodes.push(targetNode);
      }
      
      validLinks.push({
        ...link,
        source: sourceNode,
        target: targetNode
      });
    });
    
    const nodes = Array.from(nodeMap.values());
    const links = validLinks;
    
    console.log('Processed nodes:', nodes);
    console.log('Processed links:', links);
    
    // Initialize positions with center node in the middle
    nodes.forEach(node => {
      if (node.id == nodeId) {
        node.x = width/2;
        node.y = height/2;
      } else {
        node.x = width/2 + Math.random()*300-150;
        node.y = height/2 + Math.random()*300-150;
      }
    });

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width/2, height/2))
      .force("collide", d3.forceCollide().radius(30));

    // Create arrow markers
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#999");

    // Draw links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("class", "link")
      .attr("stroke", "#999")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)")
      .on("click", (event, d) => {
        event.stopPropagation();
        showLinkDetails(d);
      })
      .style("cursor", "pointer");

    // Draw nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("class", d => `node ${d.id == nodeId ? "node-center" : (d.type_name === "SC" ? "node-sc" : "node-eoa")}`)
      .attr("r", d => d.id == nodeId ? 20 : 15)
      .attr("fill", d => d.id == nodeId ? "#ff7f0e" : (d.type_name === "SC" ? "#4cc9f0" : "#4361ee"))
      .on("click", async (event, d) => {
        event.stopPropagation();
        // Add to navigation history before rendering new graph
        if (d.id != nodeId) {
          addToHistory(d.id);
        }
        await showNodeDetails(d);
        // Refresh graph with clicked node as new center
        await renderGraph(d.id);
      })
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Add labels
    const label = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("class", "node-label")
      .attr("dy", d => d.id == nodeId ? -25 : -20)
      .text(d => d.id)
      .attr("font-size", "12px")
      .on("click", async (event, d) => {
        event.stopPropagation();
        // Add to navigation history before rendering new graph
        if (d.id != nodeId) {
          addToHistory(d.id);
        }
        await showNodeDetails(d);
        // Refresh graph with clicked node as new center
        await renderGraph(d.id);
      })
      .style("cursor", "pointer");

    // Update positions
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      
      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
      
      label
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Show center node details by default
    if (centerNode) {
      await showNodeDetails(centerNode);
    }

  } catch (error) {
    console.error("Graph rendering failed:", error);
    const sidePanel = document.getElementById('side-panel');
    if (sidePanel) {
      sidePanel.innerHTML = `
        <div style="color:red">
          <h3>Graph Error</h3>
          <p>${error.message}</p>
          <p>Please check the console for more details.</p>
        </div>
      `;
    }
  }
}

// ======================
// 6. INITIALIZE
// ======================

// Initialize the graph and navigation
async function initialize() {
  // Set up navigation event listeners
  setupNavigationEventListeners();
  
  // Initialize navigation UI
  updateNavigationUI();
  
  // Initialize with node ID 15
  await renderGraph('15');
}

// Start the application
initialize();
</script>