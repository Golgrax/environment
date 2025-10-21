```ts
import { SystemEnvironment, WindowsRegistryType, Platform } from "@octovel/environment";

interface MySystemEnv {
  PATH: string;
  JAVA_HOME: string;
  NODE_ENV: string;
}

const env = new SystemEnvironment<MySystemEnv>(Platform.Windows);

// Set variable
env.set("JAVA_HOME", "C:\\Program Files\\Java", {
  type: WindowsRegistryType.REG_EXPAND_SZ,
});

// Get variable
const javaPath = env.get("JAVA_HOME", { defaultValue: "NotFound" });
console.log("JAVA_HOME =", javaPath);

// List variables
console.log("Keys:", env.listKeys());
console.log("Values:", env.listValues());

// Save backup
await env.saveToFile("./system-env.json");

// Remove variable
env.remove("JAVA_HOME");
```
