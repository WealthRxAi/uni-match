#!/usr/bin/env bash
# Records one Claude Code build session as authentic terminal footage.
# Usage: ./record-session.sh <session-name> <prompt-file>
set -u
NAME="$1"; PROMPT_FILE="$2"
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
export PATH="$PATH"
CAST="recordings/${NAME}.cast"
LOG="transcripts/${NAME}.log"

asciinema rec -q --overwrite "$CAST" -c "bash -c '
  printf \"\\033[1;36m\$ claude\\033[0m\\n\\n\";
  printf \"\\033[1;33m> PROMPT:\\033[0m\\n\";
  sed \"s/^/  /\" \"$PROMPT_FILE\";
  printf \"\\n\\033[1;36m--- Claude Code session start ---\\033[0m\\n\\n\";
  claude -p \"\$(cat \"$PROMPT_FILE\")\" --permission-mode acceptEdits --allowedTools \"Bash(npm:*)\" \"Bash(npx:*)\" \"Bash(node:*)\" \"Bash(git:*)\" \"Bash(ls:*)\" \"Bash(cat:*)\" \"Bash(mkdir:*)\" \"Bash(cp:*)\" \"Bash(mv:*)\" \"Bash(sed:*)\" \"Bash(grep:*)\" --verbose --output-format text 2>&1 | tee \"$LOG\";
  printf \"\\n\\033[1;36m--- session complete (exit \$?) ---\\033[0m\\n\";
'"
# widen the cast header for nicer rendering
sed -i '1s/"width": 80/"width": 120/; 1s/"height": 24/"height": 32/' "$CAST"
echo "DONE:${NAME}"
