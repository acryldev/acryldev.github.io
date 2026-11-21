#!/usr/bin/env bash
#
# The standalone ACRYL terminal installer is retired (it installed the old acryl-cli archive). Nothing is installed or changed.
#
#   curl -fsSL https://acryl.dev/install | bash     prints this and exits 1
#
# Kept as a real file so the old one-line command prints a pointer instead of piping the site's web page into bash.
cat >&2 <<'MESSAGE'
The standalone ACRYL terminal installer is retired. Nothing was installed.

ACRYL Control Center is the main entry now, in this terminal, a window or your browser:

  npx acryl@latest

The terminal coding agent opens from it (acryl ade --tui) and is downloaded on first use.
Its source and release archives: https://github.com/acryldev/acryl-terminal
MESSAGE
exit 1
