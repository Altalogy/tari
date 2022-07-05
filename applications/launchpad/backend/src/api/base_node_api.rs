// Copyright 2021. The Tari Project
//
// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
// following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following
// disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the
// following disclaimer in the documentation and/or other materials provided with the dist&mut ribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote
// products derived from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
// USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//

use futures::StreamExt;
use log::{info, warn};
use tauri::{AppHandle, Manager, Wry};

use crate::grpc::{start_sync_header, sync, GrpcBaseNodeClient, SyncProgress, SyncType};

#[tauri::command]
pub async fn base_node_sync_progress(app: AppHandle<Wry>) -> Result<(), String> {
    info!("Setting up progress info stream");
    let mut client = GrpcBaseNodeClient::new();
    let mut stream = client.stream().await.unwrap();

    let app_clone = app.clone();
    tauri::async_runtime::spawn(async move {
        let mut block_progress = SyncProgress::new(SyncType::Block, 0, 0);
        let mut header_progress = SyncProgress::new(SyncType::Header, 0, 0);
        info!("Syncing blocks progress is started....");
        while let Some(message) = stream.next().await {
            if message.state == 2 {
                if header_progress.started {
                    let progress = sync(&mut header_progress, message.local_height);
                    if let Err(err) = app_clone.emit_all("tari://onboarding_progress", progress) {
                        warn!("Could not emit event to front-end, {:?}", err);
                    }
                } else {
                    start_sync_header(&mut header_progress, message.local_height, message.tip_height);
                }
            }

            if message.state == 4 {
                if block_progress.started {
                    let progress = sync(&mut block_progress, message.local_height);
                    if let Err(err) = app_clone.emit_all("tari://onboarding_progress", progress) {
                        warn!("Could not emit event to front-end, {:?}", err);
                    }
                } else {
                    start_sync_header(&mut block_progress, message.local_height, message.tip_height);
                }
            }
        }
    });
    Ok(())
}
