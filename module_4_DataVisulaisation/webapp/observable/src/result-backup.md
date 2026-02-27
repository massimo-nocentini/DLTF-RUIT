# Subgraph Results

<div id="graph-container"></div>

<div id="side-panel" class="side-panel hidden">
  <div class="panel-header">
    <h2 id="panel-title">Node details</h2>
    <button id="close-panel">×</button>
  </div>

  <div class="panel-section">
    <h3>Summary</h3>
    <ul>
      <li><strong>Address:</strong> <span id="stat-address"></span></li>
      <li><strong>Inlinks:</strong> <span id="stat-in"></span></li>
      <li><strong>Outlinks:</strong> <span id="stat-out"></span></li>
      <li><strong>Connected nodes:</strong> <span id="stat-connected"></span></li>
      <li><strong>In amount:</strong> <span id="stat-in-amount"></span></li>
      <li><strong>Out amount:</strong> <span id="stat-out-amount"></span></li>
      <li><strong>Overall Avg:</strong> <span id="stat-avg"></span></li>
    </ul>
  </div>

  <div class="panel-section">
    <h3>Node Information</h3>
    <ul id="node-info"></ul>
  </div>

  <div class="panel-section">
    <h3>Liveness</h3>
    <svg id="chart-liveness" width="320" height="200"></svg>
  </div>

  <div class="panel-section">
    <h3>Popularity</h3>
    <svg id="chart-popularity" width="320" height="200"></svg>
  </div>
</div>

<div id="tooltip" class="tooltip"></div>

<style>
  #graph-container {
    width: 100%;
    height: 600px;
    background: #fafafa;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  .node {
    stroke: #fff;
    stroke-width: 2px;
    cursor: pointer;
  }

  .node.other { fill: #4361ee; }
  .node.placeholder { fill: #ccc; stroke-dasharray: 4 2; }

  .link {
    stroke: #999;
    stroke-width: 2;
    stroke-opacity: 0.7;
  }

  .node-label {
    font-size: 11px;
    fill: #333;
    text-anchor: middle;
    pointer-events: none;
  }

  .tooltip {
    position: absolute;
    background: rgba(0,0,0,0.85);
    color: white;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    display: none;
    pointer-events: none;
    z-index: 30;
  }

  .side-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 360px;
    height: 100%;
    background: white;
    box-shadow: -4px 0 12px rgba(0,0,0,0.15);
    padding: 16px;
    overflow-y: auto;
    z-index: 20;
  }

  .side-panel.hidden { display: none; }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-header button {
    font-size: 24px;
    border: none;
    background: none;
    cursor: pointer;
  }

  .bar { fill: #4361ee; }
</style>

<script type="module">
  const d3 = await import("https://cdn.jsdelivr.net/npm/d3@7/+esm");

  const width = 900;
  const height = 600;

  const params = new URLSearchParams(window.location.search);
  const intervalParam = params.get("interval");
  let currentAddress = params.get("address");

  const panel = document.getElementById("side-panel");
  const tooltip = d3.select("#tooltip");

  document.getElementById("close-panel").onclick =
    () => panel.classList.add("hidden");

  const svg = d3.select("#graph-container")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", "100%")
    .attr("height", "100%");

  /* =======================
     ZOOM + PAN
     ======================= */
  const zoomLayer = svg.append("g");

  svg.call(
    d3.zoom()
      .scaleExtent([0.2, 4])
      .on("zoom", e => zoomLayer.attr("transform", e.transform))
  );

  svg.append("defs")
    .append("marker")
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

  /* =======================
     API PARAM MAPPING
     ======================= */
  function nodeToApiParams(node) {
    return {
      address: node.address,
      nodeId: node.id,
      interval: intervalParam
    };
  }

  loadSubgraph({
    address: currentAddress,
    interval: intervalParam
  });

  function loadSubgraph(apiParams) {
    zoomLayer.selectAll("*").remove();

    const query = new URLSearchParams({
      address: apiParams.address,
      timeInterval: apiParams.interval
    });

    if (apiParams.nodeId) {
      query.set("nodeId", apiParams.nodeId);
    }

    fetch(`http://127.0.0.1:3001/dre/subgraph?${query.toString()}`)
      .then(r => r.json())
      .then(renderGraph);
  }

  function renderGraph(data) {
    const nodeMap = new Map();
    (data.nodes || []).forEach(n => nodeMap.set(n.id, { ...n }));

    const links = [];
    [...(data.outlinks || []), ...(data.inlinks || [])].forEach(l => {
      if (!nodeMap.has(l.fromId))
        nodeMap.set(l.fromId, { id: l.fromId, address: l.fromId, placeholder: true });
      if (!nodeMap.has(l.toId))
        nodeMap.set(l.toId, { id: l.toId, address: l.toId, placeholder: true });

      links.push({
        source: l.fromId,
        target: l.toId,
        amount: l.amount,
        timestamp_view: l.timestamp_view
      });
    });

    const nodes = Array.from(nodeMap.values());

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-350))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    const link = zoomLayer.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("class", "link")
      .attr("marker-end", "url(#arrowhead)")
      .on("mousemove", (e, d) => {
        tooltip
          .style("display", "block")
          .style("left", e.pageX + 10 + "px")
          .style("top", e.pageY + 10 + "px")
          .html(`Amount: ${d.amount ?? "-"}<br/>Time: ${d.timestamp_view}`);
      })
      .on("mouseleave", () => tooltip.style("display", "none"));

    const node = zoomLayer.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("class", d => `node other ${d.placeholder ? "placeholder" : ""}`)
      .attr("r", 14)
      .call(drag(simulation))
      .on("mousedown.zoom", null)
      .on("click", (_, d) => {
        if (d.placeholder) return;
        openSidePanel(d, links);
        loadSubgraph(nodeToApiParams(d));
      });

    const label = zoomLayer.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("class", "node-label")
      .attr("dy", -22)
      .text(d => d.address || d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node.attr("cx", d => d.x).attr("cy", d => d.y);
      label.attr("x", d => d.x).attr("y", d => d.y);
    });
  }

  function drag(simulation) {
    return d3.drag()
      .on("start", (e, d) => {
        if (!e.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (e, d) => {
        d.fx = e.x;
        d.fy = e.y;
      })
      .on("end", (e, d) => {
        if (!e.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
  }

  /* =======================
     SIDE PANEL + CHARTS
     ======================= */
  function openSidePanel(node, links) {
    panel.classList.remove("hidden");

    const addr = node.address;

    const inL = links.filter(l => l.target.id === node.id);
    const outL = links.filter(l => l.source.id === node.id);
    const connected = new Set([
      ...inL.map(l => l.source.id),
      ...outL.map(l => l.target.id)
    ]);

    document.getElementById("panel-title").textContent = `Node ${addr}`;
    document.getElementById("stat-address").textContent = addr;
    document.getElementById("stat-in").textContent = inL.length;
    document.getElementById("stat-out").textContent = outL.length;
    document.getElementById("stat-connected").textContent = connected.size;
    document.getElementById("stat-in-amount").textContent = node.in_amount ?? "-";
    document.getElementById("stat-out-amount").textContent = node.out_amount ?? "-";
    document.getElementById("stat-avg").textContent = "Loading...";

    const infoList = document.getElementById("node-info");
    infoList.innerHTML = "";

    Object.entries(node)
      .filter(([k]) => !["x","y","vx","vy","fx","fy","in_amount","out_amount"].includes(k))
      .forEach(([k, v]) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${k}:</strong> ${v}`;
        infoList.appendChild(li);
      });

    fetch(`http://127.0.0.1:3001/dre/sc-overall-avg?address=${addr}`)
      .then(r => r.json())
      .then(d => document.getElementById("stat-avg").textContent = d.overallAvg ?? "-");

    loadBarChart(
      `http://127.0.0.1:3001/dre/eoa-liveness?address=${addr}&timeInterval=${intervalParam}`,
      "#chart-liveness"
    );

    loadBarChart(
      `http://127.0.0.1:3001/dre/eoa-popularity?address=${addr}&timeInterval=${intervalParam}`,
      "#chart-popularity"
    );
  }

  function loadBarChart(url, selector) {
    fetch(url).then(r => r.json()).then(d => renderBarChart(d, selector));
  }

  function renderBarChart(data, selector) {
    const svg = d3.select(selector);
    svg.selectAll("*").remove();

    const w = +svg.attr("width");
    const h = +svg.attr("height");
    const m = { top: 10, right: 10, bottom: 40, left: 40 };

    const x = d3.scaleBand()
      .domain(data.map(d => d.sample))
      .range([m.left, w - m.right])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .nice()
      .range([h - m.bottom, m.top]);

    svg.append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.sample))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => y(0) - y(d.value));

    svg.append("g")
      .attr("transform", `translate(0,${h - m.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");

    svg.append("g")
      .attr("transform", `translate(${m.left},0)`)
      .call(d3.axisLeft(y));
  }
</script>
