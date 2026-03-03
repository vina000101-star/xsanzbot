const { Telegraf, Markup, session } = require("telegraf");
const fs = require('fs');
const moment = require('moment-timezone');
const chalk = require('chalk');
const { BOT_TOKEN } = require("./config");

// --- [ DATABASE SYSTEM ] ---
const ownerFile = './owneruser.json';
const verifiedFile = './verifieduser.json';
const groupFile = './registered_groups.json';

const loadJSON = (file) => {
    if (!fs.existsSync(file)) return [];
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return []; }
};
const saveJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

let ownerUsers = loadJSON(ownerFile);
let verifiedUsers = loadJSON(verifiedFile);
let registeredGroups = loadJSON(groupFile);

const bot = new Telegraf(BOT_TOKEN);
bot.use(session());

// --- [ CONFIGURATION ] ---
const CHANNEL_URL = "https://t.me/opennokosvvip";
const CHANNEL_ID = "@opennokosvvip"; 
const MIN_MEMBERS = 5;

// --- [ SECURITY: OWNER ONLY ] ---
const checkOwner = (ctx, next) => {
    if (!ownerUsers.includes(ctx.from.id.toString())) {
        return ctx.answerCbQuery("⚠️ AKSES DITOLAK: KHUSUS OWNER XSANZ!", { show_alert: true });
    }
    next();
};

const runtime = (seconds) => {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
};

// --- [ AUTO SAVE GROUPS ] ---
bot.on('new_chat_members', async (ctx) => {
    const chat = ctx.chat;
    try {
        const memberCount = await ctx.telegram.getChatMembersCount(chat.id);
        if (memberCount >= MIN_MEMBERS && !registeredGroups.includes(chat.id.toString())) {
            registeredGroups.push(chat.id.toString());
            saveJSON(groupFile, registeredGroups);
        }
    } catch (e) { console.log("Error logging group: ", e); }
});

// --- [ START MENU ] ---
bot.command('start', async (ctx) => {
    const userId = ctx.from.id.toString();
    if (!verifiedUsers.includes(userId)) {
        verifiedUsers.push(userId);
        saveJSON(verifiedFile, verifiedUsers);
    }

    const startText = `
┏━━━━━━━◥◣◆◢◤━━━━━━━┓
    🌟 𝗫𝗦𝗔𝗡𝗭 𝗝𝗔𝗦𝗛𝗘𝗥 𝗩𝟭 🌟
┗━━━━━━━◥◣◆◢◤━━━━━━━┛

( 🍁 ) - 情報 *Olaa* @${ctx.from.username || 'User'}

🚀 *DEPLOYER : XSANZ*
✨ *STATUS : ONLINE* [🍁]
━━━━━━━━━━━━━━━━━━━━━━`;

    await ctx.replyWithPhoto("https://files.catbox.moe/uu7vq0.png", {
        caption: startText,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('📢 𝗠𝗘𝗡𝗨 𝗝𝗔𝗦𝗛𝗘𝗥', 'btn_jasher')],
            [Markup.button.callback('👑 𝗢𝗪𝗡𝗘𝗥 𝗣𝗔𝗡𝗘𝗟', 'btn_owner')]
        ])
    });
});

// --- [ FIXED OWNER PANEL ] ---
bot.action('btn_owner', checkOwner, (ctx) => {
    ctx.answerCbQuery();
    const ownerDashboard = `
╔════════════════════╗
   🍁*𝗫𝗦𝗔𝗡𝗭 𝗔𝗗𝗠𝗜𝗡 𝗣𝗔𝗡𝗘𝗟* 🍁
╚════════════════════╝
⏱️ *𝗥𝗨𝗡𝗧𝗜𝗠𝗘* : ${runtime(process.uptime())}
👥 *𝗨𝗦𝗘𝗥𝗦* : ${verifiedUsers.length} | 🏢 *𝗚𝗥𝗢𝗨𝗣𝗦* : ${registeredGroups.length}

📊 *𝗟𝗨𝗫𝗨𝗥𝗬 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 :*
• /addowner [ID] - *Tambah Admin*
• /delowner [ID] - *Hapus Admin*
• /broadcast [Teks] - *BC ke User*
• /bcgroup [Teks] - *BC ke Semua Grup*
• /stats - *Cek RAM & Server*
• /cleardb - *Reset Semua Data*

━━━━━━━━━━━━━━━━━━━━━━
© 𝗗𝗘𝗣𝗟𝗢𝗬𝗘𝗥 : *𝗫𝗦𝗔𝗡𝗭 𝗦𝗧𝗢𝗥𝗘*`;

    ctx.reply(ownerDashboard, { 
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('📊 STATS', 'btn_stats'), Markup.button.callback('🧹 CLEAN DB', 'btn_clean')]
        ])
    });
});

// --- [ CORE: JASHER /SHARE ] ---
bot.command('share', async (ctx) => {
    const userId = ctx.from.id;
    const textToShare = ctx.message.text.split(" ").slice(1).join(" ");

    if (!textToShare) return ctx.reply("❌ Format Salah! Contoh: /share Promo Bot!");

    try {
        // Cek Join Channel
        const member = await ctx.telegram.getChatMember(CHANNEL_ID, userId);
        if (member.status === 'left' || member.status === 'kicked') {
            return ctx.reply(`⚠️ *VERIFIKASI GAGAL!*\n\nHarap bergabung ke saluran kami terlebih dahulu:\n🔗 ${CHANNEL_URL}`, { parse_mode: 'Markdown' });
        }

        const shareTemplate = `
👤 : @${ctx.from.username || 'User'}

${textToShare}

━━━━━━━━━━━━━━━━━━━━━━
𝗙𝗥𝗘𝗘 𝗝𝗔𝗦𝗛𝗘𝗥 : @${ctx.botInfo.username}
© 𝗗𝗘𝗣𝗟𝗢𝗬𝗘𝗥 : *𝗫𝗦𝗔𝗡𝗭 𝗦𝗧𝗢𝗥𝗘*`;

        let success = 0;
        // Kirim ke semua user terdaftar
        for (const id of verifiedUsers) {
            try { await ctx.telegram.sendMessage(id, shareTemplate, { parse_mode: 'Markdown' }); success++; } catch (e) {}
        }
        // Kirim ke semua grup terdaftar
        for (const gid of registeredGroups) {
            try { await ctx.telegram.sendMessage(gid, shareTemplate, { parse_mode: 'Markdown' }); success++; } catch (e) {}
        }

        ctx.reply(`✅ *PESAN TERKIRIM!*\nDisebarkan ke ${success} tujuan (User & Grup).`);

    } catch (e) {
        ctx.reply("❌ Error! Pastikan bot adalah Admin di Channel verifikasi.");
    }
});

// --- [ JASHER INFO MENU ] ---
bot.action('btn_jasher', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply(`
┏━━━━━━━◥◣◆◢◤━━━━━━━┓
    🌟  𝗔𝗟𝗟 𝗠𝗘𝗡𝗨 𝗦𝗛𝗔𝗥𝗘  🌟
┗━━━━━━━◥◣◆◢◤━━━━━━━┛

📌 /share [Teks Iklan]
- *Otomatis terkirim ke SEMUA user dan grup.*

⚠️ *SYARAT:*
1. Wajib Join: ${CHANNEL_URL}
2. Bot harus ada di 1 grup (Min 5 member).

━━━━━━━━━━━━━━━━━━━━━━`, { parse_mode: 'Markdown' });
});

// --- [ ADMIN COMMANDS ] ---
bot.command('addowner', checkOwner, (ctx) => {
    const id = ctx.message.text.split(" ")[1];
    if (id && !ownerUsers.includes(id)) {
        ownerUsers.push(id);
        saveJSON(ownerFile, ownerUsers);
        ctx.reply(`✅ ID ${id} berhasil menjadi Owner.`);
    }
});

bot.command('stats', checkOwner, (ctx) => {
    const ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
    ctx.reply(`📊 *SERVER STATS*\n\nRAM: ${ram} MB\nRuntime: ${runtime(process.uptime())}`, { parse_mode: 'Markdown' });
});

bot.launch().then(() => {
    console.clear();
    console.log(chalk.bold.cyan("XSANZ JASHER SYSTEM READY [CLEAN & BUG-FREE]"));
});
