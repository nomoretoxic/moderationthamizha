import { Client, GatewayIntentBits, Partials } from "discord.js";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

// ==========================
// 🔧 ENV VARIABLES
// ==========================
const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const PORT = process.env.PORT || 3000;
// ==========================

// Regex to detect links
const linkRegex = /(https?:\/\/[^\s]+)/gi;

// ==========================
// 🌐 Web server (Render requirement)
// ==========================
const app = express();

app.get("/", (req, res) => {
    res.send("Bot is running!");
});

app.listen(PORT, () => {
    console.log(`🌐 Web service running on port ${PORT}`);
});

// ==========================
// 🤖 Discord Bot Setup
// ==========================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Message, Partials.Channel, Partials.User]
});

client.on("messageCreate", async (message) => {
    if (message.guild?.id !== GUILD_ID) return;

    if (message.author.bot) return;

    if (linkRegex.test(message.content)) {
        try {
            await message.delete();

            await message.author.send(
                `⚠️ **SENDING LINKS IS NOT ALLOWED IN DARK SHADOW MC**`
            );

            const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                await logChannel.send(
                    `🛑 **Link Deleted**\n` +
                    `👤 User: <@${message.author.id}> (${message.author.tag})\n` +
                    `📌 Channel: <#${message.channel.id}>\n` +
                    `💬 Message: \`${message.content}\``
                );
            }

            console.log(`✔ Link deleted + user DM'd + logged.`);

        } catch (error) {
            console.error("Moderation Error:", error);
        }
    }
});

client.login(TOKEN);
