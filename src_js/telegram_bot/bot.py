from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, MessageHandler, filters
from telegram import InlineKeyboardButton, InlineKeyboardMarkup

key = '7031960302:AAGZULaAsrqjOryNHDy0XvWxTSeJqEVyCQw'
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    '''响应start命令'''
    text = 'Hello, free pay'
    keyboard = [
        [InlineKeyboardButton("enter", url="https://t.me/fpayfi_bot/freepay")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await context.bot.send_message(chat_id=update.effective_chat.id, text=text, reply_markup=reply_markup)

async def unknown(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = 'Hello, free pay'
    keyboard = [
        [InlineKeyboardButton("enter", url="https://t.me/fpayfi_bot/freepay")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await context.bot.send_message(chat_id=update.effective_chat.id, text=text, reply_markup=reply_markup)

start_handler = CommandHandler('start', start)
unknown_handler = MessageHandler(filters.COMMAND, unknown)

# 构建 bot
TOKEN= key
application = ApplicationBuilder().token(TOKEN).build()
# 注册 handler
application.add_handler(start_handler)
application.add_handler(unknown_handler)
# run!
application.run_polling()