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

mod container;
mod error;
mod filesystem;
mod models;
pub mod mounts;
mod settings;
mod workspace;
mod wrapper;

pub mod helpers;
use std::{collections::HashMap, sync::RwLock, thread::sleep, time::Duration};

use bollard::{
    container::{
        Config,
        CreateContainerOptions,
        ListContainersOptions,
        LogOutput,
        LogsOptions,
        NetworkingConfig,
        RemoveContainerOptions,
    },
    image,
    models::{ContainerCreateResponse, ContainerStateStatusEnum, EndpointSettings, HostConfig},
    Docker,
};
pub use container::{add_container, change_container_status, container_state, filter, remove_container};
pub use error::DockerWrapperError;
pub use filesystem::create_workspace_folders;
use futures::{StreamExt, TryStreamExt};
use log::{debug, info};
pub use models::{ContainerId, ContainerState, ContainerStatus, ImageType, LogMessage, TariNetwork};
pub use settings::{
    BaseNodeConfig,
    LaunchpadConfig,
    MmProxyConfig,
    Sha3MinerConfig,
    WalletConfig,
    XmRigConfig,
    BASE_NODE_GRPC_ADDRESS_URL,
    DEFAULT_MINING_ADDRESS,
    DEFAULT_MONEROD_URL,
    WALLET_GRPC_ADDRESS_URL,
};
pub use workspace::{TariWorkspace, Workspaces};
pub use wrapper::DockerWrapper;

use crate::{
    commands::DEFAULT_IMAGES,
    grpc::{GrpcBaseNodeClient, SyncProgress, SyncProgressInfo, SyncType},
};

lazy_static! {
    pub static ref DOCKER_INSTANCE: Docker = Docker::connect_with_local_defaults().unwrap();
}

lazy_static! {
    pub static ref CONTAINERS: RwLock<HashMap<String, ContainerState>> = RwLock::new(HashMap::new());
}

pub static DEFAULT_WORKSPACE_NAME: &str = "default";

pub const INVALID_WALLET_PASSWORD_MESSAGE: &str = "Your password was incorrect or required, but not provided.";

fn tari_blockchain_volume_name(tari_workspace: String, tari_network: TariNetwork) -> String {
    format!("{}_{}_volume", tari_workspace, tari_network.lower_case())
}

pub async fn try_create_container(
    image: ImageType,
    fully_qualified_image_name: String,
    tari_workspace: String,
    config: &LaunchpadConfig,
    docker: Docker,
) -> Result<ContainerCreateResponse, DockerWrapperError> {
    debug!("{} has configuration object: {:#?}", fully_qualified_image_name, config);
    let args = config.command(image);
    let envars = config.environment(image);
    let volumes = config.volumes(image);
    let ports = config.ports(image);
    let port_map = config.port_map(image);
    let mounts = config.mounts(
        image,
        tari_blockchain_volume_name(tari_workspace.clone(), config.tari_network),
    );
    let mut endpoints = HashMap::new();
    let endpoint = EndpointSettings {
        aliases: Some(vec![image.container_name().to_string()]),
        ..Default::default()
    };
    endpoints.insert(format!("{}_network", tari_workspace), endpoint);
    let options = Some(CreateContainerOptions {
        name: format!("{}_{}", tari_workspace, image.image_name()),
    });
    let config = Config::<String> {
        image: Some(fully_qualified_image_name.to_string()),
        attach_stdin: Some(false),
        attach_stdout: Some(false),
        attach_stderr: Some(false),
        exposed_ports: Some(ports),
        open_stdin: Some(true),
        stdin_once: Some(false),
        tty: Some(true),
        env: Some(envars),
        volumes: Some(volumes),
        cmd: Some(args),
        host_config: Some(HostConfig {
            binds: Some(vec![]),
            network_mode: Some("bridge".to_string()),
            port_bindings: Some(port_map),
            mounts: Some(mounts),
            ..Default::default()
        }),
        networking_config: Some(NetworkingConfig {
            endpoints_config: endpoints,
        }),
        ..Default::default()
    };

    Ok(docker.create_container(options, config).await?)
}

pub async fn try_destroy_container(image_name: &str, docker: Docker) -> Result<(), DockerWrapperError> {
    let mut list_container_filters = HashMap::new();
    list_container_filters.insert("name".to_string(), vec![image_name.to_string()]);
    debug!("Searching for container {}", image_name);
    let containers = &docker
        .list_containers(Some(ListContainersOptions {
            all: true,
            filters: list_container_filters,
            ..Default::default()
        }))
        .await?;

    for c_id in containers.iter() {
        if let Some(id) = c_id.id.clone() {
            debug!("Removing countainer {}", id);
            docker
                .remove_container(
                    id.as_str(),
                    Some(RemoveContainerOptions {
                        force: true,
                        ..Default::default()
                    }),
                )
                .await?;
        }
    }
    Ok(())
}

pub async fn shutdown_all_containers(workspace_name: String, docker: &Docker) -> Result<(), DockerWrapperError> {
    for image in DEFAULT_IMAGES {
        let image_name = format!("{}_{}", workspace_name, image.image_name());
        match try_destroy_container(image_name.as_str(), docker.clone()).await {
            Ok(_) => info!("Docker image {} is being stopped.", image_name),
            Err(_) => debug!("Docker image {} has not been found", image_name),
        }
    }
    Ok(())
}

pub async fn check_status(image: ImageType, docker: &Docker) -> Result<ContainerStateStatusEnum, DockerWrapperError> {
    if let Some(state) = container_state(image.container_name()) {
        let container_id = state.id.clone();
        let container_state = docker.inspect_container(container_id.as_str(), None).await?.state;
        if let Some(state) = container_state {
            match state.status {
                Some(status) => Ok(status),
                None => Err(DockerWrapperError::ContainerStatusError),
            }
        } else {
            Err(DockerWrapperError::UnexpectedError)
        }
    } else {
        Err(DockerWrapperError::ContainerNotFound(
            image.container_name().to_string(),
        ))
    }
}

pub async fn validate_wallet_password() -> Result<(), DockerWrapperError> {
    let docker = &DOCKER_INSTANCE.clone();
    let wallet_container_name = ImageType::Wallet.container_name();
    if let Some(state) = container_state(wallet_container_name) {
        let container_state = check_status(ImageType::Wallet, docker).await?;
        if container_state == ContainerStateStatusEnum::EXITED {
            let options = LogsOptions::<String> {
                follow: false,
                stdout: true,
                stderr: true,
                ..Default::default()
            };
            let logs = docker
                .logs(state.id().as_str(), Some(options))
                .try_collect::<Vec<_>>()
                .await
                .unwrap();
            if logs
                .iter()
                .map(LogOutput::to_string)
                .any(|s| s.contains(INVALID_WALLET_PASSWORD_MESSAGE))
            {
                return Err(DockerWrapperError::InvalidPassword(wallet_container_name.to_string()));
            }
        }
        Ok(())
    } else {
        Err(DockerWrapperError::ContainerNotFound(wallet_container_name.to_string()))
    }
}

#[tokio::test]
async fn read_wallet_logs_test() {
    let docker = DOCKER_INSTANCE.clone();
    let options = LogsOptions::<String> {
        follow: false,
        stdout: true,
        stderr: true,
        ..Default::default()
    };

    let mut res = docker
        .logs(
            "ead2e1b177561bd028334ecad04be78b3a6f5b1f50f13084a0b1bccd2ec70f79",
            Some(options),
        )
        .try_collect::<Vec<_>>()
        .await
        .unwrap();

    if let stream = res {
        for log in stream {
            println!("{}", log);
        }
    }
}

#[tokio::test]
async fn wallet_status_test() {
    let docker = DOCKER_INSTANCE.clone();
    let status = docker
        .inspect_container("ead2e1b177561bd028334ecad04be78b3a6f5b1f50f13084a0b1bccd2ec70f79", None)
        .await
        .unwrap()
        .state
        .unwrap()
        .status
        .unwrap()
        .to_string();
    println!("{:?}", status);
}

#[tokio::test]
#[ignore = "start docker instance and launchpad manually"]
async fn check_wallet_status() {
    info!("Checking status of wallet container");
    for _i in 1..20 {
        sleep(Duration::from_secs(1));
        let status = validate_wallet_password().await;
        match status {
            Ok(()) => println!("Wallet is running"),
            Err(e) => {
                println!("Invalid password: {}", e.chained_message());
                break;
            },
        }
    }
}
