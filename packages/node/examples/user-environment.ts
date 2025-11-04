import { UserEnvironment } from "../source";

const userEnv = new UserEnvironment(process.platform);

// Set a user-specific variable
userEnv.set("MY_APP_THEME", "dark");

// Get the variable
const theme = userEnv.get("MY_APP_THEME");
console.log(`User theme is: ${theme}`);

// List all user-specific variables
const allUserVars = userEnv.listKeys();
console.log(allUserVars);

// Remove the variable
userEnv.remove("MY_APP_THEME");
