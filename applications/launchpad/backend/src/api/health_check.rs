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

use std::{convert::TryFrom, thread};

use log::{debug, warn};
use serde::Serialize;
use tauri::{async_runtime::block_on, AppHandle, Manager, Wry};
use tokio::time::Duration;

use crate::{
    commands::DEFAULT_IMAGES,
    docker::{check_status, validate_wallet_password, ImageType, DOCKER_INSTANCE},
};

#[derive(Clone, Debug, Serialize)]
struct HealthCheck {
    image_name: String,
    status: String,
}

#[tauri::command]
pub async fn subsribe_for_health_check_updates(app: AppHandle<Wry>) -> Result<(), String> {
    let app_clone = app.clone();
    thread::spawn(|| block_on(monitor(app_clone)));
    Ok(())
}

#[tauri::command]
pub async fn image_status(image: &str) -> Result<String, String> {
    let image_type = ImageType::try_from(image).map_err(|_| "Invalid image type".to_string())?;
    let status = check_status(image_type, &DOCKER_INSTANCE.clone())
        .await
        .map_err(|e| e.chained_message())?;
    Ok(status.to_string())
}

#[tauri::command]
pub async fn wallet_password_check() -> Result<(), String> {
    validate_wallet_password().await.map_err(|e| e.chained_message())
}

async fn monitor(app: AppHandle) {
    let docker = &DOCKER_INSTANCE.clone();
    debug!("Subscribing for health check updates");
    loop {
        for image in &DEFAULT_IMAGES {
            match check_status(image.clone(), docker).await {
                Ok(status) => {
                    if let Err(err) = app.emit_all("tari://health_check", HealthCheck {
                        image_name: image.image_name().to_string(),
                        status: status.to_string(),
                    }) {
                        warn!("Could not emit health check update event to front-end, {:?}", err);
                    }
                },
                Err(err) => {
                    warn!("Could not check status of image {:?}, {:?}", image, err);
                },
            }
        }
        tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
    }
}
