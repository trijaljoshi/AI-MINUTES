import protobuf from "protobufjs";

let messageType = null;
let loadPromise = null;

function loadProto() {
  if (!loadPromise) {
    loadPromise = protobuf.load("/proto/stt.proto").then((root) => {
      messageType = root.lookupType("Agora.SpeechToText.Text");
    });
  }
  return loadPromise;
}

export async function decodeSTT(data) {
  await loadProto();
  const message = messageType.decode(data);
  return messageType.toObject(message, { longs: String, defaults: true });
}