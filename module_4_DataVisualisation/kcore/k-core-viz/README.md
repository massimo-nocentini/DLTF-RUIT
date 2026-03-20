# K-core decomposition

https://observablehq.com/d/b5e14db77ba4ee9a@1591


Examples of resulting visualizations of graphs with varying dimension and structure.

In the diagrams, the represented nodes are those progressively removed by the k-core decomposition algorithm. They are grouped into black circles whose area is proportional to the number of nodes they contain.

At each step `n` of the algorithm, the removed nodes (*n-shell*) are shown as a black circle, placed alongside a colored circle representing the core (*n-core*).

Iteratively, higher-order cores are formed, and are depicted using progressively more intense colors. Every ten levels, the color intensity resets to a lighter shade while the hue changes. Since, in some cases, removing a shell may yield a core composed of multiple connected components (resulting in a branching structure in the decomposition tree), it is possible for multiple colored circles—each representing a connected component of the core—to appear next to a single black circle corresponding to a shell. In such cases, the visualization highlights this condition with a black outline.

This representation enables the identification of strongly connected regions of the graph, as these persist longer during the decomposition process and may indicate groups of nodes with significant topological relevance.


<img width="3556" height="2119" alt="example3" src="https://github.com/user-attachments/assets/3344013c-ecec-48aa-8ec9-cac92bfb3e74" />

<img width="1718" height="1697" alt="example" src="https://github.com/user-attachments/assets/0db9be80-b55c-4316-bcaa-0ba07b53514b" />

<img width="1701" height="1624" alt="example2" src="https://github.com/user-attachments/assets/278e75b3-100a-49ce-a938-652d56202d78" />


View this notebook in your browser by running a web server in this folder. For
example:

~~~sh
npx http-server
~~~

Or, use the [Observable Runtime](https://github.com/observablehq/runtime) to
import this module directly into your application. To npm install:

~~~sh
npm install @observablehq/runtime@5
npm install https://api.observablehq.com/d/b5e14db77ba4ee9a@1591.tgz?v=3
~~~

Then, import your notebook and the runtime as:

~~~js
import {Runtime, Inspector} from "@observablehq/runtime";
import define from "b5e14db77ba4ee9a";
~~~

To log the value of the cell named “foo”:

~~~js
const runtime = new Runtime();
const main = runtime.module(define);
main.value("foo").then(value => console.log(value));
~~~

