import { Config } from "@remotion/cli/config";

// Output tuning for the landing hero loop.
// - H.264 MP4 for <video src=…> autoplay-muted compatibility
// - yuv420p so Safari/iOS will play the result
// - CRF 18 — visually lossless for our editorial type; file stays small
//   because there's very little pixel motion (mostly paper, hairlines, type).
Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setCrf(18);
Config.setConcurrency(4);
