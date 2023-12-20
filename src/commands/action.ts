import { Context, Telegraf } from "telegraf";

export default class Action{
    private bot:Telegraf;

    private static instance:Action;

    constructor(bot:Telegraf){
        this.bot = bot;
    }

    public static getInstance( bot?:Telegraf ):Action{
        if (!Action.instance) {
            Action.instance = new Action(bot!);
        }
        return Action.instance;
    }

    public async setButton(name:string, callback:any) {
       return this.bot.action(name, callback)
    }
}

