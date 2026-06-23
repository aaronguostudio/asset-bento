import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pascalCaseAssetName, sanitizeAssetName } from "./file-naming.js";

type CreateOrbitAnimationOptions = {
  input: string;
  out: string;
  assetName: string;
};

function loadingSlug(assetName: string) {
  return sanitizeAssetName(assetName)
    .replace(/^[a-z]{2}-/, "")
    .replace(/-asset$/, "") || "loading-asset";
}

export async function createOrbitAnimation(options: CreateOrbitAnimationOptions) {
  await mkdir(options.out, { recursive: true });
  const slug = loadingSlug(options.assetName);
  const componentName = pascalCaseAssetName(slug);
  const copiedImage = `${slug}.png`;

  await copyFile(options.input, path.join(options.out, copiedImage));

  await writeFile(
    path.join(options.out, `${slug}.css`),
    `.asset-bento-loader {
  --asset-bento-size: 160px;
  position: relative;
  width: var(--asset-bento-size);
  height: var(--asset-bento-size);
  display: inline-grid;
  place-items: center;
}

.asset-bento-loader__image {
  width: 78%;
  height: 78%;
  object-fit: contain;
  animation: asset-bento-bob 2.8s ease-in-out infinite;
}

.asset-bento-loader__orbit {
  position: absolute;
  inset: 12%;
  border: 1px solid rgba(8, 35, 43, 0.16);
  border-radius: 999px;
  animation: asset-bento-spin 3.2s linear infinite;
}

.asset-bento-loader__dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #10d99a;
  top: -4px;
  left: calc(50% - 4px);
}

@keyframes asset-bento-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes asset-bento-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .asset-bento-loader__image,
  .asset-bento-loader__orbit {
    animation: none;
  }
}
`
  );

  await writeFile(
    path.join(options.out, `${componentName}.tsx`),
    `import "./${slug}.css";

type ${componentName}Props = {
  alt?: string;
  className?: string;
  src?: string;
};

export function ${componentName}({
  alt = "",
  className = "",
  src = "${copiedImage}"
}: ${componentName}Props) {
  return (
    <div className={\`asset-bento-loader \${className}\`} role="status" aria-live="polite">
      <span className="asset-bento-loader__orbit" aria-hidden="true">
        <span className="asset-bento-loader__dot" />
      </span>
      <img className="asset-bento-loader__image" src={src} alt={alt} />
    </div>
  );
}
`
  );

  await writeFile(
    path.join(options.out, `${slug}.svg`),
    `<svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="80" cy="80" r="58" stroke="#08232B" stroke-opacity="0.16"/>
  <circle cx="80" cy="22" r="4" fill="#10D99A"/>
</svg>
`
  );

  await writeFile(
    path.join(options.out, "README.md"),
    `# ${componentName}

Static image plus CSS/SVG orbit accents. The generated CSS includes \`prefers-reduced-motion\` support.
`
  );
}
