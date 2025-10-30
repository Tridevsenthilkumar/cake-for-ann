document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  // NEW: Get the message element
  const birthdayMessage = document.getElementById("birthdayMessage"); 
  
  let candles = [];
  let audioContext;
  let analyser;
  let microphone;

  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;
    candleCountDisplay.textContent = activeCandles;

    // NEW LOGIC: Show message when all candles are out
    if (activeCandles === 0) {
      birthdayMessage.style.display = 'block'; // Show the message
    } else {
      birthdayMessage.style.display = 'none'; // Ensure it's hidden otherwise
    }
  }

  function addCandle(left, top) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = left + "px";
    candle.style.top = top + "px";

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    cake.appendChild(candle);
    candles.push(candle);
  }

  // --- START: FIXED 18 CANDLE LOGIC ---
  const fixedCandlePositions = [
    // Top Row (8 candles)
    { left: 30, top: 0 }, { left: 55, top: -5 },
    { left: 80, top: -8 }, { left: 105, top: -10 },
    { left: 130, top: -10 }, { left: 155, top: -8 },
    { left: 180, top: -5 }, { left: 205, top: 0 },

    // Middle Row (6 candles)
    { left: 40, top: 15 }, { left: 75, top: 10 },
    { left: 110, top: 8 }, { left: 145, top: 8 },
    { left: 180, top: 10 }, { left: 215, top: 15 },
    
    // Inner Row (4 candles)
    { left: 60, top: 30 }, { left: 100, top: 25 },
    { left: 140, top: 25 }, { left: 180, top: 30 }
  ];

  // Add all 18 candles when the page loads
  fixedCandlePositions.forEach(pos => {
    addCandle(pos.left, pos.top);
  });
  
  // Initialize the counter and check the message status
  updateCandleCount();
  // --- END: FIXED CANDLE LOGIC ---

  // NOTE: The click event listener to add candles has been removed.

  function isBlowing() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    let average = sum / bufferLength;

    return average > 40; //
  }

  function blowOutCandles() {
    let blownOut = 0;

    if (isBlowing()) {
      candles.forEach((candle) => {
        if (!candle.classList.contains("out") && Math.random() > 0.5) {
          candle.classList.add("out");
          blownOut++;
        }
      });
    }

    if (blownOut > 0) {
      updateCandleCount();
    }
  }

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        setInterval(blowOutCandles, 200);
      })
      .catch(function (err) {
        console.log("Unable to access microphone: " + err);
      });
  } else {
    console.log("getUserMedia not supported on your browser!");
  }
});
