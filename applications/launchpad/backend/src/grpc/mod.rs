// Copyright 2022 The Tari Project
// SPDX-License-Identifier: BSD-3-Clause

mod error;
mod wallet_grpc_client;
mod base_node_grpc_client;
mod model;
use std::convert::TryFrom;

use futures::{Future, Stream};
use log::{error, info};
use serde::Serialize;
use tari_app_grpc::tari_rpc::{GetBalanceResponse, GetIdentityResponse, TransactionEvent};
use tari_common_types::{emoji::EmojiId, types::PublicKey};
use thiserror::Error;
pub use wallet_grpc_client::*;
pub use base_node_grpc_client::*;
pub use model::*;