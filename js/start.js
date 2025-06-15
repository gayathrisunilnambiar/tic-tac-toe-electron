document.getElementById("startBtn").addEventListener("click", () => {
    const { ipcRenderer } = require("electron");
    ipcRenderer.send("navigate", "mode");
  });
  