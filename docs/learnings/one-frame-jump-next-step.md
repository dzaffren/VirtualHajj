# Test a one-frame jump past a boundary through to the next frame

**Learned:** 2026-10-22 · **From:** tawaf-stations /build

The istilam sheet rose on a one-frame crossing of the Hajar Aswad line, but the rules kept the angle past the line while the Walker stood the pilgrim back before it. The unit test checked only that the sheet rose. Headless Firefox draws slowly, so the first frame after Start round 1 jumped past the line again, and the rules saw no crossing. Two e2e tests failed; the slice test passed only by frame timing.

Wrong: test that the state stops at the boundary. Right: also step once more, from where the walk puts the figure back, at the e2e pace of up to 3.4 m a frame.
