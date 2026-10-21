# VirtualHajj: how to build with this system

`window.VirtualHajj` has no components yet. Build every control in plain markup from the tokens below. Real components arrive in a later sync.

## Setup

- Link `styles.css` once. It imports `tokens/*.css` and `_ds_bundle.css`, which sets the body background, text colour and font, the focus ring, and the `vh-doa` class. Without it nothing is styled.
- There is no provider. Light and dark follow the device. To force one, put `data-theme="light"` or `data-theme="dark"` on any element; the tokens inside it switch.
- Fonts load from Google Fonts through `tokens/fonts.css`: Readex Pro for Latin and Arabic UI text, Amiri for doa.

## Styling: CSS custom properties

Use `var(--vh-*)` for every colour, size and duration. No raw hex, and no spacing outside the scale.

| Family | Tokens |
| --- | --- |
| Colour | `--vh-surface` `--vh-sunken` `--vh-ink` `--vh-ink-muted` `--vh-line` `--vh-accent` `--vh-accent-ink` `--vh-accent-hover` `--vh-on-accent` `--vh-mistake` `--vh-scrim` `--vh-map-area` |
| Accent edge | `--vh-accent-edge` (a full `border` value) |
| Type, as `font: var(...)` | `--vh-text-caption` `--vh-text-body` `--vh-text-label` `--vh-text-lead` `--vh-text-instruction` `--vh-text-title` `--vh-text-doa` |
| Space | `--vh-space-1` `--vh-space-2` `--vh-space-3` `--vh-space-4` `--vh-space-6` `--vh-space-8` `--vh-space-12` `--vh-space-16` (4px to 64px) |
| Size | `--vh-target` (48px minimum touch target) `--vh-joystick` `--vh-joystick-knob` |
| Radius | `--vh-radius-mark` `--vh-radius-inner` `--vh-radius-control` `--vh-radius-panel` |
| Motion | `--vh-dur-press` `--vh-dur-micro` `--vh-dur-panel` `--vh-dur-step` `--vh-dur-reward` `--vh-stagger` `--vh-ease-settle` `--vh-ease-leave` `--vh-move` |

Rules the tokens cannot enforce:

- `--vh-accent` means "act here now": the primary button, the next target, a switch that is on. Accent as text or an icon uses `--vh-accent-ink`.
- Give every accent fill `background: var(--vh-accent); color: var(--vh-on-accent); border: var(--vh-accent-edge)`.
- Fill a selected item (language, character, done mark) with `--vh-ink` and put `--vh-surface` text on it.
- Show a mistake with `--vh-mistake` text, an icon and plain words. Never use green for success; use a check icon and words in `--vh-ink`.
- No shadows, blur, gradients, scores, timers, streaks or emoji. Use Lucide icons at a 2px stroke.
- Over the 3D scene, put text only on an opaque `--vh-surface` or `--vh-sunken` panel. Keep the lower middle of the screen clear for the character; put controls in the bottom corners.
- Put Arabic in its own block with `lang="ar" dir="rtl"`. Set doa in the `vh-doa` class.
- Animate `transform` and `opacity` only, and move nothing further than `--vh-move`.

## Where the truth lives

`styles.css` imports `tokens/colors.css`, `tokens/fonts.css`, `tokens/typography.css`, `tokens/spacing.css` and `tokens/motion.css`. Read those before styling. `guidelines/colors.html`, `typography.html`, `spacing.html`, `motion.html` and `hud.html` show each foundation and the walking HUD rules.

## Example: the top card over the scene

```html
<section style="background: var(--vh-surface); color: var(--vh-ink); border-radius: var(--vh-radius-panel); padding: var(--vh-space-4) var(--vh-space-6); display: grid; gap: var(--vh-space-2)">
  <p style="margin: 0; font: var(--vh-text-lead)">Round 3 of 7</p>
  <h1 style="margin: 0; font: var(--vh-text-instruction)">Keep the Kaabah on your left.</h1>
  <button type="button" style="justify-self: start; min-height: var(--vh-target); padding: 0 var(--vh-space-6); border: var(--vh-accent-edge); border-radius: var(--vh-radius-control); background: var(--vh-accent); color: var(--vh-on-accent); font: var(--vh-text-label)">Show me</button>
</section>
```
