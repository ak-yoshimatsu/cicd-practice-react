import Hls from "hls.js";
import { useCallback, useRef, useState } from "react";
import "./App.css";

type InitializePlayerOptions = {
  autoplay?: boolean; // 自動再生を有効にするかどうか
};

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // 動画URL
  const src = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

  /** 初期表示時のプレイヤーの制御 */
  const initializePlayer = useCallback(
    (options: InitializePlayerOptions = { autoplay: false }) => {
      const video = videoRef.current;

      if (video) {
        // HLS.jsを使った再生処理
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (options.autoplay) {
              video
                .play()
                .catch((err) =>
                  console.error("Failed to play the video " + src, err)
                );
            }
          });

          // コンポーネントのアンマウント時にクリーンアップ
          return () => {
            hls.destroy();
          };
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // SafariなどネイティブでHLSをサポートする場合
          video.src = src;
          if (options.autoplay) {
            video
              .play()
              .catch((err) =>
                console.error("Failed to play the video " + src, err)
              );
          }
        } else {
          console.error("HLS is not supported in this browser.");
        }
      }
    },
    [src]
  );

  /** 再生ボタン押されたときの制御 */
  const handlePlayClick = () => {
    initializePlayer({ autoplay: true }); // 初期化と再生を行う
    setIsPlaying(true);
    videoRef.current
      ?.play()
      .catch((err) => console.error("Video play failed:", err));
  };

  return (
    <>
      <h1>ストリーミング再生</h1>

      <video style={{ height: "500px" }} ref={videoRef} controls={isPlaying} />

      {/* 再生ボタン */}
      {!isPlaying && (
        <div>
          <button onClick={handlePlayClick}>▶</button>
        </div>
      )}
    </>
  );
}

export default App;
