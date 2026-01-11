#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import exportCmd from './commands/export'
import list from './commands/list'

const main = defineCommand({
  meta: {
    name: 'agentskills',
    description: 'Manage bundled skills for AI coding agents',
  },
  subCommands: {
    list,
    export: exportCmd,
  },
})

runMain(main)
