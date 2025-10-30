pub struct ProcessController {
    process_id: i32
}

impl ProcessController {
    /// Constructs a new `octovel_environment::process::ProcessController` (`Self`).
    /// 
    /// # Returns
    /// `octovel_environment::process::ProcessController` (`Self`).
    #[must_use]
    pub const fn new() -> Self {
        Self {
            process_id: -1
        }
    }

    /// Starts a new process on unix.
    /// 
    /// # Param 1
    /// command - `&str` - The command name.
    /// # Param 2
    /// args - `&Vec<&str>` - The args of the command.
    /// 
    /// # Returns
    /// `Result<(i32, i32), String>`
    /// # Errors
    #[cfg(unix)]
    pub fn start(&mut self, command: &str, args: &Vec<&str>) -> Result<(i32, i32), String> {
        unsafe extern "C" {
            fn fork() -> i32;
            fn execvp(path: *const i8, arg: *const *const i8) -> i32;
            fn pipe(fildes: *mut i32) -> i32;
            fn close(fildes: i32) -> i32;
            fn dup2(oldfd: i32, newfd: i32) -> i32;
        }
        
        if self.process_id != -1 {
            return Err("There is already a running process!".to_string());
        }

        let mut pipe_stdout = [0; 2];
        let mut pipe_stderr = [0; 2];
        unsafe {
            if pipe(pipe_stdout.as_mut_ptr()) < 0 {
                return Err("Could not add a stdout pipe".to_string())
            } else if pipe(pipe_stderr.as_mut_ptr()) < 0 {
                return Err("Could not add a stderr pipe".to_string())
            }
        };

        let pid = unsafe {
            fork()
        };

        if pid < 0 {
            return Err("Could not create a new process via fork.".to_string());
        }

        self.process_id = pid;

        if pid == 0 {
            unsafe {
                use std::{
                    ffi::CString, ptr::null
                };
                

                close(pipe_stdout[0]);
                close(pipe_stderr[0]);

                dup2(pipe_stdout[1], 1);
                dup2(pipe_stderr[1], 2);

                close(pipe_stdout[1]);
                close(pipe_stderr[1]);
                
                let mut cstrings: Vec<CString> = Vec::new();
                match CString::new(command) {
                    Ok(cstr) => cstrings.push(cstr),
                    Err(_) => return Err("Could not transform Rust &str to C String".to_string())
                }
                
                for &arg in args {
                    match CString::new(arg) {
                        Ok(cstr) => cstrings.push(cstr),
                        Err(_) => return Err("Could not transform Rust &str to C String".to_string())
                    }
                }
                
                let mut exec_argv: Vec<*const i8> = cstrings.iter().map(|cs| cs.as_ptr()).collect();
                exec_argv.push(null());

                execvp(cstrings[0].as_ptr(), exec_argv.as_ptr());
                
                return Err("Could not start the process!".to_string());
            }
        }
        unsafe {
            close(pipe_stdout[1]);
            close(pipe_stderr[1]);
        }
        Ok((pipe_stdout[0], pipe_stderr[0]))
    }

    /// Stops the running process on unix.
    /// 
    /// # Param 1
    /// sig - `i32` - The signal to send.
    /// 
    /// # Returns
    /// `Result<(), String>`
    /// # Errors
    #[cfg(unix)]
    pub fn stop(&mut self, sig: i32) -> Result<(), String> {
        unsafe extern "C" {
            fn kill(pid: i32, sig: i32) -> i32;
        }

        if self.process_id == -1 {
            return Err("No running process to stop!".to_string());
        }

        unsafe {
            if kill(self.process_id, sig) != 0 {
                return Err("Could not kill process!".to_string());
            }
        };
        self.process_id = -1;
        Ok(())
    }

    /// Restarts the process.
    /// 
    /// # Param 1
    /// sig - `i32` - The signal to send.
    /// # Param 2
    /// command - `&str` - The command name.
    /// # Param 3
    /// args - `&Vec<&str>` - The args of the command.
    /// 
    /// # Returns
    /// `Result<Result<(i32, i32), String>, String>`
    /// # Errors
    #[cfg(unix)]
    pub fn restart(&mut self, sig: i32, command: &str, args: &Vec<&str>) -> Result<Result<(i32, i32), String>, String> {
        if self.process_id == -1 {
            return Err("No running process to restart!".to_string());
        }

        let (pid, running) = self.wait(1);
        if pid == -1 {
            return Err("Oops, could not restart".to_string());
        }

        if running == 0 {
            match self.stop(sig) {
                Ok(()) => {}
                Err(e) => return Err(e)
            }
        } else {
            self.process_id = -1;
        }
            Ok(self.start(command, args))
    }

    /// Waits for the process to end.
    /// 
    /// # Param 1
    /// flags - `i32` - Options
    /// 
    /// # Returns
    /// `(i32, i32)`
    #[cfg(unix)]
    #[must_use]
    pub fn wait(&self, flags: i32) -> (i32, i32) {
        unsafe extern "C" {
            fn waitpid(pid: i32, status: *mut i32, options: i32) -> i32;
        }

        let mut stat: i32 = 0;
        unsafe {
            let wait_res = waitpid(self.process_id, &raw mut stat, flags);
            (stat, wait_res)
        }
    }

    /// Reads the file descriptor.
    /// 
    /// # Param 1
    /// fildes - `i32` - The file descriptor to read.
    /// 
    /// # Returns
    /// `Result<String, String>`
    /// # Errors
    #[cfg(unix)]
    pub fn read(&self, fildes: i32) -> Result<String, String> {
        use std::{
            fs::File,
            os::fd::FromRawFd,
            io::Read
        };

        let mut out = Vec::new();

        unsafe {
            match File::from_raw_fd(fildes).read_to_end(&mut out) {
                Ok(_) => Ok(String::from_utf8_lossy(&out).into_owned()),
                Err(err) => Err(err.to_string())
            }
        }
    }
}

/// Implements `Default` to `octovel_environment::process::ProcessController`
impl Default for ProcessController {
    fn default() -> Self {
        Self::new()
    }
}