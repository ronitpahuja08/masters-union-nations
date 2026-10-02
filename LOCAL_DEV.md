# Local development workflow

All experimental animation work lives on the `motion-lab` branch. Keep `main` stable until the motion build is approved.

## Start locally

### Windows
Double-click `start-local.bat`, or run:

```bat
start-local.bat
```

### macOS / Linux
Run:

```bash
chmod +x start-local.sh
./start-local.sh
```

Then open `http://localhost:5173`.

## Branch workflow

```bash
git checkout motion-lab
git pull origin motion-lab
```

Make and test changes locally, then commit and push them to `motion-lab`.

When the animation build is approved, merge `motion-lab` into `main` for production deployment.
