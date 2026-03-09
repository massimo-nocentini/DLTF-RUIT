// API logic here

// THIS IS A MOCKUP, USED TO TEST THE FRONT-END. 
// METHODS RETURN FICTITIOUS VALUES, NOSENSE NUMBERS
// DO NOT USE IT IN PRODUCTION

export interface Pair {
    sample: string,
    value: number
}

export interface Node {
    id: number,
    address: string,
    indegree: number,
    outdegree: number,
    scale: number,
    timestamp: string,
    timestamp_view: string, // campo fittizio che metto io che contiene un timestamp random per filtrare il grafo e renderlo un po più visualizzabile
}

export interface Link {
    fromId: number,
    toId: number,
    amount: number,
    scale: number,
    timestamp: string,
    timestamp_view: string
}

async function getSubgraphData(nodeId: any): Promise<any> {
    const apiUrl = "http://gridnode4.iit.cnr.it:8800/webgraph-api/egonet/" + nodeId;
    const response = await fetch(apiUrl);
    return await response.json();
}

// mi serve che sia async perché deve chiamare le api del grafo
export async function getSubgraph(address: any, timeInterval: any, nodeId: number): Promise<any> {
    let subgraph: any = {};
    let apiUrl = "http://gridnode4.iit.cnr.it:8800/webgraph-api/egonet/";

    // const nodeId = getNodeIdByAddress(address);

    const nodes = [];
    const inLinks: Link[] = [];
    const outLinks: Link[] = [];

    const url = apiUrl + nodeId;
    
    //const response = await fetch(url);
    // const data = await response.json();
    const data = await getSubgraphData(nodeId);

    let inAmount: number = 0;
    let outAmount: number = 0;

    let minTxValue: number = 1000000000;
    let maxTxValue: number = 0;
    let minOutdegree: number = 1000000000;
    let maxOutdegree: number = 0;

    for (const link of data.inlinks) {
        const l: Link = {
            fromId: link.source_id,
            toId: link.target_id,
            amount: link.amount,
            scale: 0,
            timestamp: link.timestamp,
            timestamp_view: getRandomTimestamp()
        }
       
        if (isWithinInterval(l.timestamp_view, timeInterval)) {
            inAmount += l.amount;
            inLinks.push(l);
        }
    }

    for (const link of data.outlinks) {
        const l: Link = {
            fromId: link.source_id,
            toId: link.target_id,
            amount: link.amount,
            scale: 0,
            timestamp: link.timestamp,
            timestamp_view: getRandomTimestamp()
        }
        if (isWithinInterval(l.timestamp_view, timeInterval)) {
            if (l.amount < minTxValue) {
                minTxValue = l.amount;
            }
            if (l.amount > maxTxValue) {
                maxTxValue = l.amount;
            }
            outAmount += l.amount;
            outLinks.push(l);
        }
    }

    for (const entry of data.nodes) {
        const n: Node = {
            id: entry.id,
            address: entry.address,
            indegree: entry.indegree,
            outdegree: entry.outdegree,
            scale: 0,
            timestamp: entry.creation_timestamp,
            timestamp_view: getRandomTimestamp()
        }
        if (isWithinInterval(n.timestamp_view, timeInterval)) {
            if (entry.outdegree < minOutdegree) {
                minOutdegree = entry.outdegree;
            }
            if (entry.outdegree > maxOutdegree) {
                maxOutdegree = entry.outdegree;
            }
            nodes.push(n);
        }
    }

    for (const node of nodes) {
        node.scale = getNormalization(node.outdegree, minOutdegree, maxOutdegree);
    }

    for (const link of outLinks) {
        link.scale = getNormalization(link.amount, minTxValue, maxTxValue);
    } 

    subgraph.currentNode = getNodeData(nodeId);
    subgraph.currentNode.indegree = inLinks.length;
    subgraph.currentNode.outdegree = outLinks.length;
    subgraph.nodes = nodes;
    subgraph.in_amount = inAmount;
    subgraph.out_amount = outAmount;
    subgraph.inlinks = inLinks;
    subgraph.outlinks = outLinks;

    return subgraph;
}

export async function getNodeTxPath(address: any, steps: number): Promise<any> {
    let path: any = [];
    let s: number = 0;
    // PLACEHOLDER
    let nodeId = 37028167;

    while (s < steps) {
        let subgraph = await getSubgraph(address, '1y', nodeId);
        nodeId = subgraph.inLinks.fromId;
        address = subgraph.currentNode.address;

        path.push(nodeId);
        s++;
    }

    return path;
}

export async function getKCoreData(address: any, timeInterval: any, nodeId: number): Promise<any> {
    let kCoreGraph: any = {
        nodes: [],
        links: []
    };

    const firstLevel = await getSubgraph(address, timeInterval, nodeId);

    kCoreGraph.links = firstLevel.inlinks.concat(firstLevel.outlinks);

    const seen = new Set(kCoreGraph.nodes);

    for (const node of firstLevel.nodes) {
        if (!seen.has(node)) {
            seen.add(node);
            kCoreGraph.nodes.push(node);
            console.log('aggungo nodo ' + node.id + ' da primo livello ')
        }
        const secondLevel = await getSubgraph(node.address, timeInterval, node.id);
        for (const n of secondLevel.nodes) {
            if (!seen.has(node)) {
                console.log('aggiungo nodo ' + n.id + ' da secondo livello')
                seen.add(node);
                kCoreGraph.nodes.push(node);
            }
            kCoreGraph.links = kCoreGraph.links.concat(secondLevel.inlinks);
            kCoreGraph.links = kCoreGraph.links.concat(secondLevel.outlinks);
        }
    }

    return kCoreGraph;
}

// placeholder perché non ho scaricato la mappatura degli id
// per ora glielo passo da quando estraggo il grafo recedente
// appena la scarico modifico il metodo
function getNodeIdByAddress(address: string, placeholder = -1): number {
    if (address = '')
        return 37028167;
    else if (placeholder != -1) {
        return placeholder;
    } else if (placeholder == -1){
        return 37028167;
    } else {
        return -1;
    }
}

function getNormalization(value: number, min: number, max: number): number {
    let normalizedValue = 0.5;
    if (min != max) {
        normalizedValue = (value - min)/(max - min);
    }
    return normalizedValue;
}

// per ora metto il placeholder del nodo 37028167, ma mi serve una api
export function getNodeData(id: number): Node {
    const node = {
        id: 37028167,
        address: "0x0",
        indegree: 1,
        outdegree: 0, // 
        in_amount: 0,
        out_amount: 0,
        scale: 0.5,
        timestamp: "",
        timestamp_view: Date.now().toString()
    };
    return node;
}

function getRandomTimestamp(): string {
    const now = Date.now();
    const oneYearsAgo = now - 365 * 24 * 60 * 60 * 1000;

    const randomTime =
        oneYearsAgo + Math.random() * (now - oneYearsAgo);

    return new Date(randomTime).toISOString(); // string
}

function isWithinInterval(timestampStr: string, interval: string) {
    const timestamp = new Date(timestampStr).getTime();
    if (isNaN(timestamp)) {
        throw new Error("Invalid timestamp string");
    }

    const now = Date.now();
    let intervalMs = -1;

    switch (interval) {
        case '1d':
            intervalMs = 24 * 60 * 60 * 1000;
            break;
        case '1w':
            intervalMs = 7 * 24 * 60 * 60 * 1000;
            break;
        case '1m':
            intervalMs = 30 * 24 * 60 * 60 * 1000;
            break;
        case '1y':
            intervalMs = 365 * 24 * 60 * 60 * 1000;
            break;
        default:
            console.log("SONO IN DEFAULT QUALCOSA VA STORTO")
            intervalMs = -1;
            break;
    }

    if (intervalMs == -1) {
        throw new Error("Invalid interval. Use 1d, 1w, 1m, or 1y.");
    }

    return timestamp >= now - intervalMs && timestamp <= now;
}

// media transazioni che invocano uno smart contract (SC) nell'intervallo di sampling considerato (es, media mensile, giornaliera, ..)
export function scOverallAvg(address: any, samplingInterval: any): any {
    return {overallAvg: 82}
}

// numero di invocazioni ricevute da un SC in un intervallo definito
export function scLiveness(address: any, timeInterval: any, samplingInterval: any): Pair[] {
    let sequencePair: Pair[] = [];
    sequencePair.push({ sample: 'January', value: 10 });
    sequencePair.push({ sample: 'February', value: 17 });
    sequencePair.push({ sample: 'March', value: 9 });
    sequencePair.push({ sample: 'April', value: 13 });
    sequencePair.push({ sample: 'May', value: 11 });
    sequencePair.push({ sample: 'June', value: 20 });
    sequencePair.push({ sample: 'July', value: 19 });
    sequencePair.push({ sample: 'August', value: 27 });
    sequencePair.push({ sample: 'September', value: 26 });
    sequencePair.push({ sample: 'October', value: 22 });
    sequencePair.push({ sample: 'November', value: 19 });
    sequencePair.push({ sample: 'December', value: 14 });
    return sequencePair;
}

// numero di externally owned account (EOA) distinti che hanno invocato un SC in ogni intervallo nei sampling intervals contenuti nell'interval
export function scPopularity(address: any, timeInterval: any, samplingInterval: any): Pair[] {
    let sequencePair: Pair[] = [];
    sequencePair.push({ sample: 'Monday', value: 8 });
    sequencePair.push({ sample: 'Tuesday', value: 14 });
    sequencePair.push({ sample: 'Wednesday', value: 15 });
    sequencePair.push({ sample: 'Thursday', value: 9 });
    sequencePair.push({ sample: 'Friday', value: 22 });
    sequencePair.push({ sample: 'Sabato', value: 27 });
    sequencePair.push({ sample: 'Sunday', value: 19 });
    return sequencePair;
}

// media transazioni sottomesse da un EOA nell'intervallo di tempo considerato 
export function eoaOverallAvg(address: any, samplingInterval: any, type: any): any {
    return {overallAvg: 129};
}

// numero di invocazioni fatte da un EOA in un intervallo definito in ogni intervallo di sampling (tipo ogni giorno) a seconda del tipo di transazione
export function eoaLiveness(address: any, timeInterval: any, samplingInterval: any, type: any): Pair[] {
    let sequencePair: Pair[] = [];
    sequencePair.push({ sample: 'January', value: 20 });
    sequencePair.push({ sample: 'February', value: 44 });
    sequencePair.push({ sample: 'March', value: 60 });
    sequencePair.push({ sample: 'April', value: 54 });
    sequencePair.push({ sample: 'May', value: 75 });
    sequencePair.push({ sample: 'June', value: 58 });
    sequencePair.push({ sample: 'July', value: 44 });
    sequencePair.push({ sample: 'August', value: 51 });
    sequencePair.push({ sample: 'September', value: 60 });
    sequencePair.push({ sample: 'October', value: 66 });
    sequencePair.push({ sample: 'November', value: 59 });
    sequencePair.push({ sample: 'December', value: 55 });
    return sequencePair;
}

// numero di EOA distinti che hanno pagato l’EOA scelto in un intervallo di tempo definito, con intervallo di sampling, ad esempio 1g
export function eoaPopularity(address: any, timeInterval: any, samplingInterval: any): Pair[] {
    let sequencePair: Pair[] = [];
    sequencePair.push({ sample: '00:00', value: 2 });
    sequencePair.push({ sample: '01:00', value: 1 });
    sequencePair.push({ sample: '02:00', value: 2 });
    sequencePair.push({ sample: '03:00', value: 0 });
    sequencePair.push({ sample: '04:00', value: 1 });
    sequencePair.push({ sample: '05:00', value: 1 });
    sequencePair.push({ sample: '06:00', value: 0 });
    sequencePair.push({ sample: '07:00', value: 2 });
    sequencePair.push({ sample: '08:00', value: 2 });
    sequencePair.push({ sample: '09:00', value: 3 });
    sequencePair.push({ sample: '10:00', value: 5 });
    sequencePair.push({ sample: '11:00', value: 5 });
    sequencePair.push({ sample: '12:00', value: 10 });
    sequencePair.push({ sample: '13:00', value: 8 });
    sequencePair.push({ sample: '14:00', value: 13 });
    sequencePair.push({ sample: '15:00', value: 12 });
    sequencePair.push({ sample: '16:00', value: 17 });
    sequencePair.push({ sample: '17:00', value: 20 });
    sequencePair.push({ sample: '18:00', value: 21 });
    sequencePair.push({ sample: '19:00', value: 17 });
    sequencePair.push({ sample: '20:00', value: 18 });
    sequencePair.push({ sample: '21:00', value: 10 });
    sequencePair.push({ sample: '22:00', value: 8 });
    sequencePair.push({ sample: '23:00', value: 2 });
    return sequencePair;
}

// sequenza di coppie di numeri interi rappresentanti il numero di SC o EOA distinti che che sono stati invocati EOA nei periodi  <sample, #EOA>
export function eoaDiversification(address: any, timeInterval: any, samplingInterval: any, recvType: any): Pair[] {
    let sequencePair: Pair[] = [];
    sequencePair.push({ sample: 'Monday', value: 8 });
    sequencePair.push({ sample: 'Tuesday', value: 14 });
    sequencePair.push({ sample: 'Wednesday', value: 15 });
    sequencePair.push({ sample: 'Thursday', value: 9 });
    sequencePair.push({ sample: 'Friday', value: 22 });
    sequencePair.push({ sample: 'Saturday', value: 27 });
    sequencePair.push({ sample: 'Sunday', value: 19 });
    return sequencePair;
}
