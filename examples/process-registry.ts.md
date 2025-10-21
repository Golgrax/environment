```ts
import { ProcessRegistry } from "@octovel/environment";
import { spawn } from "node:child_process";

const registry = new ProcessRegistry();
const proc = spawn("node", ["app.js"]);

registry.add({ pid: proc.pid!, command: "node", args: ["app.js"], name: "App Server" }, proc);

console.log("Registered:", registry.count());

const record = registry.get(proc.pid!);
console.log("Process info:", record);

registry.remove(proc.pid!);
console.log("Remaining:", registry.count());
```
