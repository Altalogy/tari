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

use std::{convert::TryFrom, path::PathBuf, time::Duration};

use log::*;
use tauri::{
  api::path::home_dir,
  AppHandle,
  Wry
};
use std::process::Command;

use crate::{
    commands::AppState
};

#[tauri::command]
pub async fn open_terminal(_app: AppHandle<Wry>, platform: String) -> Result<(), ()> {
    let terminal_path = home_dir().unwrap().display().to_string();
    if platform == "darwin" {
        Command::new( "open" )
            .args(["-a", "Terminal", &terminal_path])
            .spawn()
            .unwrap();
    } else if platform == "windows_nt" {
        Command::new( "powershell" )
            .args(["-command", "start", "powershell"])
            .spawn()
            .unwrap();
    } else if platform == "linux" {
        Command::new( "gnome-terminal" )
            .args([["--working-directory=", &terminal_path].join("")])
            .spawn()
            .unwrap();
    };
    Ok(())
}