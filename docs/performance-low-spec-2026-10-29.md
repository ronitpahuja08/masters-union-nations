# Low-spec performance profile (29 October 2026)

This is an incremental optimization on top of Shreshth's landing-film and image-compression commits.

## Automatic profile
The HTML head detects reported <=4 GB RAM, <=4 logical CPU threads, Save-Data, or reduced-motion.
A visitor can explicitly force the modes with `?perf=lite` or `?perf=full` for diagnostics.

## What changes on weak hardware
- The opening film still shows the purse and venue text beats, but uses HTML/CSS rather than importing Three.js and compiling WebGL shaders.
- The journey still proceeds to the map, but does not initialize the 3D globe.
- Star-field drawing, ambient CSS animations and expensive blurs stop.
- Hover warms selected committee images, not all videos; fast 8GB+ desktops alone get idle image warming.
- The map and committee controls remain interactive, and AIPPM sprite loops pause in low-spec.
- New low-spec visitors start muted; explicit sound choices are respected.
- Cached WebP optimizations and normal/high-quality desktop film remain available.

## Validation checklist
1. Test `/?perf=lite` on a real 4GB Windows laptop: hero, film, skip, eight map choices, eight committee pages, return/back navigation, registration, payments, audio opt-in.
2. Test `/?perf=full` on desktop: THREE film, globe, mobile pages and the usual committee media.
3. Benchmark cold and cached Chrome Network + Performance traces, JS long tasks and FPS on device; nothing here proves literal zero dropped frames.
4. Test direct committee URLs on Vercel, mobile screens and low bandwidth.
5. Monitor exceptions on initial load. Use the pre-change backup for rollback.

No database or hosting migration is required to address browser rendering bottlenecks.
