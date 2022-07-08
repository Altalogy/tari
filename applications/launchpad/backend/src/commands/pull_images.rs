// Copyright 2021. The Tari Project
//
// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
// following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following
// disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the
// following disclaimer in the documentation and/or other materials provided with the distribution.
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

use bollard::models::CreateImageInfo;
use futures::{future::join_all, stream::StreamExt, Stream, TryFutureExt};
use log::{debug, error, warn};
use serde::Serialize;
use tauri::{AppHandle, Manager, Wry};

use crate::{
    commands::AppState,
    docker::{DockerWrapper, DockerWrapperError, ImageType, TariWorkspace, DOCKER_INSTANCE},
    error::LauncherError,
};

const LOG_TARGET: &str = "tari::launchpad::commands::pull_images";

#[derive(Debug, Clone, Serialize)]
pub struct Payload {
    image: String,
    name: String,
    info: CreateImageInfo,
}

pub static DEFAULT_IMAGES: [ImageType; 9] = [
    ImageType::Tor,
    ImageType::BaseNode,
    ImageType::Wallet,
    ImageType::Sha3Miner,
    ImageType::XmRig,
    ImageType::MmProxy,
    ImageType::Loki,
    ImageType::Promtail,
    ImageType::Grafana,
];

/// Pulls all the images concurrently using the docker API.
#[tauri::command]
pub async fn pull_images(app: AppHandle<Wry>) -> Result<(), String> {
    debug!("Command pull_images invoked");
    let futures = DEFAULT_IMAGES
        .iter()
        .map(|image| pull_image(image.image_name(), app.clone()).map_err(|e| format!("error pulling image: {}", e)));
    let results: Vec<Result<_, String>> = join_all(futures).await;
    let errors = results
        .into_iter()
        .filter(|r| r.is_err())
        .map(|e| e.unwrap_err())
        .collect::<Vec<String>>();
    if !errors.is_empty() {
        error!("Error pulling images:{}", errors.join("\n"));
        return Err(errors.join("\n"));
    }
    Ok(())
}

#[tauri::command]
pub async fn pull_image(image_name: &str, app: AppHandle<Wry>) -> Result<(), String> {
    let image = ImageType::try_from(image_name).map_err(|_err| format!("invalid image name: {}", image_name))?;
    let state = app.state::<AppState>().clone();
    let docker = state.docker.read().await;
    let image_name = match image {
        ImageType::Loki | ImageType::Promtail | ImageType::Grafana => format!("grafana/{}:latest", image.image_name()),
        _ => TariWorkspace::fully_qualified_image(image, None),
    };
    let mut stream = docker.pull_image(image_name.clone()).await;
    while let Some(update) = stream.next().await {
        match update {
            Ok(progress) => {
                let payload = Payload {
                    image: image_name.clone(),
                    name: image.image_name().to_string(),
                    info: progress,
                };
                debug!("Image pull progress:{:?}", payload);
                if let Err(err) = app.emit_all("tari://image_pull_progress", payload) {
                    warn!("Could not emit event to front-end, {:?}", err);
                }
            },
            Err(err) => return Err(format!("Error reading docker progress: {}", err)),
        };
    }
    Ok(())
}
