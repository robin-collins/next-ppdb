const net = require('net')
const fs = require('fs')
const path = require('path')
const { execSync, spawn } = require('child_process')
const startPort = 3000

// Parse command line arguments
const args = process.argv.slice(2)
let customEnvFile = null

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--env' && args[i + 1]) {
    customEnvFile = args[i + 1]
    break
  }
}

const envPath = path.join(process.cwd(), '.env')
const backupEnvPath = path.join(process.cwd(), '.env.backup')
const customEnvPath = customEnvFile ? path.resolve(process.cwd(), customEnvFile) : null
let didBackup = false

// --- RECOVERY CHECK ---
// If a backup exists at startup, it means we crashed previously. Restore it immediately.
if (fs.existsSync(backupEnvPath)) {
  console.warn('⚠️ Found .env.backup from a previous abnormal exit. Restoring .env...')
  if (fs.existsSync(envPath)) {
    fs.unlinkSync(envPath) // Remove the stale "swapped" file
  }
  fs.renameSync(backupEnvPath, envPath)
  console.info('✅ Restored .env from backup.')
}

// --- SETUP ENV ---
if (customEnvPath) {
  if (!fs.existsSync(customEnvPath)) {
    console.error(`❌ Error: Specified environment file '${customEnvFile}' does not exist.`)
    process.exit(1)
  }

  console.info(`🔄 Switching environment to: ${customEnvFile}`)
  
  // 1. Backup existing .env (if it exists)
  if (fs.existsSync(envPath)) {
    fs.renameSync(envPath, backupEnvPath)
    didBackup = true
  }

  // 2. Copy custom env to .env
  fs.copyFileSync(customEnvPath, envPath)
}

// --- CLEANUP HANDLER ---
const devInfoPath = path.join(process.cwd(), '.env.nextjs_dev.json')

const cleanup = () => {
  // 1. Remove dev info file
  if (fs.existsSync(devInfoPath)) {
    try {
      fs.unlinkSync(devInfoPath)
    } catch (e) {
      // Ignore
    }
  }

  // 2. Restore .env
  if (customEnvPath) {
    try {
      // Remove the temporary .env (which was the copy of custom)
      if (fs.existsSync(envPath)) {
        fs.unlinkSync(envPath)
      }
      
      // Restore the original .env from backup
      if (didBackup && fs.existsSync(backupEnvPath)) {
        fs.renameSync(backupEnvPath, envPath)
        console.info('\n✅ Environment restored.')
      }
    } catch (err) {
      console.error('\n❌ Error restoring environment file:', err.message)
    }
  }
}

// Register cleanup handlers
const handleExit = (code) => {
  cleanup()
  process.exit(code || 0)
}

process.on('SIGINT', () => handleExit(0))
process.on('SIGTERM', () => handleExit(0))
process.on('exit', () => cleanup())

// Clean dev info at startup
if (fs.existsSync(devInfoPath)) {
  fs.unlinkSync(devInfoPath)
}

// Get worktree information
const getWorktreeInfo = () => {
  try {
    // Check if git exists first to avoid noisy errors if not installed
    try {
      execSync('git --version', { stdio: 'ignore' })
    } catch {
      return { worktreeRoot: null, worktreeName: null }
    }

    const worktreeRoot = execSync(
      'git worktree list --porcelain | awk -v here="$(git rev-parse --show-toplevel)" \'$1=="worktree" && $2==here {print $2}\'',
      { encoding: 'utf8', shell: '/bin/bash', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim()

    const worktreeName = execSync(
      'git worktree list --porcelain | awk -v here="$(git rev-parse --show-toplevel)" \'$1=="worktree" && $2==here {n=$2} END{if(n!=""){sub(/.*\\//,"",n); print n}}\'',
      { encoding: 'utf8', shell: '/bin/bash', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim()

    return {
      worktreeRoot: worktreeRoot || null,
      worktreeName: worktreeName || null,
    }
  } catch (e) {
    return {
      worktreeRoot: null,
      worktreeName: null,
    }
  }
}

const findPort = port => {
  const server = net.createServer()
  server.once('error', () => findPort(port + 1))
  server.once('listening', () => {
    server.close()
    
    // Create logs directory
    const logsDir = path.join(process.cwd(), 'logs')
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir)
    }

    // Generate log filename
    const now = new Date()
    const pad = n => n.toString().padStart(2, '0')
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    const logFilePath = path.join(logsDir, `${timestamp}_ppdb_app.log`)
    const logStream = fs.createWriteStream(logFilePath, { flags: 'a' })

    console.info(`Logging output to: ${logFilePath}`)

    const child = spawn(
      'npx',
      ['next', 'dev', '--port', port.toString()],
      { stdio: ['ignore', 'pipe', 'pipe'], shell: true }
    )

    const { Transform } = require('stream')
    const createStripAnsiStream = () => {
      return new Transform({
        transform(chunk, encoding, callback) {
          const text = chunk.toString()
          const cleanText = text.replace(
            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
            ''
          )
          this.push(cleanText)
          callback()
        },
      })
    }

    // Pipe outputs
    child.stdout.pipe(process.stdout)
    child.stdout.pipe(createStripAnsiStream()).pipe(logStream, { end: false })

    child.stderr.pipe(process.stderr)
    child.stderr.pipe(createStripAnsiStream()).pipe(logStream, { end: false })

    // Handler for child exit
    child.on('exit', (code, signal) => {
      logStream.end()
      cleanup()
      if (signal) {
        process.exit(128 + (signal === 'SIGINT' ? 2 : signal === 'SIGTERM' ? 15 : 0))
      } else {
        process.exit(code || 0)
      }
    })

    const worktreeInfo = getWorktreeInfo()
    const devInfo = {
      port: port,
      pid: child.pid,
      worktreeName: worktreeInfo.worktreeName,
      worktreeRoot: worktreeInfo.worktreeRoot,
    }

    console.info('Server Running on port: ', port)
    console.info('To kill the server you can use `sudo kill -9 ' + child.pid + '`\n')
    
    fs.writeFileSync(devInfoPath, JSON.stringify(devInfo, null, 2))
  })
  server.listen(port)
}

findPort(startPort)
