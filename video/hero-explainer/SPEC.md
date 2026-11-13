GOAL:    a visitor to acryl.dev understands the platform loop in one minute: start an app, the agent grows it with plugins,
         share plugins and whole apps, start from a Blend in the registry, extend it again.
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps, silent (it autoplays muted, looped, in the site's hero)
TIME:    75 s x 30 = 2250 frames, one continuous scene. Part A "build it" 0-44 s, part B "start from a Blend" 44-69 s,
         B6 69-75 s states the idea and returns to the first frame. The last frame equals the first.
LOOK:    the acrylblends.github.io design: ground oklch(0.985 0.003 230) with a 56 px grid at 50% border colour,
         ink oklch(0.18 0.016 240), muted oklch(0.49 0.018 240), border oklch(0.86 0.012 230).
         Accent = the spectrum: cyan oklch(0.72 0.18 200), magenta oklch(0.7 0.2 320), yellow oklch(0.82 0.19 95).
         The spectrum colours only the plugins (each plugin one paint colour) and one word per caption.
         Display Manrope 700, 64 px, -0.02em; commands DM Mono 26 px; labels DM Mono 20-22 px.
         Medium: product UI, flat, 2 px radius on chrome, 14 px on chat bubbles, no shadows except one soft card shadow.
OBJECTS: the app (a window: title bar with name and running dot, chat panel left, canvas right),
         a plugin (a 96 px square of paint with its name), the shelf (a rail labelled GITHUB or REGISTRY),
         the launcher (a terminal window with the real menu of `acryl`).
MOTION:  arrivals expo.out 0.5-0.7 s; moves power3.inOut 0.6-0.8 s; plugin snap back.out(1.6) 0.45 s;
         caption words blur 8 px -> 0, 0.18 s, 0.07 s apart; exits 0.2 s blur out.
SHOTS:   see compositions/explainer.html, one comment per beat (A1-A8, B1-B6).
TRUTH:   every caption and command works today (checked 2026-11-13):
         `npx acryl new my-app`, `npm run acryl -- plugin publish notes`, `npm run acryl -- plugin pull github:you/notes@0.1.0` (inside the app),
         Versions panel (save, restore), `npm run dev`, `npm run desktop`, `npm run save` (whole app to your GitHub),
         `npx acryl` (launcher: Install a Blend), `npx acryl new csv-explorer --from acrylblends.csv-explorer` (all verified against acryl 0.2.7 from npm).
         Not shown as working: the Control Center GUI (design only), publishing an app into the Blends registry,
         CLI (TUI) and WebBoxes.ai surfaces (greyed "coming").
BANNED:  dark void, glow, glass, gradients on anything but plugin paint and one caption word, everything centred,
         titles moving while read, click rings, logo in a corner.
QA:      frames 0 and 74.97 identical; 36.5 s works as the poster (public/hero/acryl-how-it-works.jpg); every caption readable at 50% scale.
