import { Client, Intents, IntentsString } from 'discord.js'
import { CommandClient } from '../src'

const config = require('./config.json')

const client = new Client({
  intents: Object.keys(Intents.FLAGS) as IntentsString[],
})

const cts = new CommandClient({
  owners: [],
  client,
  command: {
    prefix: '!',
  },
  slashCommands: {
    autoSync: true,
    guild: '832938554438844438',
  },
})

require('./modules/test')

cts.registry.loadModulesIn('modules')

client.login(config.token)
