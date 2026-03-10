# Corecom

Corecom is a small Python utility built on top of NetworkX to analyze the hierarchical core structure of a graph.

The library recursively decomposes a graph into connected components and nested k-core subgraphs, producing a tree-like representation of the graph’s core-community structure.

This utility can be useful for graph structure exploration, community and core-periphery analysis, identifying dense subgraphs, studying hierarchical organization in networks.

The output can be saved into a file and used with the included Observable visualization module (k-core-viz subdirectory).

Both the analysis and the visualization technique are derived from the work of Yoghourdjian et al (Yoghourdjian, Vahan, et al. "Graph thumbnails: Identifying and comparing multiple graphs at a glance." IEEE Transactions on Visualization and Computer Graphics 24.12 (2018): 3081-3095.).

## Overview

A graph often contains dense regions that remain connected even after progressively removing low-degree nodes. This library captures that structure by:

- Removing self-loops from the input graph.
- Converting the graph to an undirected graph.
- Splitting it into connected components.
- Repeatedly computing deeper k-core subgraphs.
- Storing the result as a nested dictionary tree.

The output is useful for exploring how the graph breaks into shells and denser inner cores.

## API
`corecom_tree(g)`

Builds the core-community tree of a graph.

### Parameters

`g` (networkx.Graph or compatible graph type): The input graph.

### Returns

`dict`: A nested dictionary representing the hierarchical core decomposition.

Each node in the output tree is a dictionary with the following fields:
- `order`: number of nodes in the current subgraph
- `size`: number of edges in the current subgraph
- `shell_order`: number of nodes removed when extracting the next core
- `shell_size`: number of edges removed when extracting the next core
- `children`: list of nested substructures for deeper cores or connected components

### Usage example
```
import networkx as nx

G = nx.Graph()
G.add_edges_from([
    (1, 2), (2, 3), (3, 1),
    (3, 4), (4, 5), (5, 6), (6, 4)
])

tree = corecom_tree(G)
print(tree)
```