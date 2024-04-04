import fs from "fs/promises"
import path from "path"

const directoryPath = "./build/chrome-mv3-prod"

// 存储符合条件的文件名
const jsFiles = []

async function readDirectory(dirPath) {
  try {
    const files = await fs.readdir(dirPath)

    // 逐个处理文件
    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dirPath, file)
        const stats = await fs.stat(filePath)

        if (stats.isDirectory()) {
          // 如果是目录，则递归处理，但排除static目录
          if (filePath !== path.join(directoryPath, "static")) {
            await readDirectory(filePath)
          }
        } else if (file.endsWith(".js")) {
          // 如果是js文件，将其文件名存入数组
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

  // 输出js文件名
  const concatenatedNames = jsFiles.join(",")
  console.log(concatenatedNames)
}

main()
