mod tests {
    #[allow(unused_imports)]
    use octovel_environment::process::ProcessController;
    
    #[cfg(unix)]
    #[test]
    pub fn tests_process_process_controller_read_stdout() {
        let mut process = ProcessController::new();
        let (stdout, stderr) = process.start("sh", &vec!["-c", "echo Hello, World!"]).unwrap();
        process.close(stderr).unwrap();
        let stdout_content = process.read(stdout).unwrap();
        process.stop(15).unwrap();
        assert_eq!(stdout_content, "Hello, World!\n".to_string());
    }

    #[cfg(unix)]
    #[test]
    pub fn tests_process_process_controller_is_running_true() {
        let mut process = ProcessController::new();
        let (stdout, stderr) = process.start("sh", &vec!["-c", "sleep 100"]).unwrap();
        process.close(stdout).unwrap();
        process.close(stderr).unwrap();
        let (_, running) = process.wait(1);
        process.stop(15).unwrap();
        assert_eq!(running, 0);
    }

    #[cfg(unix)]
    #[test]
    pub fn tests_process_process_controller_is_running_false() {
        let mut process = ProcessController::new();
        let (stdout, stderr) = process.start("sh", &vec!["-c", "sleep 100"]).unwrap();
        process.close(stdout).unwrap();
        process.close(stderr).unwrap();
        process.stop(9).unwrap();
        std::thread::sleep(std::time::Duration::from_millis(1000));
        let (_, running) = process.wait(1);
        assert_ne!(running, 0);
    }

    #[cfg(unix)]
    #[test]
    pub fn tests_process_process_controller_is_running_waited_false() {
        let mut process = ProcessController::new();
        let (stdout, stderr) = process.start("sh", &vec!["-c", "sleep 2"]).unwrap();
        process.close(stdout).unwrap();
        process.close(stderr).unwrap();
        let _ = process.wait(0);
        let (_, running) = process.wait(1);
        assert_ne!(running, 0);
    }
}