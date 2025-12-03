#!/usr/bin/env node
/**
 * Wrapper script that expands .env variables before running Prisma CLI
 * Usage: node scripts/prisma-env.js migrate dev --name my_migration
 */
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
const { execSync } = require('child_process')

// Load .env and expand variables (override existing env vars)
const env = dotenv.config({ override: true })
dotenvExpand.expand(env)

// Run prisma with remaining args
const args = process.argv.slice(2).join(' ')
execSync(`npx prisma ${args}`, { stdio: 'inherit', env: process.env })
