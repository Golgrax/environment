#[cfg(unix)]
use crate::types::ProcessInfo;
#[cfg(unix)]
use std::{
    fs::read_to_string,
    path::Path
};

/// A struct for managing a process.
pub struct ProcessRegistry {
    #[allow(dead_code)]
    pid: i32
}

impl ProcessRegistry {
    /// Constructs a new `octovel_environment::process::ProcessRegistry` (`Self`).
    /// 
    /// # Returns
    /// `octovel_environment::process::ProcessRegistry` (`Self`).
    #[must_use]
    pub const fn new(pid: i32) -> Self {
        Self {
            pid
        }
    }

    /// Returns info about the process.
    /// 
    /// # Returns
    /// `Result<octovel_environment::types::ProcessInfo`
    /// # Errors
    /// # Panics
    #[allow(clippy::too_many_lines)]
    #[cfg(unix)]
    pub fn get_info(&self) -> Result<ProcessInfo, String> {
        let path = Path::new("/proc").join(self.pid.to_string()).join("status");
        if !path.exists() {
            return Err(format!("Process with the ID of {} does not exist.", self.pid));
        }
        
        #[allow(unused_assignments)]
        let mut info = Vec::new();
        match read_to_string(path) {
            Ok(s) => {
                use crate::types::ProcessInfo;

                info = s 
                    .lines()
                    .map(|line| { 
                        line.split('\t')
                            .map(str::to_string)
                            .collect::<Vec<String>>()
                        })
                        .collect::<Vec<Vec<String>>>();


                Ok(ProcessInfo {
                    name: info[0][1]
                        .trim()
                        .to_string(),
                    umask: info[1][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    state: info[2][1]
                        .trim()
                        .to_string(),
                    tgid: info[3][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    ngid: info[4][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    pid: info[5][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    p_pid: info[6][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    tracer_pid: info[7][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    uid: info[8]
                        .iter()
                        .skip(1)
                        .map(|s| s
                            .trim()
                            .parse()
                            .unwrap())
                        .collect(),
                    gid: info[9]
                        .iter()
                        .skip(1)
                        .map(|s| s
                            .trim()
                            .parse()
                            .unwrap())
                        .collect(),
                    fd_size: info[10][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    groups: info[11][1]
                        .split_whitespace()
                        .map(|s| s
                            .parse()
                            .unwrap())
                        .collect(),
                    ns_tgid: info[12][1]
                        .parse::<i32>()
                        .unwrap(),
                    ns_pid: info[13][1]
                        .parse()
                        .unwrap(),
                    ns_pgid: info[14][1]
                        .parse()
                        .unwrap(),
                    ns_sid: info[15][1]
                        .parse()
                        .unwrap(),
                    k_thread: info[16][1]
                        .parse()
                        .unwrap(),
                    vm_peak: info[17][1]
                        .trim()
                        .to_string(),
                    vm_size: info[18][1]
                        .trim()
                        .to_string(),
                    vm_lck: info[19][1]
                        .trim()
                        .to_string(),
                    vm_pin: info[20][1]
                        .trim()
                        .to_string(),
                    vm_hwm: info[21][1]
                        .trim()
                        .to_string(),
                    vm_rss: info[22][1]
                        .trim()
                        .to_string(),
                    rss_anon: info[23][1]
                        .trim()
                        .to_string(),
                    rss_file: info[24][1]
                        .trim()
                        .to_string(),
                    rss_shmem: info[25][1]
                        .trim()
                        .to_string(),
                    vm_data: info[26][1]
                        .trim()
                        .to_string(),
                    vm_stk: info[27][1]
                        .trim()
                        .to_string(),
                    vm_exe: info[28][1]
                        .trim()
                        .to_string(),
                    vm_lib: info[29][1]
                        .trim()
                        .to_string(),
                    vm_pte: info[30][1]
                        .trim()
                        .to_string(),
                    vm_swap: info[31][1]
                        .trim()
                        .to_string(),
                    huge_tlb_pages: info[32][1]
                        .trim()
                        .to_string(),
                    core_dumping: info[33][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    thp_enabled: info[34][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    untag_mask: info[35][1]
                        .trim()
                        .to_string(),
                    threads: info[36][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    sig_q: info[37][1]
                        .trim()
                        .split('/')
                        .map(|s| s
                            .parse()
                            .unwrap()
                        )
                        .collect(),
                    sig_pnd: info[38][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    shd_pnd: info[39][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    sig_blk: info[40][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    sig_ign: info[41][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    sig_cgt: info[42][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    cap_inh: info[43][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    cap_prm: info[44][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    cap_eff: info[45][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    cap_bnd: info[46][1]
                        .trim()
                        .to_string(),
                    cap_amb: info[47][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    no_new_privs: info[48][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    sec_comp: info[49][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    sec_comp_filters: info[50][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    speculation_store_bypass: info[51][1]
                        .trim()
                        .to_string(),
                    speculation_indirect_branch: info[52][1]
                        .trim()
                        .to_string(),
                    cpus_allowed: info[53][1]
                        .trim()
                        .to_string(),
                    cpus_allowed_list: info[54][1]
                        .trim()
                        .split('-')
                        .map(|s| s
                            .parse()
                            .unwrap()
                        )
                        .collect(),
                    mems_allowed: info[55][1]
                        .trim()
                        .split(',')
                        .map(|s| s
                            .parse()
                            .unwrap()
                        )
                        .collect(),
                    mems_allowed_list: info[56][1]
                        .trim()
                        .split('-')
                        .map(|s| s
                            .parse()
                            .unwrap()
                        )
                        .collect(),
                    voluntary_ctxt_switches: info[57][1]
                        .trim()
                        .parse()
                        .unwrap(),
                    nonvoluntary_ctxt_switches: info[58][1]
                        .trim()
                        .parse()
                        .unwrap(),
                })
            }
            Err(err) => Err(err.to_string())
        }
    }
}