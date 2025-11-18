const net = require('net')
const fs = require('fs')
const path = require('path')
const startPort = 3000

// Check for and delete existing .env.nextjs_dev.json file at startup
const outputPath = path.join(process.cwd(), '.env.nextjs_dev.json')
if (fs.existsSync(outputPath)) {
  fs.unlinkSync(outputPath)
}

// Cleanup function to remove the dev info file
const cleanup = () => {
  if (fs.existsSync(outputPath)) {
    console.info('\nCleaning up .env.nextjs_dev.json...')
    fs.unlinkSync(outputPath)
  }
}

// Register cleanup handlers for graceful exit
process.on('SIGINT', () => {
  cleanup()
  process.exit(0)
})

process.on('SIGTERM', () => {
  cleanup()
  process.exit(0)
})

process.on('exit', () => {
  cleanup()
})

const findPort = port => {
  const server = net.createServer()
  server.once('error', () => findPort(port + 1))
  server.once('listening', () => {
    server.close()
    const child = require('child_process').spawn(
      'npx',
      ['next', 'dev', '--turbopack', '--port', port.toString()],
      { stdio: 'inherit', shell: true }
    )

    // Forward child process exit to parent cleanup
    child.on('exit', (code, signal) => {
      cleanup()
      if (signal) {
        process.exit(
          128 + (signal === 'SIGINT' ? 2 : signal === 'SIGTERM' ? 15 : 0)
        )
      } else {
        process.exit(code || 0)
      }
    })

    const devInfo = {
      port: port,
      pid: child.pid,
    }
    console.info('Server Running on port: ', port)
    console.info(
      'To kill the server you can use `sudo kill -9 ' + child.pid + '`\n'
    )
    fs.writeFileSync(outputPath, JSON.stringify(devInfo, null, 2))
  })
  server.listen(port)
}
findPort(startPort)
