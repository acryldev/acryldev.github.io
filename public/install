#!/bin/sh
# Install ACRYL Control Center on macOS or Linux, from its latest release, with one line:
#
#   curl -fsSL https://acryl.dev/install.sh | bash
#
# A brand-new computer ends with a working app: the installer first makes sure git is there (the app keeps versions, snapshots and shares with it) -
# macOS: the Command Line Tools through Apple's own dialog; Linux: git and the desktop libraries Electron needs, through the system's package manager
# after one question. The app itself needs no administrator, Node or npm: it carries its own. The download is checked against the sha256 GitHub
# publishes for the release asset, and nothing is installed when it differs. Downloaded with curl, the app carries no quarantine flag, so macOS opens it without the
# "unidentified developer" step (the app is open source and not notarized). Running it again updates to the latest release; your apps and
# data live in ~/.acryl and stay.
#
# Settings (environment): ACRYL_VERSION=v0.2.19   a release tag instead of the latest
#                         ACRYL_PREFIX=<folder>     where the app goes (macOS ~/Applications; Linux ~/.local/share/acryl-control-center)
#                         ACRYL_NO_LAUNCH=1         install, do not start
#                         ACRYL_YES=1               answer yes to the one question (installing git and libraries on Linux), for unattended runs
#                         ACRYL_GIT_WAIT=1800       macOS: seconds to wait for the Command Line Tools after Apple's dialog opens
set -eu

REPO="acrylblends/63-acryl-control-center"
NAME="ACRYL Control Center"
say() { printf '%s\n' "acryl: $*"; }
die() { printf '%s\n' "acryl: $*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || die "this needs '$1', which this computer does not have"; }

need curl
case "$(uname -s)-$(uname -m)" in
  Darwin-arm64) ASSET="ACRYL-Control-Center-mac-arm64.dmg" ;;
  Darwin-x86_64) ASSET="ACRYL-Control-Center-mac-x64.dmg" ;;
  Linux-x86_64 | Linux-amd64) ASSET="ACRYL-Control-Center-linux-x64.tar.gz" ;;
  Linux-aarch64 | Linux-arm64) ASSET="ACRYL-Control-Center-linux-arm64.tar.gz" ;;
  *) die "no build for $(uname -s) $(uname -m); on Windows run in PowerShell: irm https://acryl.dev/install.ps1 | iex" ;;
esac

# ---- What the app needs besides itself: git, and on Linux the desktop libraries Electron links to. Never fatal: the app starts without git.
# The script arrives on stdin through the pipe, so a question is read from the terminal (/dev/tty); without one the answer is no, unless ACRYL_YES=1.
asked() {
  [ "${ACRYL_YES:-}" = 1 ] && return 0
  ( : </dev/tty ) 2>/dev/null || return 1
  printf '%s [y/N] ' "$1" >/dev/tty
  read -r ANSWER </dev/tty || return 1
  case "$ANSWER" in y | Y | yes | Yes | YES) return 0 ;; *) return 1 ;; esac
}

prepare_mac() {
  if xcode-select -p >/dev/null 2>&1; then say "git is there ($(git --version))"; return 0; fi
  GIT="$(command -v git 2>/dev/null || true)"
  if [ -n "$GIT" ] && [ "$GIT" != /usr/bin/git ]; then say "git is there ($GIT)"; return 0; fi
  say "git is not installed. macOS gets it with the Command Line Tools: Apple's dialog opens now - click Install and wait; this goes on by itself when git works."
  if ! xcode-select --install >/dev/null 2>&1; then
    say "could not open Apple's dialog here (no desktop session?). Later, in Terminal, run: xcode-select --install"
    return 0
  fi
  WAITED=0
  LIMIT="${ACRYL_GIT_WAIT:-1800}"
  until xcode-select -p >/dev/null 2>&1; do
    [ "$WAITED" -lt "$LIMIT" ] || { say "git is still not there after $LIMIT s: going on without it; finish Apple's installation, then versions and sharing work"; return 0; }
    sleep 5
    WAITED=$((WAITED + 5))
  done
  say "git is there ($(git --version))"
}

prepare_linux() {
  MISSING=""
  command -v git >/dev/null 2>&1 || MISSING="git"
  if command -v apt-get >/dev/null 2>&1; then
    # Ubuntu 24.04 renamed some libraries with a t64 suffix (libasound2 is libasound2t64): the installed name, else the one this release has.
    for base in libgtk-3-0 libnss3 libasound2 libxss1 libgbm1; do
      dpkg -s "$base" >/dev/null 2>&1 && continue
      dpkg -s "${base}t64" >/dev/null 2>&1 && continue
      pick="$base"
      apt-cache show "${base}t64" >/dev/null 2>&1 && pick="${base}t64"
      MISSING="$MISSING $pick"
    done
    UPDATE="apt-get update"
    INSTALL="apt-get install -y"
  elif command -v dnf >/dev/null 2>&1; then
    for pkg in gtk3 nss alsa-lib libXScrnSaver mesa-libgbm; do rpm -q "$pkg" >/dev/null 2>&1 || MISSING="$MISSING $pkg"; done
    UPDATE=""
    INSTALL="dnf install -y"
  elif command -v pacman >/dev/null 2>&1; then
    for pkg in gtk3 nss alsa-lib libxss mesa; do pacman -Q "$pkg" >/dev/null 2>&1 || MISSING="$MISSING $pkg"; done
    UPDATE=""
    INSTALL="pacman -S --needed --noconfirm"
  else
    [ -z "$MISSING" ] || say "git is not installed, and this computer has no apt, dnf or pacman: install git with your system's package manager"
    return 0
  fi
  MISSING="${MISSING# }"
  [ -n "$MISSING" ] || { say "git and the desktop libraries are there"; return 0; }
  if [ "$(id -u)" = 0 ]; then SUDO=""; elif command -v sudo >/dev/null 2>&1; then SUDO="sudo "; else SUDO="none"; fi
  COMMAND="${SUDO#none}${INSTALL} $MISSING"
  [ -z "$UPDATE" ] || COMMAND="${SUDO#none}${UPDATE} && ${COMMAND}"
  if [ "$SUDO" = none ]; then say "the app needs: $MISSING. There is no sudo here: as an administrator run: $COMMAND"; return 0; fi
  say "the app needs these, which this computer lacks: $MISSING"
  if asked "acryl: install them now with: $COMMAND ?"; then
    # shellcheck disable=SC2086
    if { [ -z "$UPDATE" ] || $SUDO$UPDATE; } && $SUDO$INSTALL $MISSING; then say "installed: $MISSING"
    else say "could not install them. Run yourself: $COMMAND"; fi
  else
    say "not installed. To do it yourself: $COMMAND"
  fi
}

if [ "$(uname -s)" = Darwin ]; then prepare_mac; else prepare_linux; fi

if [ -n "${ACRYL_VERSION:-}" ]; then API="https://api.github.com/repos/$REPO/releases/tags/$ACRYL_VERSION"
else API="https://api.github.com/repos/$REPO/releases/latest"; fi

WORK="$(mktemp -d "${TMPDIR:-/tmp}/acryl-install.XXXXXX")"
MOUNT=""
cleanup() {
  [ -z "$MOUNT" ] || hdiutil detach "$MOUNT" >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT INT TERM

curl -fsSL -o "$WORK/release.json" "$API" || die "could not read the release from GitHub ($API)"
TAG="$(sed -n 's/^  "tag_name": "\(.*\)",$/\1/p' "$WORK/release.json" | head -n 1)"
# The asset's own block: its download URL and digest sit a few lines after its name.
BLOCK="$(grep -A 40 "\"name\": \"$ASSET\"" "$WORK/release.json" | head -n 40 || true)"
URL="$(printf '%s\n' "$BLOCK" | sed -n 's/.*"browser_download_url": "\(.*\)".*/\1/p' | head -n 1)"
WANT="$(printf '%s\n' "$BLOCK" | sed -n 's/.*"digest": "sha256:\([0-9a-f]*\)".*/\1/p' | head -n 1)"
[ -n "$URL" ] || die "release $TAG has no $ASSET"
[ -n "$WANT" ] || die "GitHub gives no checksum for $ASSET in $TAG; nothing was installed"

say "downloading $NAME $TAG ($ASSET)"
curl -fL --progress-bar -o "$WORK/$ASSET" "$URL" || die "could not download $URL"
if command -v shasum >/dev/null 2>&1; then GOT="$(shasum -a 256 "$WORK/$ASSET" | cut -d' ' -f1)"; else GOT="$(sha256sum "$WORK/$ASSET" | cut -d' ' -f1)"; fi
[ "$WANT" = "$GOT" ] || die "the download is not the release's file (sha256 $GOT, expected $WANT); nothing was installed"
say "checksum ok"

if [ "$(uname -s)" = Darwin ]; then
  need hdiutil
  PREFIX="${ACRYL_PREFIX:-$HOME/Applications}"
  mkdir -p "$PREFIX"
  MOUNT="$WORK/mount"
  mkdir -p "$MOUNT"
  hdiutil attach -nobrowse -readonly -mountpoint "$MOUNT" "$WORK/$ASSET" >/dev/null || die "could not open the disk image"
  APP="$PREFIX/$NAME.app"
  [ ! -e "$APP" ] || { say "replacing the installed app (your apps and data in ~/.acryl stay)"; rm -rf "$APP"; }
  cp -R "$MOUNT/$NAME.app" "$APP"
  say "installed $APP (Spotlight and Launchpad find it)"
  [ "${ACRYL_NO_LAUNCH:-}" = 1 ] || open "$APP"
else
  need tar
  PREFIX="${ACRYL_PREFIX:-$HOME/.local/share/acryl-control-center}"
  rm -rf "$PREFIX"
  mkdir -p "$PREFIX"
  tar -xzf "$WORK/$ASSET" -C "$PREFIX" --strip-components=1
  BIN="$HOME/.local/bin"
  APPS="$HOME/.local/share/applications"
  ICONS="$HOME/.local/share/icons/hicolor/512x512/apps"
  mkdir -p "$BIN" "$APPS" "$ICONS"
  # A small script, not a symlink: the app finds its files beside its own path.
  printf '#!/bin/sh\nexec "%s/acryl-control-center" "$@"\n' "$PREFIX" > "$BIN/acryl-control-center"
  chmod +x "$BIN/acryl-control-center"
  cp "$PREFIX/acryl-control-center.png" "$ICONS/acryl-control-center.png"
  sed -e "s|^Exec=.*|Exec=\"$PREFIX/acryl-control-center\" %U|" "$PREFIX/acryl-control-center.desktop" > "$APPS/acryl-control-center.desktop"
  command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$APPS" >/dev/null 2>&1 || true
  say "installed $PREFIX (find it in your app menu, or run: acryl-control-center)"
  if [ "${ACRYL_NO_LAUNCH:-}" != 1 ]; then
    if [ -n "${DISPLAY:-}${WAYLAND_DISPLAY:-}" ]; then (nohup "$PREFIX/acryl-control-center" >/dev/null 2>&1 &)
    else say "no display here: start it from your desktop"; fi
  fi
fi
say "done"
