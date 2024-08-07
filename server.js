import http from "http";
import { parse } from "url";
import apiSpeakers from "./api/speakers.js";
import apiTTS from "./api/tts.mp3.js";
import { createReadStream, stat } from "fs";

const exists = (path) => {
  let isFile = false;
  stat(path, (err, stats) => {
    if (!err && stats.isFile()) {
      isFile = true;
    }
  });
  return isFile;
};

const server = http.createServer((req, res) => {
  const { pathname } = parse(req.url);
  console.log("🔥 " + decodeURI(req.url));
  if (pathname.startsWith("/api/speakers")) {
    apiSpeakers(req, res);
  } else if (pathname.startsWith("/api/tts.mp3")) {
    apiTTS(req, res);
  } else if (exists(`public/${pathname}`)) {
    res.writeHead(200, {
      "Transfer-Encoding": "chunked",
      "Content-Type": "audio/mpeg",
    });
    const readStream = createReadStream(`public/${pathname}`);
    readStream.pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404");
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
