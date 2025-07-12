import { Telegraf } from 'telegraf';
import axios from 'axios';
import * as fs from 'fs';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command('start', (ctx) => {
  ctx.reply('👋 Welcome! Use /backup <blog_url> to download the Blogger XML file.\n\nExample:\n/backup https://yourblog.blogspot.com');
});

bot.command('backup', async (ctx) => {
  const args = ctx.message.text.split(' ');
  const blogUrl = args[1];

  if (!blogUrl) {
    return ctx.reply('❌ Please provide a Blogger blog URL.\n\nExample:\n/backup https://yourblog.blogspot.com');
  }

  const feedUrl = `${blogUrl}/feeds/posts/default`;

  try {
    const response = await axios.get(feedUrl);
    const xmlData = response.data;

    // Extract blog name from URL
    const blogName = blogUrl
      .replace(/^https?:\/\//, '') // remove http:// or https://
      .replace(/\/$/, '')          // remove trailing slash
      .split('.')[0];              // take first part before .blogspot.com

    const filePath = `/tmp/${blogName}.xml`;

    // Save XML data to file
    fs.writeFileSync(filePath, xmlData);

    // Send file as document
    await ctx.replyWithDocument({
      source: filePath,
      filename: `${blogName}.xml`
    });

  } catch (error) {
    console.error('❌ Error fetching blog feed:', error.message);
    ctx.reply('⚠️ Failed to fetch Blogger feed. Please check the URL and try again.');
  }
});

// Vercel handler
export default async function handler(req, res) {
  if (req.method === 'POST') {
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
  } else {
    res.status(200).send('Bot running...');
  }
}
