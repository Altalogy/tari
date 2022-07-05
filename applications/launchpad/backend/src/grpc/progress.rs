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
    cell::RefCell,
    sync::{Arc, Mutex, RwLock},
    thread::sleep,
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};

use log::debug;
use serde::Serialize;

use super::{SyncProgress, SyncProgressInfo, SyncType, BLOCKS_SYNC_EXPECTED_TIME_SEC};
use crate::grpc::HEADERS_SYNC_EXPECTED_TIME_SEC;

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
pub fn start_sync_block(progress: &mut SyncProgress, local_height: u64, tip_height: u64) {
    debug!("Start syncing: BLOCKS");
    progress.start_index = local_height;
    progress.sync_items = local_height;
    progress.total_items = tip_height;
    progress.start_time = Instant::now();
    progress.started = true;
}

/// Update sync_items and cacludate remaing times.
pub fn sync(progress_info: &mut SyncProgress, local_height: u64) -> SyncProgressInfo {
    progress_info.sync_local_items(local_height);
    calucate_estimated_times(progress_info);
    SyncProgressInfo::from(progress_info.clone())
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
    let local = 250;
    let tip = 1250;
    let sleep_sec = 5;
    let mut progress_info = SyncProgress::new(SyncType::Header, 0, 0);
    assert!(!progress_info.started);
    start_sync_header(&mut progress_info, local, tip);
    assert!(progress_info.started);
    let max_time_interval = HEADERS_SYNC_EXPECTED_TIME_SEC / 10;
    for i in 1..11 {
        let local_height = local + i * (tip - local) / 10;
        println!("iteration: {}, blocks: {}", i, local_height);
        sleep(Duration::from_secs(sleep_sec));
        let progress = sync(&mut progress_info, local_height);
        println!("Progress: {:?}", progress);
        assert_eq!(
            HEADERS_SYNC_EXPECTED_TIME_SEC - i * max_time_interval,
            progress.max_estimated_time_sec
        );
        assert_eq!((10 - i) * sleep_sec, progress.min_estimated_time_sec);
        assert_eq!(i * sleep_sec, progress.elapsed_time_sec);
        assert_eq!(local + i * 100, progress.synced_items);
        let actual_total_items = progress.total_items - progress.starting_items_index;
        let actual_synced_items = progress.synced_items - progress.starting_items_index;
        let progress_percentage = actual_synced_items as f32 / actual_total_items as f32;
        assert_eq!(i as f32 / 10.0, progress_percentage);
    }
}
