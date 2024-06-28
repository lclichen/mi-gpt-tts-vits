import { randomUUID } from "crypto";
import { Readable } from "stream";
import WebSocket from "ws";
import * as zlib from "zlib";
import { TTSProvider, TTSSpeaker, kTTSDefaultText } from "./type";

// 自建 TTS 音色列表：使用端口号来区分角色
const kGPTSoVITSSpeakers: TTSSpeaker[] = [
  /**
   * 通用场景
   */
  {
    name: "三无",
    gender: "女",
    speaker: "5235",
  },
  {
    name: "憨色",
    gender: "女",
    speaker: "5237",
  },
  {
    name: "银狼",
    gender: "女",
    speaker: "5237",
  },
  {
    name: "冷鸟",
    gender: "女",
    speaker: "5238",
  },
  {
    name: "泠鸢",
    gender: "女",
    speaker: "5238",
  },
];

export const kGPTSoVITS: TTSProvider = {
  name: "GPTSoVITS",
  tts: GPTSoVITS,
  speakers: kGPTSoVITSSpeakers,
};

// custom api
const kAPI = process.env.TTS_BASE_URL;

export async function GPTSoVITS(
  responseStream: Readable,
  options?: { text?: string; speaker?: string }
) {
  const { text, speaker: _speaker } = options ?? {};
  const speaker =
    kGPTSoVITSSpeakers.find(
      (e) => e.speaker === _speaker || e.name === _speaker
    )?.speaker ?? kGPTSoVITSSpeakers[0].speaker;

  const request: any = getGPTSoVITSConfig();
  let requestId: string = randomUUID();

  if (!request) {
    return; // 找不到GPT SoVITS TTS 环境变量
  }

  request.text = text || kTTSDefaultText;

  requestId = requestId.substring(0, 8);

  // a http post request to the kAPI, to get the audio/wav data
  const response = await fetch(kAPI + speaker, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch audio data");
  }
  const audioData = await response.arrayBuffer();

  return new Promise<Uint8Array>((resolve, reject) => {
    const onError = (err: any) => {
      console.log(requestId, "❌ Generate failed!");
      responseStream.push("404");
      responseStream.push(null);
      reject();
    };
    try {
      const audioBuffer = new Uint8Array(audioData);
      responseStream.push(audioBuffer);
      resolve(audioBuffer);
      return;
    } catch (err) {
      console.log(requestId, "❌ Unknown error:", err);
      onError(err);
    }
  });



  // const ws = new WebSocket(kAPI, {
  //   headers: { Authorization: `Bearer; ${request.app.token}` },
  // });

  // return new Promise<Uint8Array>((resolve, reject) => {
  //   let audioBuffer = new Uint8Array();

  //   const onError = (err: any) => {
  //     console.log(requestId, "❌ Generate failed!");
  //     responseStream.push("404");
  //     responseStream.push(null);
  //     reject();
  //   };

  //   try {
  //     ws.on("open", () => {
  //       ws.send(fullClientRequest);
  //     });

  //     ws.on("message", (data) => {
  //       const responseBuffer = Buffer.from(data as ArrayBuffer);
  //       const messageSpecificFlags = responseBuffer[1] & 0x0f;
  //       const audioData = parseAudioData(requestId, responseBuffer);
  //       if (audioData === "started") {
  //         return;
  //       }
  //       if (typeof audioData === "string") {
  //         onError(audioData);
  //         return;
  //       }
  //       if (audioData.length > 0) {
  //         // console.log(requestId, "✅ Received audio bytes: ", audioData.length);
  //         responseStream.push(audioData);
  //         const newData = new Uint8Array(audioBuffer.length + audioData.length);
  //         newData.set(audioBuffer, 0);
  //         newData.set(audioData, audioBuffer.length);
  //         audioBuffer = newData;
  //         if (messageSpecificFlags === 3) {
  //           console.log(requestId, "✅ Done: ", audioBuffer.length);
  //           ws.close();
  //         }
  //         return;
  //       }
  //     });

  //     ws.on("error", (err) => {
  //       console.log(requestId, "❌ WebSocket error:", err);
  //       onError(err);
  //     });

  //     ws.on("close", () => {
  //       responseStream.push(null);
  //       resolve(audioBuffer);
  //     });
  //   } catch (err) {
  //     console.log(requestId, "❌ Unknown error:", err);
  //     onError(err);
  //   }
  // });
}

const getGPTSoVITSConfig = () => {
  return {
    text: "", 
    text_language: "zh", 
    auth: process.env.CUSTOM_TTS_AUTH,
    format: "wav",
  };
}
