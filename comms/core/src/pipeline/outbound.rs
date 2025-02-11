// Copyright 2020, The Tari Project
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

use std::{fmt::Display, time::Instant};

use futures::future::Either;
use log::*;
use tokio::sync::mpsc;
use tower::{Service, ServiceExt};

use crate::{
    bounded_executor::OptionallyBoundedExecutor,
    message::OutboundMessage,
    pipeline::builder::OutboundPipelineConfig,
    protocol::messaging::MessagingRequest,
};

const LOG_TARGET: &str = "comms::pipeline::outbound";

/// Calls a service in a new task whenever a message is received by the configured channel and forwards the resulting
/// message as a [MessageRequest](crate::protocol::messaging::MessageRequest).
pub struct Outbound<TPipeline, TItem> {
    /// Executor used to spawn a pipeline for each received item on the stream
    executor: OptionallyBoundedExecutor,
    /// Outbound pipeline configuration containing the pipeline and it's in and out streams
    config: OutboundPipelineConfig<TItem, TPipeline>,
    /// Request sender for Messaging
    messaging_request_tx: mpsc::Sender<MessagingRequest>,
}

impl<TPipeline, TItem> Outbound<TPipeline, TItem>
where
    TItem: Send + 'static,
    TPipeline: Service<TItem, Response = ()> + Clone + Send + 'static,
    TPipeline::Error: Display + Send,
    TPipeline::Future: Send,
{
    /// New outbound pipeline.
    pub fn new(
        executor: OptionallyBoundedExecutor,
        config: OutboundPipelineConfig<TItem, TPipeline>,
        messaging_request_tx: mpsc::Sender<MessagingRequest>,
    ) -> Self {
        Self {
            executor,
            config,
            messaging_request_tx,
        }
    }

    /// Run the outbound pipeline.
    pub async fn run(mut self) {
        let mut current_id = 0;
        loop {
            let either = tokio::select! {
                next = self.config.in_receiver.recv() => Either::Left(next),
                next = self.config.out_receiver.recv() => Either::Right(next)
            };
            match either {
                // Pipeline IN received a message. Spawn a new task for the pipeline
                Either::Left(Some(msg)) => {
                    let num_available = self.executor.num_available();
                    if let Some(max_available) = self.executor.max_available() {
                        // Only emit this message if there is any concurrent usage
                        if num_available < max_available {
                            debug!(
                                target: LOG_TARGET,
                                "Outbound pipeline usage: {}/{}",
                                max_available - num_available,
                                max_available
                            );
                        }
                    }
                    let pipeline = self.config.pipeline.clone();
                    let id = current_id;
                    current_id = (current_id + 1) % u64::MAX;

                    self.executor
                        .spawn(async move {
                            let timer = Instant::now();
                            trace!(target: LOG_TARGET, "Start outbound pipeline {}", id);
                            if let Err(err) = pipeline.oneshot(msg).await {
                                error!(
                                    target: LOG_TARGET,
                                    "Outbound pipeline {} returned an error: '{}'", id, err
                                );
                            }

                            trace!(
                                target: LOG_TARGET,
                                "Finished outbound pipeline {} in {:.2?}",
                                id,
                                timer.elapsed()
                            );
                        })
                        .await;
                },
                // Pipeline IN channel closed
                Either::Left(None) => {
                    info!(
                        target: LOG_TARGET,
                        "Outbound pipeline is shutting down because the in channel closed"
                    );
                    break;
                },
                // Pipeline OUT received a message
                Either::Right(Some(out_msg)) => {
                    if self.messaging_request_tx.is_closed() {
                        // MessagingRequest channel closed
                        break;
                    }
                    self.send_messaging_request(out_msg).await;
                },
                // Pipeline OUT channel closed
                Either::Right(None) => {
                    info!(
                        target: LOG_TARGET,
                        "Outbound pipeline is shutting down because the out channel closed"
                    );
                    break;
                },
            }
        }
    }

    async fn send_messaging_request(&mut self, out_msg: OutboundMessage) {
        let msg_req = MessagingRequest::SendMessage(out_msg);
        if let Err(err) = self.messaging_request_tx.send(msg_req).await {
            error!(
                target: LOG_TARGET,
                "Failed to send OutboundMessage to Messaging protocol because '{}'", err
            );
        }
    }
}

#[cfg(test)]
mod test {
    use std::time::Duration;

    use bytes::Bytes;
    use tari_test_utils::{collect_recv, unpack_enum};
    use tokio::{runtime::Handle, time};

    use super::*;
    use crate::{pipeline::SinkService, runtime, utils};

    #[runtime::test]
    async fn run() {
        const NUM_ITEMS: usize = 10;
        let (tx, in_receiver) = mpsc::channel(NUM_ITEMS);
        utils::mpsc::send_all(
            &tx,
            (0..NUM_ITEMS).map(|i| OutboundMessage::new(Default::default(), Bytes::copy_from_slice(&i.to_be_bytes()))),
        )
        .await
        .unwrap();
        let (out_tx, out_rx) = mpsc::channel(NUM_ITEMS);
        let (msg_tx, mut msg_rx) = mpsc::channel(NUM_ITEMS);
        let executor = Handle::current();

        let pipeline = Outbound::new(
            executor.clone().into(),
            OutboundPipelineConfig {
                in_receiver,
                out_receiver: out_rx,
                pipeline: SinkService::new(out_tx),
            },
            msg_tx,
        );

        let spawned_task = executor.spawn(pipeline.run());

        msg_rx.close();
        let requests = collect_recv!(msg_rx, timeout = Duration::from_millis(5));
        for req in requests {
            unpack_enum!(MessagingRequest::SendMessage(_o) = req);
        }

        // Check that this task ends because the stream has closed
        time::timeout(Duration::from_secs(5), spawned_task)
            .await
            .unwrap()
            .unwrap();
    }
}
