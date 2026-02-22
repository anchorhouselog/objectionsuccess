<script>
const WORKER_URL = "/token";

let pc, dc, localStream, audioEl;

function setStatus(t) {
  document.getElementById("status").textContent = "Status: " + t;
}

async function startCall() {
  try {
    setStatus("Requesting microphone…");

    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    setStatus("Getting token…");

    const leadType = document.getElementById("leadType").value;

    const tokenResp = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadType })
    });

    const tokenJson = await tokenResp.json();

    if (!tokenResp.ok || !tokenJson.token) {
      console.error("Token error:", tokenJson);
      setStatus("Token error (check Worker logs / API key).");
      return;
    }

    const EPHEMERAL_TOKEN = tokenJson.token;

    pc = new RTCPeerConnection();

    // Create audio output element
    audioEl = document.createElement("audio");
    audioEl.autoplay = true;
    document.body.appendChild(audioEl);

    pc.ontrack = (event) => {
      audioEl.srcObject = event.streams[0];
    };

    // Add microphone track
    localStream.getTracks().forEach(track =>
      pc.addTrack(track, localStream)
    );

    // Data channel
    dc = pc.createDataChannel("oai-events");

    dc.onopen = () => {
      setStatus("Connected. Speak now.");

      // 🔥 Trigger model response cycle
      dc.send(JSON.stringify({
        type: "response.create"
      }));
    };

    dc.onmessage = (event) => {
      // Optional: inspect model events
      // console.log("OAI event:", event.data);
    };

    setStatus("Connecting…");

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const realtimeUrl =
      "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview";

    const sdpResp = await fetch(realtimeUrl, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + EPHEMERAL_TOKEN,
        "Content-Type": "application/sdp"
      },
      body: offer.sdp
    });

    const answerSdp = await sdpResp.text();

    await pc.setRemoteDescription({
      type: "answer",
      sdp: answerSdp
    });

    document.getElementById("startBtn").disabled = true;
    document.getElementById("endBtn").disabled = false;

  } catch (err) {
    console.error(err);
    setStatus("Mic blocked. Allow mic and refresh.");
  }
}

async function endCall() {
  setStatus("Ending…");

  try {
    if (dc && dc.readyState === "open") dc.close();
    if (pc) pc.close();
    if (localStream)
      localStream.getTracks().forEach(t => t.stop());
    if (audioEl) audioEl.remove();
  } catch (e) {}

  pc = null;
  dc = null;
  localStream = null;
  audioEl = null;

  document.getElementById("startBtn").disabled = false;
  document.getElementById("endBtn").disabled = true;

  setStatus("idle");
}

document.getElementById("startBtn").addEventListener("click", startCall);
document.getElementById("endBtn").addEventListener("click", endCall);
</script>
