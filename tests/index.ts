import { volcanoTTS } from "@/src/tts/volcano";
import { GPTSoVITS} from "@/src/tts/gptsovits";
import { writeFile } from "fs/promises";
import { Readable } from "stream";

async function main() {
  const audioStream = new Readable({ read() {} });
  // const audioBuffer = await volcanoTTS(audioStream, {
  //   text: "你好，很高兴认识你。",
  // });
  const audioBuffer = await GPTSoVITS(audioStream, {
    text: "你好，很高兴认识你。",
  });
  if (audioBuffer) {
    await writeFile("test.wav", audioBuffer);
  }
}

main();
