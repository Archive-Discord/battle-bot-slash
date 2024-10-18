import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from '@discordjs/builders';
import {
  MessageCommandFuntion,
  MessageCommandOptions,
  SlashCommandFunction,
  SlashCommandOptions,
  ButtonInteractionOptions,
  ButtonInteractionFunction,
} from '../../typings/structures';

export class SlashCommand {
  constructor(
    public data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder,
    public execute: SlashCommandFunction,
    public options?: SlashCommandOptions,
  ) { }
}

export class MessageCommand {
  constructor(public data: MessageCommandOptions, public execute: MessageCommandFuntion) { }
}

export class BaseCommand extends MessageCommand {
  constructor(
    public data: MessageCommandOptions,
    public execute: MessageCommandFuntion,
    public slash?: SlashCommand | undefined,
  ) {
    super(data, execute);
  }
}

export class ButtonInteraction {
  constructor(public data: ButtonInteractionOptions, public execute: ButtonInteractionFunction) { }
}
