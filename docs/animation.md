# Animation

Asset Bento loading animations use a static generated image plus CSS/SVG accents. This avoids deforming generated characters across frame sequences and keeps runtime code lightweight.

The MVP supports:

```bash
npm run dev -- animate --type orbit --input ./original.png --name loading-duo --out ./animation
```
