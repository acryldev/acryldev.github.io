GOAL:    a visitor to acryl.dev/acrylmicrovm understands in under a minute why agent code belongs in a box:
         on your machine it reaches everything; in a box it runs on its own kernel; a bad command breaks only the box;
         prepare once and clone per task; secrets stay outside and only allowed hosts are reachable.
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps, silent (autoplays muted, looped, in the page hero). Rendered to
         public/acrylmicrovm/how-it-works.mp4 (--crf 26), poster how-it-works.jpg at 16.6 s.
TIME:    48 s. 0-2 s opening frame (logo + "A kernel for every box."), then the story timeline from 2 s:
         A problem (agent code reaches ~/.ssh, .env ...), B box with own kernel and hypervisor, C rm -rf / breaks only
         the box, D snapshot and clones, E host proxy swaps $TOKEN and blocks evil.example, F logo again.
         The last frame equals the first.
LOOK:    the same as video/hero-explainer (acryl.dev light ground, 56 px grid, Manrope captions, DM Mono labels,
         spectrum only on one caption word, the box outline glow and the logo).
TRUTH:   the only command shown is `acrylmicrovm run python:slim python -c 'print(1 + 1)'` (the CLI's run command).
         Snapshots, clones, the network allow list and secret substitution exist in the runtime and SDKs; they have no
         CLI command, so none is shown for them. No timing numbers are shown.
