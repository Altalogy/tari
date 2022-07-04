#!/bin/bash
source versions.txt
platform=${BUILD_PLATFORM:-amd64}
push=${PUSH_TO_QUAY:-0}
features=${FEATURES:-safe}

build_image() {
  echo "Building $1 image v$VERSION.."
  #docker build -f docker_rig/$1 --build-arg ARCH=native --build-arg FEATURES=avx2 --build-arg VERSION=$VERSION $3 $4 -t quay.io/tarilabs/$2:latest-$platform ./../..
  docker build -f docker_rig/tarilabs.Dockerfile --build-arg APP_NAME=$1 --build-arg APP_EXEC=$2 --build-arg FEATURES=$features
  docker tag quay.io/tarilabs/$2:latest-$platform quay.io/tarilabs/$2:$VERSION-$platform
  if [ $push -ne 0 ]; then
    docker push quay.io/tarilabs/$2:latest-$platform
    docker push quay.io/tarilabs/$2:$VERSION
  fi
}

build_tor() {
  echo "Building tor image v$VERSION (Tor v$TOR_VERSION)"
  docker build -f docker_rig/tor.Dockerfile --build-arg ARCH=native --build-arg VERSION=$TOR_VERSION -t quay.io/tarilabs/tor:latest ./../..
  docker tag quay.io/tarilabs/tor:latest quay.io/tarilabs/tor:$VERSION
}

build_xmrig() {
  echo "Building XMRig image v$VERSION (XMRig v$XMRIG_VERSION)"
  docker build -f docker_rig/xmrig.Dockerfile --build-arg VERSION=$VERSION --build-arg XMRIG_VERSION=$XMRIG_VERSION -t quay.io/tarilabs/xmrig:latest ./../..
  docker tag quay.io/tarilabs/xmrig:latest-$platform quay.io/tarilabs/xmrig:$VERSION-$platform
  if [ $push -ne 0 ]; then
    docker push quay.io/tarilabs/xmrig:latest-$platform
    docker push quay.io/tarilabs/xmrig:$VERSION
  fi
}
#build_image base_node tari_base_node
#build_image wallet tari_console_wallet
#build_image mm_proxy tari_mm_proxy
#build_image sha3_miner tari_sha3_miner
build_tor
#build_xmrig


