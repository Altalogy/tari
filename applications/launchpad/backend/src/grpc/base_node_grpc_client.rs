//  Copyright 2021. The Tari Project
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
    net::{IpAddr, Ipv4Addr, SocketAddr, SocketAddrV4},
    thread::sleep,
    time::Duration,
};

use bollard::container::Stats;
use futures::{
    channel::mpsc::{self, Sender},
    stream,
    Stream,
    StreamExt,
    TryStreamExt,
};
use log::{error, info};
use tari_app_grpc::tari_rpc::{
    base_node_client::BaseNodeClient,
    wallet_client::WalletClient,
    Empty,
    GetBalanceRequest,
    GetBalanceResponse,
    GetIdentityRequest,
    GetIdentityResponse,
    TransactionEvent,
    TransactionEventRequest,
    TransactionEventResponse,
};
use tauri::{async_runtime::block_on, http::status};
use tokio::task;
use tonic::transport::Channel;

use super::{error::GrpcError, BlockStateInfo};
use crate::{
    docker::{DockerWrapperError, LaunchpadConfig, BASE_NODE_GRPC_ADDRESS_URL},
    error::LauncherError,
};

type Inner = BaseNodeClient<tonic::transport::Channel>;

#[derive(Clone)]
pub struct GrpcBaseNodeClient {
    inner: Option<Inner>,
}

impl GrpcBaseNodeClient {
    pub fn new() -> GrpcBaseNodeClient {
        Self { inner: None }
    }

    pub async fn connection(&mut self) -> Result<&mut Inner, GrpcError> {
        if self.inner.is_none() {
            let inner = Inner::connect(BASE_NODE_GRPC_ADDRESS_URL).await?;
            self.inner = Some(inner);
        }
        self.inner
            .as_mut()
            .ok_or_else(|| GrpcError::FatalError("no connection".into()))
    }

    pub async fn connected(&mut self) -> bool {
        loop {
            match self.connection().await {
                Ok(_) => {
                    info!("#### Connected....");
                    break;
                },
                Err(_) => {
                    sleep(Duration::from_secs(3));
                    info!("---> Waiting for base node....");
                    continue;
                },
            }
        }

        true
    }

    pub async fn stream(&mut self) -> Result<impl Stream<Item = BlockStateInfo>, GrpcError> {
        let (mut sender, receiver) = mpsc::channel(100);
        let connection = self.connection().await.unwrap().clone();
        task::spawn(async move {
            loop {
                let request = Empty {};
                let response = match connection.clone().get_sync_progress(request).await {
                    Ok(response) => response.into_inner(),
                    Err(status) => {
                        error!("Failed reading progress from base node: {}", status);
                        return;
                    },
                };

                info!("Response: {:?}", response);

                match response.clone().state() {
                    tari_app_grpc::tari_rpc::SyncState::Done => {
                        info!("GONGRATS....Base node is synced.");
                        return;
                    },
                    tari_app_grpc::tari_rpc::SyncState::Header | tari_app_grpc::tari_rpc::SyncState::Block => {
                        sender.try_send(BlockStateInfo::from(response)).unwrap()
                    },
                    sync_state => info!("Syncing is being started. Current state: {:?}", sync_state),
                }
                sleep(Duration::from_secs(10));
            }
        });
        Ok(receiver)
    }
}
