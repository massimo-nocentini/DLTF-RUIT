import networkx as nx
import sys

def corecom_tree(g):
    g.remove_edges_from(nx.selfloop_edges(g))
    tree = {}
    _corecom(g.to_undirected(), tree)
    return tree

def _corecom(g, node, coreness=1):
    print 'Coreness %d: graph with %d nodes' % (coreness, g.order())
    sys.stdout.flush()
    
    for sg in nx.connected_component_subgraphs(g):
        order = sg.order()
        i = 0
        current_node = node
        while order == sg.order() and order != 0:
            core = nx.k_core(sg, coreness+i)
            
            sg_node = {'order': sg.order(), 'size': sg.size(), 'shell_order': sg.order() - core.order(), 'shell_size': sg.size() - core.size()}
            if 'children' not in current_node:
                current_node['children'] = []
            current_node['children'].append(sg_node)
            current_node = sg_node
            
            i += 1
            order = core.order()
            
        if order != 0:
            _corecom(core, sg_node, coreness+i)