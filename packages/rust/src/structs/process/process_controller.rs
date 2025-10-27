use std::process::{Child, Command, Stdio};

pub struct ProcessController {
    pub process_child: Option<Child>
}

impl ProcessController {
    /// Constructs a `octovel_environment::process::ProcessController`. (`Self`)
    /// # Returns
    /// `octovel_environment::process::ProcessController` (`Self`)
    #[must_use]
    pub const fn new() -> Self {
        Self {
            process_child: None
        }
    }

    /// Starts a new process.
    /// 
    /// # Param 1
    /// command - `&str` - The command to run
    /// # Param 2
    /// args - `Option<Vec<&str>>` - The args of the command.
    /// 
    /// # Returns
    /// `Result<(), String>`
    /// # Errors
    /// `Err(String)` - The given command is empty
    #[must_use = "`Result` is unused. Please use it to see if the process has succesfully started, else the other functions will panic."]
    pub fn start(&mut self, command: &str, args: Option<Vec<&str>>) -> Result<(), String> {
        if self.process_child.is_some() {
            Err("There's already a running process. If you want to run more processes, construct a new struct.".to_string())
        } else if command.trim().is_empty() {
            Err("Got an empty string (\"\") for \"command\".".to_string())
        } else {
            let mut command = Command::new(command.trim());
            let mut command = command.stdout(Stdio::piped());
            command = command.stderr(Stdio::piped());
            command = command.stdin(Stdio::piped());

            if let Some(command_args) = args {
                command.args(command_args);
            }

            let process = command.spawn();
            match process {
                Ok(child) => {
                    self.process_child = Some(child);
                    Ok(())
                }
                Err(err) => Err(format!("Could not start process! Error: {err}"))
            }
        }
    }

    /// Stops a process.
    /// 
    /// # Param 1
    /// signal - `i32` - The signal to send.
    /// 
    /// # Returns
    /// `bool`.
    #[cfg(unix)]
    pub fn stop(&mut self, signal: i32) -> bool {
       unsafe extern "C" { fn kill(pid: i32, sig: i32) -> i32; }

        if let Some(child) = self.process_child.as_mut() {
            match child.id().try_into() {
                Ok(pid) => {
                    let exit_code = unsafe { kill(pid, signal) };
                    match child.wait() {
                        Ok(_) => {
                            self.process_child = None;
                            return exit_code == 0;
                        }
                        Err(_) => return false
                    }
                }
                Err(_) => return false
            };
        }
        false
    }

    /// Stops a process.
    /// 
    /// # Param 1
    /// signal - `i32` - The signal to send. (Ignored on windows.)
    /// 
    /// # Returns
    /// `bool`.
    #[cfg(windows)]
    pub fn stop(&mut self, _: i32) -> bool {
        if let Some(child) = self.process_child.as_mut() {
            let pid = child.id();
            
            let command = Command::new("taskkill")
                .args(vec!["/PID", &pid.to_string(), "/T", "/F"])
                .stdout(Stdio::null())
                .stderr(Stdio::null())
                .stdin(Stdio::null())
                .status();
            
            if let Ok(status) = command {
                if status.success() {
                    match child.wait() {
                        Ok(_) => {
                            self.process_child = None;
                            return true;
                        }
                        Err(_) => return false
                    }
                }
                    return false;
                }
            return false;
        }
        false
    }

    /// Restarts a process.
    /// 
    /// # Param 1
    /// command - `&str` - The command to run
    /// # Param 2
    /// args - `Option<Vec<&str>>` - The args of the command.
    /// # Param 3
    /// signal - `i32` - The signal to send.
    /// 
    /// # Returns
    /// `Result<(), String>`
    /// # Errors
    /// `Err(String)` - The process could not be stopped.
    pub fn restart(&mut self, command: &str, args: Option<Vec<&str>>, signal: i32) -> Result<(), String> {
        if self.stop(signal) {
            self.start(command, args)
        } else {
            Err("Could not stop the process.".to_string())
        }
    }

    /// Checks if a process is running.
    /// 
    /// # Returns
    /// `bool`.
    #[cfg(unix)]
    pub fn is_running(&mut self) -> bool {
       unsafe extern "C" { fn kill(pid: i32, sig: i32) -> i32; }

        if let Some(child) = self.process_child.as_mut() {
            match child.id().try_into() {
                Ok(pid) => {
                    return unsafe { kill(pid, 0) } == 0;
                }
                Err(_) => return false
            };
        }
        false
    }
}

impl Default for ProcessController {
    fn default() -> Self {
        Self::new()
    }
}