import { Telegraf } from 'telegraf';
import axios from 'axios';
import * as fs from 'fs';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command('start', (ctx) => {
  ctx.reply('Welcome! Use /backup <blog_url> to get your Blogger .xml file.');
});

bot.command('backup', async (ctx) => {
  const args = ctx.message.text.split(' ');
  const blogUrl = args[1];

  if (!blogUrl) {
    return ctx.reply('Please provide a Blogger blog URL.\nExample: /backup https://yourblog.blogspot.com');
  }

  const feedUrl = `${blogUrl}/feeds/posts/default`;

  try {
    const response = await axios.get(feedUrl);
    const xmlData = response.data;

    const filePath = '/tmp/blog.xml';
    fs.writeFileSync(filePath, xmlData);

    await ctx.replyWithDocument({ source: filePath, filename: 'blog.xml' });

  } catch (error) {
    console.error('Error:', error.message);
    ctx.reply('Failed to fetch Blogger feed. Check the blog URL.');
  }
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
  } else {
    res.status(200).send('Bot running...');
  }
}
