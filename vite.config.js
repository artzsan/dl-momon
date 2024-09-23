import {defineConfig} from "vite"
import {crx} from "@crxjs/vite-plugin"
import manifest from "./manifest.json"
import {zip} from "zip-a-folder" // jszipを使用するために、zip-a-folderを利用

const outputDir = `dl-momon-v${manifest.version}`

export default defineConfig({
  plugins: [
    crx({manifest}),
    {
      name: "zip-plugin",
      closeBundle: async () => {
        try {
          await zip(outputDir, `${outputDir}.zip`)
        } catch (error) {
          console.error("zip failed", error)
        }
      },
    },
  ],
  build: {
    outDir: outputDir,
  },
})
