```ts
import { ProcessManager } from "@octovel/environment";

interface EnvSchema {
  NODE_ENV: string;
  API_KEY?: string;
}

const manager = new ProcessManager<EnvSchema>();

// Set variables
manager.set("NODE_ENV", "development");
manager.setTemporary("API_KEY", "secret", { ttl: 5000 });

// Get variables
console.log(manager.get("NODE_ENV")); // "development"

// Hooks
manager.onAdd((key, value) => console.log(`Added ${key}=${value}`));

// Snapshot & restore
const snap = manager.snapshot();
manager.set("NODE_ENV", "production");
manager.restore(snap);

// Increment numeric value
manager.set("COUNTER", 1);
manager.increment("COUNTER", 2); // COUNTER = 3
```
