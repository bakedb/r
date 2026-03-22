export async function onRequest(context) {
  const channel = context.params.channel;

  const script = `#!/usr/bin/env bash
CHANNEL_ID="${channel}"
CHANNEL_URL="https://www.youtube.com/channel/$CHANNEL_ID/videos"

# --- Check for yt-dlp ---
if ! command -v yt-dlp >/dev/null 2>&1; then
  echo "Error: yt-dlp is not installed."
  echo
  echo "Install it using one of the following:"
  echo "  • Linux: sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && sudo chmod a+rx /usr/local/bin/yt-dlp"
  echo "  • macOS (Homebrew): brew install yt-dlp"
  echo "  • Windows (Scoop): scoop install yt-dlp"
  echo
  exit 1
fi

echo "Fetching random video from channel: $CHANNEL_ID"

VIDEO_URL=$(yt-dlp --flat-playlist -J "$CHANNEL_URL" \
  | jq -r '.entries[].url' \
  | shuf -n 1)

if [[ -z "$VIDEO_URL" ]]; then
  echo "Failed to fetch video list."
  exit 1
fi

echo "Random video selected:"
echo "https://www.youtube.com/watch?v=$VIDEO_URL"
echo

read -p "Download as MP3? (Y/n): " ANSWER

case "$ANSWER" in
  [Yy]* | "" )
    echo "Downloading..."
    yt-dlp -x --audio-format mp3 "$VIDEO_URL"
    ;;
  * )
    echo "Cancelled."
    ;;
esac
`;

  return new Response(script, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
