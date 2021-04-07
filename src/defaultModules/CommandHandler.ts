import { Message } from 'discord.js'
import { CommandClient, Context, Module } from '../structures'
import { listener } from '../listener'

export class CommandHandler extends Module {
  constructor(private client: CommandClient) {
    super()
  }

  @listener('message')
  async onMessage(msg: Message) {
    const prefix = this.client.commandOptions.prefix
    const { content } = msg
    if (!content.startsWith(prefix)) return
    const args = content.slice(prefix.length).split(' ')
    const command = args.shift()
    if (!command) return
    const cmd = this.client.registry.commandManager.commandList.find(
      (x) =>
        x.name.toLowerCase() === command.toLowerCase() ||
        x.aliases.map((r) => r.toLowerCase()).includes(command),
    )
    if (!cmd) return
    const commandArgs = cmd.args
    const parsedArgs: any[] = []
    for (const i in commandArgs) {
      const v = args[i]
      const arg = commandArgs[i]
      if (!arg.optional && !v) {
        return this.client.emit(
          'commandError',
          new Error(`An argument is required but not provided.`),
        )
      }
      if (arg.type === String) {
        parsedArgs[i] = v
        continue
      }
      const converter = this.client.registry.commandManager.argConverterList.find(
        (x) => x.type === arg.type,
      )
      if (converter) {
        try {
          parsedArgs[i] = await converter.convert.apply(module, [v, msg])
        } catch (e) {
          return this.client.emit('commandError', msg, e)
        }
      } else {
        return this.client.emit(
          'commandError',
          new Error(
            `No converter found for type ${arg.type.constructor.name}.`,
          ),
        )
      }
    }
    const executeArgs = []
    if (cmd.usesCtx) {
      executeArgs[0] = new Context(msg)
    } else {
      executeArgs[0] = msg
    }
    executeArgs.push(...parsedArgs)
    try {
      cmd.execute.apply(cmd.module, executeArgs)
    } catch (e) {
      this.client.emit('commandError', e, msg)
    }
  }
}
