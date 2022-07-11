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

use std::convert::TryFrom;

use futures::StreamExt;
use log::{error, info, warn};
use tauri::{AppHandle, Manager, Wry};

use crate::{
    commands::status,
    docker::ImageType,
    grpc::{BaseNodeIdentity, GrpcBaseNodeClient, SyncProgress, SyncProgressInfo, SyncType},
};

pub const ONBOARDING_PROGRESS_DESTINATION: &str = "tari://onboarding_progress";

#[tauri::command]
pub async fn base_node_sync_progress(app: AppHandle<Wry>) -> Result<(), String> {
    info!("Setting up progress info stream");
    let mut client = GrpcBaseNodeClient::new();
    let mut stream = client.stream().await.map_err(|e| e.chained_message())?;

    let app_clone = app.clone();
    tauri::async_runtime::spawn(async move {
        let block_progress = &mut SyncProgress::new(SyncType::Block, 0, 0);
        let header_progress = &mut SyncProgress::new(SyncType::Header, 0, 0);
        info!("Syncing blocks progress is started....");
        while let Some(message) = stream.next().await {
            if let Some(sync_type) = message.sync_type {
                match sync_type {
                    SyncType::Header => {
                        if header_progress.started {
                            header_progress.sync(message.local_height, message.tip_height);
                            let progress = SyncProgressInfo::from(header_progress.clone());
                            if let Err(err) = app_clone.emit_all(ONBOARDING_PROGRESS_DESTINATION, progress) {
                                warn!("Could not emit event to front-end, {:?}", err);
                            }
                        } else {
                            header_progress.start(message.local_height, message.tip_height);
                        }
                    },
                    SyncType::Block => {
                        if block_progress.started {
                            let progress = SyncProgressInfo::from(block_progress.clone());
                            if let Err(err) = app_clone.emit_all(ONBOARDING_PROGRESS_DESTINATION, progress) {
                                warn!("Could not emit event to front-end, {:?}", err);
                            }
                        } else {
                            block_progress.start(message.local_height, message.tip_height);
                        }
                    },
                }
            }
        }
    });
    Ok(())
}

#[tauri::command]
pub async fn node_identity() -> Result<BaseNodeIdentity, String> {
    // Check if wallet container is running.
    let status = status(ImageType::BaseNode).await;
    if "running" == status.to_lowercase() {
        let mut node_client = GrpcBaseNodeClient::new();
        let identity = node_client.identity().await.map_err(|e| e.to_string())?;
        info!("SUCCESS: IDENTITY: {:?}", identity);
        BaseNodeIdentity::try_from(identity)
    } else {
        error!("Base node container[image = {}] is not running", ImageType::BaseNode);
        Err("tari_base_node is not running".to_string())
    }
}
