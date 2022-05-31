// Copyright 2022 The Tari Project
// SPDX-License-Identifier: BSD-3-Clause

mod wallet_grpc_server;

use std::convert::TryFrom;

use tari_app_grpc::tari_rpc::TransactionEvent;
use tari_utilities::hex::Hex;

pub use self::wallet_grpc_server::*;
use crate::notifier::WalletEventMessage;

impl TryFrom<WalletEventMessage> for TransactionEvent {
    type Error = String;

    fn try_from(value: WalletEventMessage) -> Result<Self, Self::Error> {
        match value {
            WalletEventMessage::Completed((event, tx)) => Ok(TransactionEvent {
                event,
                tx_id: tx.tx_id.to_string(),
                source_pk: tx.source_public_key.to_hex().into_bytes(),
                dest_pk: tx.destination_public_key.clone().to_hex().into_bytes(),
                status: tx.status.to_string(),
                direction: tx.direction.to_string(),
                amount: tx.amount.as_u64(),
                message: tx.message,
            }),
            WalletEventMessage::Outbound((event, outbound)) => Ok(TransactionEvent {
                event,
                tx_id: outbound.tx_id.to_string(),
                source_pk: vec![],
                dest_pk: outbound.destination_public_key.clone().to_hex().into_bytes(),
                status: outbound.status.to_string(),
                direction: "outbound".to_string(),
                amount: outbound.amount.as_u64(),
                message: outbound.message,
            }),
            WalletEventMessage::Inbound((event, inbound)) => Ok(TransactionEvent {
                event,
                tx_id: inbound.tx_id.to_string(),
                source_pk: inbound.source_public_key.clone().to_hex().into_bytes(),
                dest_pk: vec![],
                status: inbound.status.to_string(),
                direction: "inbound".to_string(),
                amount: inbound.amount.as_u64(),
                message: inbound.message,
            }),
            _ => Err("unsupported wallet event".to_string()),
        }
    }
}
