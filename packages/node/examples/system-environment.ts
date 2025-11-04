import { SystemEnvironment } from "../source";

const systemEnv = new SystemEnvironment(process.platform);

// Get a system variable
const path = systemEnv.get("PATH");
console.log(`System PATH is: ${path}`);

// Set a new system variable (requires admin privileges)
// systemEnv.set("MY_SYSTEM_VAR", "hello world");

// Get OS and hardware info
console.log(`OS: ${systemEnv.getOS()}`);
console.log(`CPU: ${JSON.stringify(systemEnv.getCPU())}`);
console.log(`Memory: ${JSON.stringify(systemEnv.getMemory())}`);
