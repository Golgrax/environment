```ts
import { UserEnvironment, Platform, WindowsRegistryType } from "@octovel/environment";

interface MyEnvironment {
  [key: string]: string;
  TEST_PATH: string;
  NODE_ENV: string;
}

const env = new UserEnvironment<MyEnvironment>(Platform.Windows);

// Set variable
env.set("TEST_PATH", "%ProgramFiles%\\MyApp", {
  type: WindowsRegistryType.REG_EXPAND_SZ,
});

// Get variable
const val = env.get("TEST_PATH");
console.log("TEST_PATH =", val);

// List variables
console.log("Keys:", env.listKeys());
console.log("Values:", env.listValues());

// Save backup
await env.saveToFile("./user-env.json");

// Remove variable
env.remove("TEST_PATH");
```
