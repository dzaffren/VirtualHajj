# Pin dependencies at least a day old, and set allowBuilds for any blocked install script

**Learned:** 2026-10-21 · **From:** walking-skeleton /build

pnpm 12 refuses a version published less than a day ago, and quietly adds it to `minimumReleaseAgeExclude` when you name it. It also fails the install while a package's install script is neither allowed nor denied.

Wrong: `pnpm add -D vite@8.3.5` on the day 8.3.5 came out. Right: `pnpm add -D vite@8.3.4`, then `pnpm approve-builds '!esbuild' '!workerd'`, which writes `allowBuilds` to `pnpm-workspace.yaml`.
