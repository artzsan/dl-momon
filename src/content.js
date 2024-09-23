import JSZip from "jszip"
const zip = new JSZip()

const downloadImages = () => {
  const images = Array.from(document.querySelectorAll("#post-hentai img"))
    .map(img => img.src || img.dataset.src || img.dataset.lazy)
    .filter(Boolean)

  if (images.length === 0) {
    alert("No images found on this page.")
    return
  }

  let circle = ""
  let author = ""
  const postTagTables = document.querySelectorAll("#post-tag .post-tag-table")
  postTagTables.forEach(table => {
    const titleElement = table.querySelector(".post-tag-title")
    if (titleElement && titleElement.textContent.trim() === "サークル") {
      // 対応する名前（<a>要素）のテキストを取得
      circle = table.querySelector(".post-tags a").textContent
    }
    if (titleElement && titleElement.textContent.trim() === "作者") {
      let authors = table.querySelectorAll(".post-tags a")
      authors.length > 1 ? (author = authors[0].textContent + "他") : (author = authors[0].textContent)
    }
  })
  let title = document.getElementById("main").querySelector("h1").textContent || ""
  const zipname = `[${circle}](${author})_${title}.zip`
  const filehost = `[${circle}](${author})_${title}`
  const extension = ".webp"

  const promises = images.map((url, index) => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({action: "fetchImage", url}, response => {
        if (response && response.base64) {
          const byteCharacters = atob(response.base64) // Base64をデコード
          const byteNumbers = new Uint8Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const blob = new Blob([byteNumbers], {type: response.type}) // Blobを再構築
          const paddedIndex = String(index + 1).padStart(3, "0")
          let filename = filehost + `_${paddedIndex}` + extension
          zip.file(filename, blob) // Blobを使用
          resolve()
        } else {
          reject(new Error("Image fetch failed: " + (response.error || "Unknown error")))
        }
      })
    })
  })

  Promise.all(promises)
    .then(() => {
      zip.generateAsync({type: "blob"}).then(content => {
        const url = URL.createObjectURL(content)
        const a = document.createElement("a")
        a.href = url
        a.download = zipname
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      })
    })
    .catch(error => {
      console.error("Error in Promise.all:", error)
    })
}

window.onload = () => {
  let parent = document.getElementById("post-meta")
  const elem = document.createElement("div")
  elem.textContent = "ダウンロード"
  Object.assign(elem.style, {
    display: "inline-block",
    color: "rgba(255, 255, 255, 1)",
    cursor: "pointer",
    margin: "0 0 15px 10px",
    padding: "0 10px",
    lineHeight: "28px",
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "3px",
  })
  elem.addEventListener("click", () => {
    downloadImages()
  })
  parent.appendChild(elem)
}
