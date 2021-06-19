// import { x } from "../src/core.js";

x(".elem {even}", { replace : "textarea" }).query(".elem {odd}", { replace : "input" });

x(".elem {0}", {value : ""});

console.log(x([], {node : ".elem {3}"}))

x([1, 34, 6, 34], { contains : 34 });