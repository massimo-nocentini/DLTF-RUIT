---
title: Network Graph Visualization
---

# Network Graph Visualization

<style>
  #graph-container {
    display: flex;
    height: 700px;
    border: 1px solid #ddd;
    margin: 0;
    padding: 0;
  }
  #graph-svg {
    flex: 2;
    min-width: 0;
    background: #f8f8f8;
  }
  #side-panel {
    flex: 1;
    min-width: 350px;
    padding: 1.5rem;
    background: #fff;
    border-left: 1px solid #ddd;
    overflow-y: auto;
    font-family: sans-serif;
    font-size: 14px;
  }
  .detail-section {
    margin-bottom: 1.8rem;
    padding-bottom: 1.2rem;
    border-bottom: 1px solid #eee;
  }
  .detail-title {
    font-weight: bold;
    margin-bottom: 0.8rem;
    font-size: 15px;
  }
  .plot-container {
    height: 220px;
    margin-top: 1.2rem;
  }
  .average-metric {
    font-size: 1.3rem;
    padding: 0.8rem;
    background: #f5f5f5;
    border-radius: 6px;
    text-align: center;
    margin: 1.2rem 0;
  }
  .plot svg {
    display: block;
    margin: 0 auto;
    width: 100%;
  }
  .bar {
    fill: #4e79a7;
  }
  .bar:hover {
    fill: #e15759;
  }
  text {
    font-size: 12px;
  }
  ul {
    padding-left: 1.2rem;
    margin-top: 0.5rem;
  }
  li {
    margin-bottom: 0.4rem;
  }
</style>

<div id="graph-container">
  <div id="graph-svg"></div>
  <div id="side-panel">
    <h3>Details</h3>
    <p>Click on any node or link to view details</p>
  </div>
</div>

<script type="module">
const d3 = await import("https://cdn.jsdelivr.net/npm/d3@7/+esm");

// ======================
// 1. HARDCODED DATA
// ======================

const graphData = {
  "nodes": [
    {
      "id": "224",
      "indegree": 1,
      "outdegree": 1,
      "address": "0xe0",
      "type_name": "EOA",
      "creation_timestamp": "2025-07-23T08:47:03.094Z"
    },
    {
      "id": "305",
      "indegree": 3,
      "outdegree": 2,
      "address": "0x131",
      "type_name": "SC",
      "creation_timestamp": "2025-07-23T08:47:03.094Z"
    },
    {
      "id": "516",
      "indegree": 3,
      "outdegree": 1,
      "address": "0x204",
      "type_name": "EOA",
      "creation_timestamp": "2025-07-23T08:47:03.094Z"
    },
    {
      "id": "631",
      "indegree": 3,
      "outdegree": 0,
      "address": "0x277",
      "type_name": "EOA",
      "creation_timestamp": "2025-07-23T08:47:03.094Z"
    },
    {
      "id": "679",
      "indegree": 2,
      "outdegree": 0,
      "address": "0x2a7",
      "type_name": "EOA",
      "creation_timestamp": "2025-07-23T08:47:03.094Z"
    }
  ],
  "links": [
    {
      "source_id": "15",
      "target_id": "224",
      "amount": 0.5834590585921938,
      "type_name": "deploy",
      "timestamp": "2025-07-23T08:47:03.094Z"
    },
    {
      "source_id": "15",
      "target_id": "305",
      "amount": 0.9683996143076941,
      "type_name": "transfer",
      "timestamp": "2025-07-23T08:47:03.094Z"
    },
    {
      "source_id": "15",
      "target_id": "516",
      "amount": 0.47402737774254433,
      "type_name": "payment",
      "timestamp": "2025-07-23T08:47:03.094Z"
    },
    {
      "source_id": "15",
      "target_id": "631",
      "amount": 0.613893146886406,
      "type_name": "payment",
      "timestamp": "2025-07-23T08:47:03.094Z"
    },
    {
      "source_id": "15",
      "target_id": "679",
      "amount": 0.26895377877160587,
      "type_name": "deploy",
      "timestamp": "2025-07-23T08:47:03.094Z"
    }
  ]
};

const samplePlotData = {
  "liveness": [
    {"sample": "Monday", "value": 8},
    {"sample": "Tuesday", "value": 14},
    {"sample": "Wednesday", "value": 15},
    {"sample": "Thursday", "value": 9},
    {"sample": "Friday", "value": 22},
    {"sample": "Saturday", "value": 27},
    {"sample": "Sunday", "value": 19}
  ],
  "popularity": [
    {"sample": "Monday", "value": 12},
    {"sample": "Tuesday", "value": 18},
    {"sample": "Wednesday", "value": 20},
    {"sample": "Thursday", "value": 15},
    {"sample": "Friday", "value": 25},
    {"sample": "Saturday", "value": 30},
    {"sample": "Sunday", "value": 22}
  ],
  "overallAvg": { "value": 18.5 }
};

// ======================
// 2. HELPER FUNCTIONS
// ======================

async function fetchPlotData(apiUrl) {
  try {
    if (apiUrl.includes('sc-liveness')) return samplePlotData.liveness;
    if (apiUrl.includes('sc-popularity')) return samplePlotData.popularity;
    if (apiUrl.includes('sc-overall-avg')) return samplePlotData.overallAvg;
    return null;
  } catch (error) {
    console.error(`Error with mock data: ${error}`);
    return null;
  }
}

async function renderBarPlot(containerId, data, title) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `<h4>${title}</h4><div class="plot"></div>`;
  
  if (!data || data.length === 0) {
    container.innerHTML += `<p>No data available</p>`;
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
    .domain(data.map(d => d.sample))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => +d.value)]).nice()
    .range([height, 0]);

  svg.selectAll(".bar")
    .data(data)
    .join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.sample))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", "#4e79a7")
      .on("mouseover", function() {
        d3.select(this).attr("fill", "#e15759");
      })
      .on("mouseout", function() {
        d3.select(this).attr("fill", "#4e79a7");
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
// 3. DETAIL PANEL FUNCTIONS
// ======================

async function showNodeDetails(node) {
  const panel = document.getElementById('side-panel');
  if (!panel) return;
  
  panel.innerHTML = `
    <h3>Node Details</h3>
    <div class="detail-section">
      <div class="detail-title">ID: ${node.id}</div>
      <div>Type: ${node.type_name}</div>
      <div>Address: ${node.address || 'N/A'}</div>
      <div>Loading additional data...</div>
    </div>
  `;

  try {
    const addressParam = node.address || "0";
    const [livenessData, popularityData, overallAvg] = await Promise.all([
      fetchPlotData(`http://localhost:3000/dre/sc-liveness?address=${addressParam}&timeInterval=0&sample=0`),
      fetchPlotData(`http://localhost:3000/dre/sc-popularity?address=${addressParam}&timeInterval=0&sample=0`),
      fetchPlotData(`http://localhost:3000/dre/sc-overall-avg?address=${addressParam}&sample=0`)
    ]);

    panel.innerHTML = `
      <h3>Node Details</h3>
      <div class="detail-section">
        <div class="detail-title">ID: ${node.id}</div>
        <div>Type: ${node.type_name}</div>
        <div>Address: ${node.address || 'N/A'}</div>
        ${node.creation_timestamp ? `<div>Created: ${new Date(node.creation_timestamp).toLocaleString()}</div>` : ''}
      </div>

      <div class="detail-section">
        <div class="average-metric">
          Account Overall Average: <strong>${overallAvg?.value || 'N/A'}</strong>
        </div>
      </div>

      <div class="detail-section">
        <div id="liveness-plot" class="plot-container"></div>
      </div>

      <div class="detail-section">
        <div id="popularity-plot" class="plot-container"></div>
      </div>

      <div class="detail-section">
        <h4>Connections</h4>
        <ul>
          ${graphData.links
            .filter(l => l.source_id === node.id || l.target_id === node.id)
            .map(link => {
              const otherId = link.source_id === node.id ? link.target_id : link.source_id;
              const direction = link.source_id === node.id ? '→' : '←';
              return `<li>${node.id} ${direction} ${otherId} (${link.type_name})</li>`;
            })
            .join('')}
        </ul>
      </div>
    `;

    if (livenessData) await renderBarPlot("liveness-plot", livenessData, "Account Liveness");
    if (popularityData) await renderBarPlot("popularity-plot", popularityData, "Account Popularity");

  } catch (error) {
    console.error("Error loading node details:", error);
    panel.innerHTML += `<div style="color:red">Error loading additional data: ${error.message}</div>`;
  }
}

function showLinkDetails(link) {
  const panel = document.getElementById('side-panel');
  if (!panel) return;

  panel.innerHTML = `
    <h3>Link Details</h3>
    <div class="detail-section">
      <div class="detail-title">Connection: ${link.source_id} → ${link.target_id}</div>
      <div>Type: ${link.type_name || 'N/A'}</div>
      ${link.amount ? `<div>Amount: ${link.amount}</div>` : ''}
      ${link.timestamp ? `<div>Timestamp: ${new Date(link.timestamp).toLocaleString()}</div>` : ''}
    </div>
    <div class="detail-section">
      <h4>Source Node</h4>
      <div>ID: ${link.source_id}</div>
      ${link.source?.address ? `<div>Address: ${link.source.address}</div>` : ''}
    </div>
    <div class="detail-section">
      <h4>Target Node</h4>
      <div>ID: ${link.target_id}</div>
      ${link.target?.address ? `<div>Address: ${link.target.address}</div>` : ''}
    </div>
  `;
}

// ======================
// 4. GRAPH RENDERING
// ======================

async function renderGraph() {
  const width = 800, height = 600;
  const container = d3.select("#graph-svg");
  container.selectAll("*").remove();
  
  const svg = container.append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", [0, 0, width, height]);

  try {
    // Add center node (ID 15)
    const centerNode = {
      id: "15",
      address: "0x0",
      type_name: "EOA",
      creation_timestamp: new Date().toISOString(),
      indegree: 0,
      outdegree: graphData.links.length
    };
    
    // Process nodes and links
    const nodeMap = new Map([[centerNode.id, centerNode]]);
    graphData.nodes.forEach(node => nodeMap.set(node.id, node));
    
    const links = graphData.links.map(link => ({
      ...link,
      source: nodeMap.get(link.source_id),
      target: nodeMap.get(link.target_id)
    }));
    
    const nodes = Array.from(nodeMap.values());
    
    // Initialize positions
    nodes.forEach(node => {
      node.x = node.id === "15" ? width/2 : width/2 + Math.random()*300-150;
      node.y = node.id === "15" ? height/2 : height/2 + Math.random()*300-150;
    });

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width/2, height/2));

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
      .attr("r", d => d.id === "15" ? 20 : 15)
      .attr("fill", d => d.id === "15" ? "#ff7f0e" : "#1f77b4")
      .on("click", (event, d) => {
        event.stopPropagation();
        showNodeDetails(d);
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
      .attr("dy", d => d.id === "15" ? -25 : -20)
      .text(d => d.id)
      .attr("font-size", "12px")
      .on("click", (event, d) => {
        event.stopPropagation();
        showNodeDetails(d);
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

  } catch (error) {
    console.error("Graph rendering failed:", error);
    document.getElementById('side-panel').innerHTML = `
      <div style="color:red">
        <h3>Graph Error</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// ======================
// 5. INITIALIZE
// ======================

renderGraph();
</script>
