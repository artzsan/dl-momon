chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchImage") {
    fetch(message.url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.blob()
      })
      .then(blob => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64data = reader.result.split(",")[1] // Base64部分を取得
          sendResponse({base64: base64data, type: blob.type})
        }
        reader.readAsDataURL(blob) // BlobをDataURLとして読み込む
      })
      .catch(error => {
        console.error("Error fetching image:", error)
        sendResponse({error: "Image fetch failed: " + error.message})
      })
    return true // 非同期応答を待つために必要
  }
})
