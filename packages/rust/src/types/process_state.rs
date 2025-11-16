#[derive(Debug)]
#[cfg(unix)]
pub enum ProcessState {
    Running,
    InterruptableSleep,
    UninterruptableSleep,
    Stopped,
    Zombie,
    String(String)
}