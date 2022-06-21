// Copyright 2022 The Tari Project
// SPDX-License-Identifier: BSD-3-Clause

// FIXME: ignoring for now
#![allow(unused_imports)]
#![allow(dead_code)]
#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]
#[macro_use]
extern crate lazy_static;
use std::{
    sync::{atomic::AtomicBool, Arc},
    thread::{self, sleep, Thread},
    time::Duration,
};

use api::wallet_identity;
use futures::StreamExt;
use grpc::GrpcWalletClient;
use log::*;
mod api;
mod commands;
mod docker;
mod error;
mod grpc;
use docker::{shutdown_all_containers, DockerWrapper, ImageType, Workspaces, DOCKER_INSTANCE};
use tari_app_grpc::tari_rpc::wallet_client;
use tauri::{
    api::cli::get_matches,
    async_runtime::block_on,
    utils::config::CliConfig,
    CustomMenuItem,
    GlobalWindowEvent,
    Manager,
    Menu,
    MenuItem,
    PackageInfo,
    RunEvent,
    Submenu,
    WindowEvent,
};
use tauri_plugin_sql::{Migration, MigrationKind, TauriSql};

use crate::{
    api::{image_list, network_list, wallet_events},
    commands::{
        create_default_workspace,
        create_new_workspace,
        events,
        launch_docker,
        pull_images,
        shutdown,
        start_service,
        status,
        stop_service,
        AppState,
    },
    grpc::WalletTransaction,
};

fn main() {
    env_logger::init();
    let context = tauri::generate_context!();
    let cli_config = context.config().tauri.cli.clone().unwrap();

    // We're going to attach this to the AppState because Tauri does not expose it for some reason
    let package_info = context.package_info().clone();
    // Handle --help and --version. Exits after printing
    handle_cli_options(&cli_config, &package_info);

    // thread::spawn(|| block_on(check_identity()));
    // thread::spawn(|| block_on(stream_events()));
    let docker = match DockerWrapper::new() {
        Ok(docker) => docker,
        Err(err) => {
            error!("Could not launch docker backend. {}", err.chained_message());
            std::process::exit(-1);
        },
    };

    let about_menu = Submenu::new(
        "App",
        Menu::new()
            .add_native_item(MenuItem::Hide)
            .add_native_item(MenuItem::HideOthers)
            .add_native_item(MenuItem::ShowAll)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Quit),
    );

    let edit_menu = Submenu::new(
        "Edit",
        Menu::new()
            .add_native_item(MenuItem::Cut)
            .add_native_item(MenuItem::Copy)
            .add_native_item(MenuItem::Paste)
            .add_native_item(MenuItem::SelectAll),
    );

    let view_menu = Submenu::new("View", Menu::new().add_native_item(MenuItem::EnterFullScreen));

    let menu = Menu::new()
        .add_submenu(about_menu)
        .add_submenu(edit_menu)
        .add_submenu(view_menu);

    // TODO - Load workspace definitions from persistent storage here
    let workspaces = Workspaces::default();
    info!("Using Docker version: {}", docker.version());

    let migrations = vec![
        Migration {
            version: 1,
            description: "create stats table",
            sql: include_str!("../migrations/2022-06-13.create-stats-table.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create transactions table",
            sql: include_str!("../migrations/2022-06-14.create-transactions-table.sql"),
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(TauriSql::default().add_migrations("sqlite:launchpad.db", migrations))
        .manage(AppState::new(docker, workspaces, package_info))
        .menu(menu)
        .invoke_handler(tauri::generate_handler![
            image_list,
            network_list,
            pull_images,
            create_new_workspace,
            create_default_workspace,
            events,
            launch_docker,
            start_service,
            stop_service,
            shutdown,
            wallet_events
        ])
        .on_window_event(on_event)
        .run(context)
        .expect("error starting");
}

fn on_event(evt: GlobalWindowEvent) {
    if let WindowEvent::Destroyed = evt.event() {
        info!("Stopping and destroying all tari containers");
        thread::spawn(|| block_on(shutdown_all_containers("default".to_string(), &DOCKER_INSTANCE.clone())));
        sleep(Duration::from_secs(5));
    }
}

fn handle_cli_options(cli_config: &CliConfig, pkg_info: &PackageInfo) {
    match get_matches(cli_config, pkg_info) {
        Ok(matches) => {
            if let Some(arg_data) = matches.args.get("help") {
                debug!("{}", arg_data.value.as_str().unwrap_or("No help available"));
                std::process::exit(0);
            }
            if let Some(arg_data) = matches.args.get("version") {
                debug!("{}", arg_data.value.as_str().unwrap_or("No version data available"));
                std::process::exit(0);
            }
        },
        Err(e) => {
            error!("{}", e.to_string());
            std::process::exit(1);
        },
    }
}

async fn check_identity() {
    info!("======> IDENTITY CHECK");
    loop {
        match wallet_identity().await {
            Ok(identity) => {
                info!("Your wallet identity is: {:?}", identity);
                break;
            },
            Err(_) => sleep(Duration::from_secs(5)),
        }
    }
}

async fn stream_events() {
    info!("Waiting for a stream...");
    loop {
        if "running" == status(ImageType::Wallet).await.to_lowercase() {
            break;
        } else {
            thread::sleep(Duration::from_secs(1))
        }
    }
    let mut wallet_client = GrpcWalletClient::new();
    let mut stream = wallet_client.stream().await.map_err(|e| e.chained_message()).unwrap();
    while let Some(response) = stream.next().await {
        if let Some(value) = response.transaction {
            let wt = WalletTransaction {
                event: value.event,
                tx_id: value.tx_id,
                source_pk: value.source_pk,
                dest_pk: value.dest_pk,
                status: value.status,
                direction: value.direction,
                amount: value.amount,
                message: value.message,
                is_coinbase: value.is_coinbase,
            };

            info!("Wallet transaction: {:?}", wt);
        }
    }
}
