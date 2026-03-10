function _1(md){return(
md`# K-core decomposition`
)}

function _chart(d3,width,height,DOM,tree,color)
{
  const svg = d3.create("svg")
      .attr('width', width)
      .attr('style', 'background: rgb(241, 239, 229);')
      .attr("viewBox", [-10, -10, width+20, height+20])
      .style("font", "10px sans-serif")
      .attr("text-anchor", "middle");
  
  const shadow = DOM.uid("shadow");

  svg.append("filter")
      .attr("id", shadow.id)
      .attr("x", "-200%")
      .attr("y", "-200%")
      .attr("width", "400%")
      .attr("height", "400%")
    .append("feDropShadow")
      .attr("flood-opacity", 1)
      .attr("dx", 1.2)
      .attr("dy", 1.2);
  
  const zoomable_layer = svg.append('g')
  
  const is_component = (d) => d.depth == 2 || d.parent && d.parent.children.length > 2

  const node = zoomable_layer.selectAll("g")
    .data(tree.root.descendants())
    .join("g")
      .attr("transform", d => `translate(${d.xr},${d.yr})`);

  const folder = node.filter(d => d.children);
  
  folder.append("circle")
      .attr("r", d => d.r)
      .attr("fill", d => d.depth <= 1 ? 'none' : color(d.depth-2))
      //.attr("filter", d => d.depth == 0 ? '' : shadow)
      //.attr("stroke-width", d => d.depth == 2 ? 0.2 : ((d.depth-2) % 10 ? 0.08: 0.15) )
      .attr("stroke-width", d => is_component(d) ? 0.3 : 0) //((d.depth-2) % 10 ? 0.08: 0.15) )
      .attr("stroke", d => d.depth <= 1 ? 'none' : 'black')
      .attr("vector-effect", "non-scaling-stroke");

  folder.append("title")
      .text(d => d.depth-2)
  
  const leaf = node.filter(d => !d.children);
  
  leaf.append("circle")
      .attr("r", d => d.r)
      .attr("fill", 'black')/*
      .append("rect")
      .attr("width", d => d.r*Math.sqrt(2))
      .attr("height", d => d.r*Math.sqrt(2))
      .attr("x", d => -d.r*Math.sqrt(2)/2)
      .attr("y", d => -d.r*Math.sqrt(2)/2)
      .attr("fill", 'black')
      //.attr("fill-opacity", 0.5);
  
  /*leaf.each(d => d.rand = d.data.size / Math.pow(d.data.order,2))
    .append("rect")
      .attr("width", d => d.r*Math.sqrt(2))
      .attr("height", d => d.r*d.rand*Math.sqrt(2))
      .attr("x", d => -d.r*Math.sqrt(2)/2)
      .attr("y", d => (1/2 - d.rand)*d.r*Math.sqrt(2))
      .attr("fill", 'black');*/
  
  //    .attr("id", d => (d.leafUid = DOM.uid("leaf")).id);
  
  /*
  leaf.append("clipPath")
      .attr("id", d => (d.clipUid = DOM.uid("clip")).id)
    .append("use")
      .attr("xlink:href", d => d.leafUid.href);
  
  leaf.append("text")
      .attr("clip-path", d => d.clipUid)
    .selectAll("tspan")
    .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .join("tspan")
      .attr("x", 0)
      .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
      .text(d => d);
  */
  /*node.append("title")
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);
  */
  leaf.append("title")
      .text(d => d.data.size)

  /*const link = zoomable_layer.selectAll("path")
    .data(tree.links)
    .join("path")
      .attr("d", d => `M${d.source.xr} ${d.source.yr} C${d.source.xr} ${d.source.yr-Math.abs(d.target.xr-d.source.xr)*0.5} ${d.target.xr} ${d.target.yr-Math.abs(d.target.xr-d.source.xr)*0.5} ${d.target.xr} ${d.target.yr}`)
      .attr("stroke", "rgba(255,255,255,0.1)")
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .attr("vector-effect", "non-scaling-stroke");*/
  
  function zoomed() {
    zoomable_layer.attr('transform', d3.event.transform);
  }
  
  svg.call(d3.zoom()
      .scaleExtent([0, Infinity])
      .on('zoom', zoomed));
  
  return svg.node();
}


function _color(d3){return(
(i) => {
  const N = 10
  
  
  let ii = i % N
  let ic = Math.floor(i / N)
  
  const minH = 220+60*4
  const H = 60
  const Hshift = 75
  const C = 15
  const Cshift = 10
  const L = 92
  const Lshift = 16
  
  let ni = Math.pow(ii/(N-1),0.6)
  
  return d3.hcl(minH+ic*H+Hshift*ni, C+Cshift*ni, L-Lshift*ni)
}
)}

function _interpolateNonfo(d3){return(
d3.interpolateHclLong(d3.hcl(80-180,40,75),d3.hcl(360-100,50,25))
)}

function _interpolateNonfoBoost(interpolateNonfo){return(
(t) => interpolateNonfo(Math.pow(t, 0.45))
)}

function _interpolateUnivrs(d3){return(
d3.interpolateHclLong(d3.hcl(240,20,25),d3.hcl(360+80,80,85))
)}

function _interpolateUnivrsBoost(interpolateUnivrs){return(
(t) => interpolateUnivrs(Math.pow(t, 0.45))
)}

function _interpolateTurboCalmer(d3){return(
(t) => {var c = d3.hcl(d3.interpolateTurbo(t)); c.l = c.l*0.6+20; c.c *= 0.9; return c}
)}

function _tree(pack,leafified_data,spiralify,spirality)
{
  let node = pack(leafified_data)
  node.descendants().forEach(d => spiralify(d, spirality))
  return {
    root: node,
    links: node.children[0].children[0].leaves().filter((d,i) => i%10>5).map(n1 => node.children[0].children[0].leaves().filter((d,i) => i%11<5).map(n2 => ({source: n1, target: n2, weight: Math.random()}))).flat()
  }
}


function _spirality(){return(
3.0
)}

function _spiralify(rotate){return(
function spiralify(node, spirality) {
  let ancestorNode = node
  node.xr = node.x
  node.yr = node.y
  while(ancestorNode.parent) {
    ancestorNode = ancestorNode.parent
    const result = rotate(node.xr, node.yr, ancestorNode.x, ancestorNode.y, spirality*Math.sqrt(ancestorNode.height))
    node.xr = result[0]
    node.yr = result[1]
  }
}
)}

function _rotate(){return(
function rotate(x, y, cx, cy, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}
)}

async function _data(FileAttachment){return(
{
  children: [
    //await FileAttachment("batagelj_et_al_k_tree@1.json").json(),
    //await FileAttachment("wnen30_noun_k_tree@1.json").json(),
    //await FileAttachment("wnen30_k_tree.json").json(),
    //await FileAttachment("wnen30_w_words_k_tree.json").json(),
    //await FileAttachment("wnen30_w_senses_k_tree.json").json(),
    //await FileAttachment("barabasi_albert_100k_k_tree@1.json").json(),
    //await FileAttachment("barabasi_albert_100k_3_k_tree.json").json(),
    //await FileAttachment("erdos_renyi_1k_0.5_k_tree.json").json(),
    //await FileAttachment("invite_link_network_k_tree@1.json").json(),
    //await FileAttachment("10k_k_tree.json").json(),
    //await FileAttachment("100k_k_tree.json").json(),
    //await FileAttachment("500k_k_tree.json").json(),
    //await FileAttachment("750k_k_tree.json").json(),
    //await FileAttachment("1m_k_tree.json").json(),
    //await FileAttachment("GrQc.json").json(),
    //await FileAttachment("AstroPh.json").json(),
    //await FileAttachment("CondMat.json").json(),
    //await FileAttachment("HepPh.json").json(),
    //await FileAttachment("HepTh.json").json(),
    await FileAttachment("corporate_directors.json").json(),
    //await FileAttachment("wiki_users.json").json()
  ]
}
)}

function _key(){return(
'order'
)}

function _leafified_data(data)
{
  let leafify = (node) => {
    var n = {children: []};
    if(node.children)
      n.children = node.children.map(leafify);
    
    if(node.shell_order > 0)
      n.children.push({value: node.shell_order, order: node.shell_order, size: node.shell_size});
    
    return n;
  }
  return leafify(data);
}


function _leaves_tree(leafified_data)
{
  var tree = {children: []}
  
  var walk = (n) => {
    if(!n.children)
      tree.children.push(n)
    else
      n.children.map(walk)
  }
  
  walk(leafified_data)
  
  return tree
}


function _pack(d3,width,height){return(
data => d3.pack()
    .size([width - 2, height - 2])
    .padding((d) => d.depth == 0 ? 60 : 6)
    //.padding(6)
    //.padding((d) => d.height == 1 ? 2 : 6)
  (d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value))
)}

function _height(width){return(
width
)}

function _format(d3){return(
d3.format(",d")
)}

function _d3(require){return(
require("d3@5")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["corporate_directors.json", {url: new URL("./files/a8cfea1d37e11daaff26ab823cce6219e4b7f1d78fc8ae767f90339450ea6ef9290d0f567191a362f2e3ca2210dd53465af788a3014015887a908f20de331d32.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("chart")).define("chart", ["d3","width","height","DOM","tree","color"], _chart);
  main.variable(observer("color")).define("color", ["d3"], _color);
  main.variable(observer("interpolateNonfo")).define("interpolateNonfo", ["d3"], _interpolateNonfo);
  main.variable(observer("interpolateNonfoBoost")).define("interpolateNonfoBoost", ["interpolateNonfo"], _interpolateNonfoBoost);
  main.variable(observer("interpolateUnivrs")).define("interpolateUnivrs", ["d3"], _interpolateUnivrs);
  main.variable(observer("interpolateUnivrsBoost")).define("interpolateUnivrsBoost", ["interpolateUnivrs"], _interpolateUnivrsBoost);
  main.variable(observer("interpolateTurboCalmer")).define("interpolateTurboCalmer", ["d3"], _interpolateTurboCalmer);
  main.variable(observer("tree")).define("tree", ["pack","leafified_data","spiralify","spirality"], _tree);
  main.variable(observer("spirality")).define("spirality", _spirality);
  main.variable(observer("spiralify")).define("spiralify", ["rotate"], _spiralify);
  main.variable(observer("rotate")).define("rotate", _rotate);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  main.variable(observer("key")).define("key", _key);
  main.variable(observer("leafified_data")).define("leafified_data", ["data"], _leafified_data);
  main.variable(observer("leaves_tree")).define("leaves_tree", ["leafified_data"], _leaves_tree);
  main.variable(observer("pack")).define("pack", ["d3","width","height"], _pack);
  main.variable(observer("height")).define("height", ["width"], _height);
  main.variable(observer("format")).define("format", ["d3"], _format);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  return main;
}
