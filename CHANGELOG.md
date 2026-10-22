# Changelog

All notable changes to this project are documented in this file. The format is based
on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- A 3D view of the Kaabah at `/`. Drag or use one finger to turn it, and scroll or pinch to zoom. With the keyboard, the arrow keys turn it and + and − zoom.
- A plain message when the browser can't show the 3D view, and a Reload button when the view stops.
- A stress page at `/perf`. It draws a mosque-sized load and a walking figure, and reports the lowest FPS over 5 minutes.
- Walk a tawaf at `/tawaf`, from Start tawaf on the Kaabah view. Tap the floor or hold the arrow keys to walk seven rounds from the Hajar Aswad line.
- The tawaf page names a wrong-way walk, or a walk through the Hijr Ismail, when it happens. The done card lists each mistake.
- Turn the hints off to count the rounds alone and press Done.
- `/` and `/tawaf` open in Malay on a Malay browser, and a language choice switches between Malay and English.
- `/perf` draws the tawaf pilgrim, the Hijr Ismail wall and the line, so its 5-minute run covers `/tawaf`.
- With hints on, the pilgrim stops at the Hajar Aswad line before round 1 to teach istilam, in Arabic with its reading and meaning, and Show me how raises the pilgrim's hand. Each later round starts with a reminder.
- With hints on, the Rukun Yamani doa shows in the top card from the Rukun Yamani to the line, in every round.
- After seven rounds, walk to the spot behind the Maqam Ibrahim to pray two rakaat, then press Finish tawaf. With hints off, the done card notes when the rakaat were left out.
