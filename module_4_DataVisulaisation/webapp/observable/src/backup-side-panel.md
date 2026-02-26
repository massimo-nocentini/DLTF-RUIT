---
title: Network Graph Visualization
---

# Network Graph Visualization

<style>
  #graph-container {
    display: flex;
    height: 600px;
  }
  #graph-svg {
    flex: 3;
    border: 1px solid #eee;
  }
  #side-panel {
    flex: 1;
    padding: 1rem;
    border: 1px solid #eee;
    margin-left: 1rem;
    overflow-y: auto;
    font-family: sans-serif;
  }
  .node-details, .link-details {
    margin-bottom: 1rem;
  }
  .detail-title {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
</style>

<div id="graph-container">
  <div id="graph-svg"></div>
  <div id="side-panel">
    <h3>Details</h3>
    <p>Click on any node or link to view details</p>
  </panel>
</div>

<script type="module">
const d3 = await import("https://cdn.jsdelivr.net/npm/d3@7/+esm");

// Store the original data globally
let graphData = { nodes: [], links: [] };

function showNodeDetails(node) {
  const panel = document.getElementById('side-panel');
  panel.innerHTML = `
    <h3>Node Details</h3>
    <div class="node-details">
      <div class="detail-title">ID: ${node.id}</div>
      <div>Type: ${node.type_name}</div>
      <div>Address: ${node.address}</div>
      <div>In Degree: ${node.indegree}</div>
      <div>Out Degree: ${node.outdegree}</div>
      <div>Created: ${new Date(node.creation_timestamp).toLocaleString()}</div>
    </div>
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
  `;
}

function showLinkDetails(link) {
  const panel = document.getElementById('side-panel');
  panel.innerHTML = `
    <h3>Link Details</h3>
    <div class="link-details">
      <div class="detail-title">Connection: ${link.source_id} → ${link.target_id}</div>
      <div>Type: ${link.type_name}</div>
      <div>Amount: ${link.amount}</div>
      <div>Timestamp: ${new Date(link.timestamp).toLocaleString()}</div>
    </div>
    <h4>Source Node</h4>
    <div>ID: ${link.source_id}</div>
    <h4>Target Node</h4>
    <div>ID: ${link.target_id}</div>
  `;
}

async function renderGraph() {
  const width = 800, height = 600;
  const svg = d3.select("#graph-svg").append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", [0, 0, width, height]);

  try {
    // Fetch data
    const response = await fetch("http://gridnode4.iit.cnr.it:8800/webgraph-api/egonet/15");
    graphData = await response.json();
    
    // Create central node
    const currentNode = {
      id: "15",
      indegree: 0,
      outdegree: graphData.links.length,
      address: "0x0",
      type_name: "EOA",
      creation_timestamp: new Date().toISOString()
    };
    
    // Process nodes and links
    const nodeMap = new Map([[currentNode.id, currentNode]]);
    graphData.nodes.forEach(node => nodeMap.set(node.id, node));
    
    const links = graphData.links.map(link => {
      const source = nodeMap.get(link.source_id);
      const target = nodeMap.get(link.target_id);
      return { ...link, source, target };
    });
    
    // Initialize positions
    const nodes = Array.from(nodeMap.values());
    nodes.forEach(node => {
      if (node.id === "15") {
        node.x = width / 2;
        node.y = height / 2;
      } else {
        node.x = width / 2 + Math.random() * 300 - 150;
        node.y = height / 2 + Math.random() * 300 - 150;
      }
    });

    // Simulation setup
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Create arrows
    svg.append("defs").selectAll("marker")
      .data(["end"]).join("marker")
      .attr("id", d => d)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path").attr("d", "M0,-5L10,0L0,5");

    // Draw links with click events
    const link = svg.append("g").selectAll("line")
      .data(links).join("line")
      .attr("stroke", "#999")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#end)")
      .on("click", (event, d) => {
        event.stopPropagation();
        showLinkDetails(d);
      })
      .style("cursor", "pointer");

    // Draw nodes with click events
    const node = svg.append("g").selectAll("circle")
      .data(nodes).join("circle")
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
    const label = svg.append("g").selectAll("text")
      .data(nodes).join("text")
      .attr("dy", d => d.id === "15" ? -25 : -20)
      .text(d => d.id)
      .attr("font-size", "12px")
      .attr("font-weight", d => d.id === "15" ? "bold" : "normal")
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

    // Drag functions
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
    console.error("Rendering failed:", error);
    document.getElementById('side-panel').innerHTML = `
      <div style="color:red">Error loading graph: ${error.message}</div>
    `;
  }
}

// Initialize
renderGraph();
</script>
