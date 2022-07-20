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

mod docker_unit_tests {
    use std::{collections::HashMap, convert::TryFrom};
    #[cfg(test)]
    use std::{println as info, println as warn};

    use bollard::{
        container::{InspectContainerOptions, ListContainersOptions},
        models::ContainerStateStatusEnum,
        Docker,
    };
    use docker::{shutdown_all_containers, try_create_container, DOCKER_INSTANCE};
    use futures::StreamExt;

    use crate::{
        commands::ServiceSettings,
        docker::{self, ImageType, LaunchpadConfig, TariWorkspace},
    };

    const DEFAULT_WORKSPACE_NAME: &str = "default";
    const DEFAULT_NETORK: &str = "dibbler";
    const DEFAULT_LAUNCHPAD_DIR: &str = "/Users/matkat/Library/Caches/tari/tmp/dibbler";
    const TARI_REPOSITORY: &str = "quay.io/tarilabs";
    const TAG: &str = "latest";

    fn settings() -> ServiceSettings {
        ServiceSettings {
            tari_network: DEFAULT_NETORK.to_string(),
            root_folder: DEFAULT_LAUNCHPAD_DIR.to_string(),
            parole: None,
            wallet_password: Some("tari".to_string()),
            monero_mining_address: Some("".to_string()),
            num_mining_threads: 1,
            docker_registry: Some(TARI_REPOSITORY.to_string()),
            docker_tag: Some(TAG.to_string()),
            monerod_url: None,
            monero_username: None,
            monero_password: None,
            monero_use_auth: None,
        }
    }

    fn launchpad_config() -> LaunchpadConfig {
        let result = LaunchpadConfig::try_from(settings());
        assert!(result.is_ok());
        result.unwrap()
    }

    async fn start_service(image: ImageType, docker: &Docker) -> TariWorkspace {
        let config = launchpad_config();
        let mut workspace = TariWorkspace::new(DEFAULT_WORKSPACE_NAME, config);
        assert_eq!(DEFAULT_WORKSPACE_NAME, workspace.name());
        let service_status = workspace.start_service(image, &docker).await;
        assert!(service_status.is_ok());
        assert_eq!(image.image_name(), service_status.unwrap());
        workspace
    }

    async fn verify_container_is_running(container_name: &str, docker: &Docker) {
        let container_status = docker.inspect_container(container_name, None).await;
        assert!(container_status.is_ok());
        assert_eq!(
            container_status.unwrap().state.unwrap().status.unwrap(),
            ContainerStateStatusEnum::RUNNING
        );
    }

    async fn verify_container_is_destroyed(container_name: &str, docker: &Docker) {
        let mut filters = HashMap::new();
        filters.insert("name".to_string(), vec![container_name.to_string()]);
        let search_container = Some(ListContainersOptions::<String> {
            all: true,
            filters,
            ..Default::default()
        });
        let found = docker.clone().list_containers(search_container).await;
        assert!(found.is_ok());
        let containers = found.unwrap();
        assert!(containers.is_empty());
    }

    async fn verify_streaming(workspace: TariWorkspace, image: ImageType, docker: &Docker) {
        let log = workspace.logs(image.image_name(), docker);
        assert!(log.is_some());
        let mut log_stream = log.unwrap();
        assert!(log_stream.next().await.is_some());
        let stat = workspace.resource_stats(image.image_name(), docker);
        assert!(stat.is_some());
        let mut stat_stream = stat.unwrap();
        assert!(stat_stream.next().await.is_some());
    }

    #[tokio::test]
    #[ignore]
    async fn create_and_destroy_container_test() {
        let docker = DOCKER_INSTANCE.clone();
        let launchpad_config = launchpad_config();
        info!("{:?}", launchpad_config);
        let created_result = try_create_container(
            ImageType::BaseNode,
            "quay.io/tarilabs/tari_base_node:latest".to_string(),
            "default".to_string(),
            &launchpad_config,
            &docker,
        )
        .await;
        assert!(created_result.is_ok());
        let container_id = created_result.unwrap().id;
        info!("{}", container_id);
        let mut filters = HashMap::new();
        filters.insert("id".to_string(), vec![container_id.to_string()]);
        let search_container = Some(ListContainersOptions::<String> {
            all: true,
            filters,
            ..Default::default()
        });
        let found = docker.list_containers(search_container.clone()).await;
        assert!(found.is_ok());
        let containers = found.unwrap();
        assert_eq!(containers.len(), 1);
        let res = shutdown_all_containers(DEFAULT_WORKSPACE_NAME.to_string(), &docker).await;
        assert!(res.is_ok());
        verify_container_is_destroyed("default_base_node", &docker).await;
    }

    #[tokio::test]
    #[ignore]
    async fn start_service_test() {
        let docker = DOCKER_INSTANCE.clone();
        start_service(ImageType::Tor, &docker).await;
        verify_container_is_running("default_tor", &docker).await;
        let res = shutdown_all_containers(DEFAULT_WORKSPACE_NAME.to_string(), &docker).await;
        assert!(res.is_ok());
        verify_container_is_destroyed("default_tor", &docker).await;
    }

    #[tokio::test]
    async fn stream_container_logs_test() {
        let docker = DOCKER_INSTANCE.clone();
        let workspace = start_service(ImageType::Tor, &docker).await;
        verify_container_is_running("default_tor", &docker).await;
        verify_streaming(workspace, ImageType::Tor, &docker).await;
        let res = shutdown_all_containers(DEFAULT_WORKSPACE_NAME.to_string(), &docker).await;
        assert!(res.is_ok());
        verify_container_is_destroyed("default_tor", &docker).await;
    }
}
