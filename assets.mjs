// The purpose of this script is to output the js file of the build result so that it can be submitted to the Chrome Web Store for review.

import fs from "fs/promises"
import path from "path"

const directoryPath = "./build/chrome-mv3-prod"

const jsFiles = []

async function readDirectory(dirPath) {
  try {
    const files = await fs.readdir(dirPath)

    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dirPath, file)
        const stats = await fs.stat(filePath)

        if (stats.isDirectory()) {
          if (filePath !== path.join(directoryPath, "static")) {
            await readDirectory(filePath)
          }
        } else if (file.endsWith(".js")) {
          jsFiles.push(file)
        }
      })
    )
  } catch (err) {
    console.error("Error reading directory:", err)
  }
}

async function main() {
  await readDirectory(directoryPath)

  const concatenatedNames = jsFiles.join(",")
  console.log(concatenatedNames)
}

main()
