//  Copyright 2022, The Tari Project
//
//  Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
//  following conditions are met:
//
//  1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following
//  disclaimer.
//
//  2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the
//  following disclaimer in the documentation and/or other materials provided with the distribution.
//
//  3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote
//  products derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
//  INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
//  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
//  SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
//  SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
//  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
//  USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

use std::{
    sync::RwLock,
    thread::sleep,
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};

use log::debug;
use serde::Serialize;

lazy_static! {
    pub static ref BLOCK_PROGRESS: RwLock<SyncProgress> = RwLock::new(SyncProgress::new(SyncType::Block, 0, 0,));
    pub static ref HEADER_PROGRESS: RwLock<SyncProgress> = RwLock::new(SyncProgress::new(SyncType::Header, 0, 0,));
}

pub const BLOCKS_SYNC_EXPECTED_TIME_SEC: u64 = 7200;
pub const HEADERS_SYNC_EXPECTED_TIME_SEC: u64 = 1800;

#[derive(Serialize, Clone, Debug)]
pub struct SyncInfo {
    sync_type: SyncType,
    starting_items_index: u64,
    synced_items: u64,
    total_items: u64,
    elapsed_time_sec: u64,
    min_estimated_time_sec: u64,
    max_estimated_time_sec: u64,
}

#[derive(Debug, Clone)]
pub struct SyncProgress {
    pub sync_type: SyncType,
    pub start_time: Instant,
    pub started: bool,    
    pub start_index: u64,
    pub total_items: u64,
    pub sync_items: u64,
    pub new_items: u64,
    pub min_remaining_time: u64,
    pub max_remaining_time: u64,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
pub enum SyncType {
    Block,
    Header,
}

impl SyncProgress {
    fn new(sync_type: SyncType, local_height: u64, tip_height: u64) -> Self {
        SyncProgress {
            sync_type,
            started: false,
            start_index: local_height,
            total_items: tip_height,
            start_time: Instant::now(),
            sync_items: 0,
            max_remaining_time: 7200,
            min_remaining_time: 0,
            new_items: 0,
        }
    }

    fn sync_local_items(&mut self, local_height: u64) {
        self.sync_items = local_height;
    }

    fn sync_total_items(&mut self, tip_height: u64) {
        self.new_items = tip_height - self.total_items;
    }
}


impl SyncInfo {
    fn new(sync_type: SyncType, synced_items: u64, total_items: u64) -> Self {
        SyncInfo {
            sync_type: sync_type.clone(),
            starting_items_index: synced_items,
            synced_items,
            total_items,
            elapsed_time_sec: 0,
            min_estimated_time_sec: 0,
            max_estimated_time_sec: match sync_type {
                SyncType::Header => HEADERS_SYNC_EXPECTED_TIME_SEC,
                _ => BLOCKS_SYNC_EXPECTED_TIME_SEC
            },
        }
    }
}

impl From<SyncProgress> for SyncInfo {
    fn from(source: SyncProgress) -> Self {
        SyncInfo {
            sync_type: source.sync_type,
            starting_items_index: source.start_index,
            synced_items: source.sync_items,
            total_items: source.total_items,
            elapsed_time_sec: source.start_time.elapsed().as_secs(),
            max_estimated_time_sec: source.max_remaining_time,
            min_estimated_time_sec: source.min_remaining_time,
        }
    }
}

/// Init and start progress tracking headers syncing.
pub fn start_sync_header(progress: &mut SyncProgress, local_height: u64, tip_height: u64) {
    debug!("Start syncing: HEADERS");
    progress.start_index = local_height;
    progress.sync_items = local_height;
    progress.total_items = tip_height;
    progress.start_time = Instant::now();
    progress.started = true;
}
/// Init and start progress tracking blocks syncing.
pub fn start_sync_block(local_height: u64, tip_height: u64) {
    debug!("Start syncing: BLOCKS");
    let mut progress = BLOCK_PROGRESS.write().unwrap();
    progress.start_index = local_height;
    progress.sync_items = local_height;
    progress.total_items = tip_height;
    progress.start_time = Instant::now();
    progress.started = true;
}


/// Update sync_items and cacludate remaing times.
pub fn sync(progress_info: &mut SyncProgress, local_height: u64) -> SyncInfo {
    progress_info.sync_local_items(local_height);
    calucate_estimated_times(progress_info);
    SyncInfo::from(progress_info.clone())
}

fn calculate_remaining_time_in_sec(current_progress: f32, elapsed_time_in_sec: f32) -> f32 {
    elapsed_time_in_sec * (100.0 - current_progress) / current_progress
}
/// Calculates max_remaining_time and min_remaining_time based on progress rate.
fn calucate_estimated_times(progress_info: &mut SyncProgress) {
    let expected_time_in_sec = match progress_info.sync_type {
        SyncType::Block => BLOCKS_SYNC_EXPECTED_TIME_SEC,
        SyncType::Header => HEADERS_SYNC_EXPECTED_TIME_SEC,
    } as f32;
    let elapsed_time_in_sec = progress_info.start_time.elapsed().as_secs_f32();

    let all_items = ((progress_info.total_items + progress_info.new_items) - progress_info.start_index) as f32;
    let all_local_items = (progress_info.sync_items - progress_info.start_index) as f32;
    let current_progress = (all_local_items * 100.0) / (all_items);
    progress_info.min_remaining_time = (elapsed_time_in_sec * (100.0 - current_progress) / current_progress) as u64;
    let remaining_parts: f32 = (100.0 - current_progress as f32) / 100.0;
    progress_info.max_remaining_time = (expected_time_in_sec * remaining_parts) as u64;
}
/// Calculates current progress: progress = sync_items/all_items.
/// It is possible new blocks to be mined meanwhile.
fn calculate_progress_rate(progress: &SyncProgress) -> f32 {
    let all_items = ((progress.total_items + progress.new_items) - progress.start_index) as f32;
    let all_local_items = (progress.sync_items - progress.start_index) as f32;
    (all_local_items * 100.0) / (all_items)
}

fn calculate_overall_progress_rate(progress: &SyncProgress) -> f32 {
    let all_items = (progress.total_items + progress.new_items) as f32;
    let all_local_items = (progress.sync_items - progress.start_index) as f32;
    (all_local_items * 100.0) / (all_items)
}


#[test]
fn progress_info_test() {
    assert!(true);
    let local = 250;
    let tip = 1250;
    let sleep_sec = 5;
    let mut progress_info = HEADER_PROGRESS.write().unwrap();
    assert!(!progress_info.started);
    start_sync_header(&mut progress_info, local, tip);
    assert!(progress_info.started);
    let max_time_interval = HEADERS_SYNC_EXPECTED_TIME_SEC/10;
    for i in 1..11 {
        let local_height = local + i * (tip - local) / 10;
        println!("iteration: {}, blocks: {}", i, local_height);
        sleep(Duration::from_secs(sleep_sec));
        let progress = sync(&mut progress_info, local_height);
        println!("Progress: {:?}", progress);
        assert_eq!(HEADERS_SYNC_EXPECTED_TIME_SEC - i * max_time_interval, progress.max_estimated_time_sec);
        assert_eq!((10 - i) * sleep_sec, progress.min_estimated_time_sec);
        assert_eq!(i * sleep_sec, progress.elapsed_time_sec);
        assert_eq!(local + i * 100, progress.synced_items);
        let actual_total_items = progress.total_items - progress.starting_items_index;
        let actual_synced_items = progress.synced_items - progress.starting_items_index;
        let progress_percentage = actual_synced_items as f32 / actual_total_items as f32;
        assert_eq!(i as f32 / 10.0, progress_percentage);
    }
}
