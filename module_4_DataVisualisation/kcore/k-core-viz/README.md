# K-core decomposition

https://observablehq.com/d/b5e14db77ba4ee9a@1591

<img width="1718" height="1697" alt="example" src="https://github.com/user-attachments/assets/0db9be80-b55c-4316-bcaa-0ba07b53514b" />

<img width="1701" height="1624" alt="example2" src="https://github.com/user-attachments/assets/278e75b3-100a-49ce-a938-652d56202d78" />

<img width="3556" height="2119" alt="example3" src="https://github.com/user-attachments/assets/3344013c-ecec-48aa-8ec9-cac92bfb3e74" />

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

