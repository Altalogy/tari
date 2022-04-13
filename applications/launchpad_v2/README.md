# Tari Launchpad

GUI to manage Tari Docker containers.

The Tari Launchpad is dedicated for beginners in Blockchain world, as well as for experienced users. The application helps the user to download Tari Docker images, run specific containers, and give the insight into the running containers.

## Getting started

**Minimal requirements**

* Rust (`> 1.58`)
* Node (`> 16.*`)
* Docker Engine & Docker Compose installed


```bash
# Installation
$ yarn install

# Run the application
$ yarn tauri dev
```

### Other scripts

#### ESlint

```bash
$ yarn lint

# With auto-fix
$ yarn lint:fix
```

## Development notes

### Locales

The project doesn't support i18n, and doesn't use any i18n package. However, all texts are located in `./src/locales/*`. It's recommended to place any static text in the `./src/locales/*` and import into the component from there.

Recommendations:

1. Common words and phrases add to the `common.ts` file.
2. Use dedicated files for specific feature/view, ie. 'baseNode.ts` would contain texts from the Base Node view.
3. Avoid duplications
