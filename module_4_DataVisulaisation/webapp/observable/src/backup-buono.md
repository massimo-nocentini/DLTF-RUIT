---
title: Network Graph Visualization
---

# Network Graph Visualization

<div id="graph-container"></div>

<script type="module">
const d3 = await import("https://cdn.jsdelivr.net/npm/d3@7/+esm");

async function renderGraph() {
  const width = 800, height = 600;
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);

  try {
    // 1. Fetch the ego network for node 15
    const response = await fetch("http://gridnode4.iit.cnr.it:8800/webgraph-api/egonet/15");
    const data = await response.json();
    
    // 2. Create the central node (15) that's missing from the response
    const currentNode = {
      id: "15",
      indegree: 0,  // Will be updated
      outdegree: data.links.length,  // All links originate from this node
      address: "0x0",  // Default value
      type_name: "EOA",  // Default value
      creation_timestamp: new Date().toISOString()  // Current time
    };
    
    // 3. Create node map including our central node
    const nodeMap = new Map([[currentNode.id, currentNode]]);
    data.nodes.forEach(node => nodeMap.set(node.id, node));
    
    console.log("All nodes:", Array.from(nodeMap.values()));
    
    // 4. Process links with validation
    const links = data.links.map(link => {
      const source = nodeMap.get(link.source_id);
      const target = nodeMap.get(link.target_id);
      
      if (!source || !target) {
        console.error("Invalid link:", link);
        throw new Error(`Link references missing node: ${link.source_id}->${link.target_id}`);
      }
      
      return { ...link, source, target };
    });
    
    // 5. Update indegree for all target nodes
    links.forEach(link => {
      link.target.indegree = (link.target.indegree || 0) + 1;
    });
    
    // 6. Initialize positions with central node at center
    const nodes = Array.from(nodeMap.values());
    nodes.forEach((node, i) => {
      if (node.id === "15") {
        node.x = width / 2;
        node.y = height / 2;
      } else {
        node.x = width / 2 + Math.random() * 300 - 150;
        node.y = height / 2 + Math.random() * 300 - 150;
      }
    });

    // 7. Simulation setup (rest of the code remains the same)
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // 8. Visualization elements (rest of the code remains the same)
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

    const link = svg.append("g").selectAll("line")
      .data(links).join("line")
      .attr("stroke", "#999")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#end)");

    // Make central node visually distinct
    const node = svg.append("g").selectAll("circle")
      .data(nodes).join("circle")
      .attr("r", d => d.id === "15" ? 20 : 15)  // Bigger for central node
      .attr("fill", d => d.id === "15" ? "#ff7f0e" : "#1f77b4");  // Orange for center

    const label = svg.append("g").selectAll("text")
      .data(nodes).join("text")
      .attr("dy", d => d.id === "15" ? -25 : -20)
      .text(d => d.id)
      .attr("font-size", "12px")
      .attr("font-weight", d => d.id === "15" ? "bold" : "normal");

    // 9. Simulation update
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

    return svg.node();
  } catch (error) {
    console.error("Rendering failed:", error);
    return svg.append("text")
      .attr("x", width/2)
      .attr("y", height/2)
      .attr("text-anchor", "middle")
      .text(`Error: ${error.message}`)
      .node();
  }
}

// Render with error handling
const container = document.getElementById("graph-container");
try {
  container.append(await renderGraph());
} catch (error) {
  container.innerHTML = `
    <div style="color:red; padding:1em; border:1px solid red">
      Fatal Error: ${error.message}`;
}
</script>
