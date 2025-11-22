const { Client, GatewayIntentBits, Partials } = require("discord.js");
const express = require("express");
require("dotenv").config();

// ==========================
// 🔧 ENV VARIABLES
// ==========================
const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const PORT = process.env.PORT || 3000; // Web service port
// ==========================

// Regex to detect links
const linkRegex = /(https?:\/\/[^\s]+)/gi;

// ==========================
// 🌐 WEB SERVER (for hosting)
// ==========================
const app = express();

app.get("/", (req, res) => {
    res.send("Bot is running!");
});

app.listen(PORT, () => {
    console.log(`🌐 Web service running on port ${PORT}`);
});
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
    // Only work inside your server
    if (message.guild?.id !== GUILD_ID) return;

    // Ignore bot messages
    if (message.author.bot) return;

    // Detect links
    if (linkRegex.test(message.content)) {
        try {
            // Delete the message
            await message.delete();

            // DM warning
            await message.author.send(
                `⚠️ **SENDING LINKS IS NOT ALLOWED IN THAMIZHA CLOUD**`
            );

            // Log to mod channel
            const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                await logChannel.send(
                    `🛑 **Link Deleted**\n` +
                    `👤 User: <@${message.author.id}> (${message.author.tag})\n` +
                    `📌 Channel: <#${message.channel.id}>\n` +
                    `💬 Message Content: \`${message.content}\``
                );
            }

            console.log(`✔ Deleted link + DM sent + logged for ${message.author.tag}`);

        } catch (err) {
            console.error("Moderation Error:", err);
        }
    }
});

client.login(TOKEN);
