#!/usr/bin/env bash
# ── UniMatch: on-camera re-run ─────────────────────────────────────────
# Run this in YOUR terminal on the Mac while screen-recording
# (QuickTime: Cmd+Shift+5, or OBS). Everything that happens is a real
# Claude Code session — no renders, no AI video.
#
# Usage:
#   ./record-for-camera.sh          # fresh build in ../uni-match-live
#   ./record-for-camera.sh 3        # start from prompt 3
#
# Each step: shows the prompt, waits for ENTER (compose yourself /
# start the take), then runs the real `claude` session.
set -u
SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="${DEST:-$SRC/../uni-match-take-$(date +%m%d-%H%M)}"
START="${1:-1}"
mkdir -p "$DEST" && cd "$DEST"
cp -n "$SRC/CLAUDE.md" . 2>/dev/null
clear
echo "🎬  UniMatch on-camera build — fresh workspace: $DEST"
echo "    (CLAUDE.md spec copied in. Recording should be rolling.)"
echo
for i in 1 2 3 4 5; do
  [ "$i" -lt "$START" ] && continue
  P="$SRC/prompts/0${i}-"*.md
  echo "──────────────────────────────────────────────────────────────"
  echo "  SESSION $i — prompt file: $(basename $P)"
  echo "──────────────────────────────────────────────────────────────"
  echo
  read -p "▶ Press ENTER to run session $i (Ctrl+C to stop)..."
  claude --permission-mode acceptEdits "$(cat $P)"
  echo
  echo "✅ Session $i done. Good moment to cut / breathe."
  echo
done
echo "🏁 All sessions complete. Run: npm run validate && npm run test && npm run build"
