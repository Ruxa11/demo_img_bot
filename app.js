const TelegramBot = require('node-telegram-bot-api')
const gis = require('g-i-s')
const axios = require('axios')

const messages = require('./messages.json')

const token = '1600341732:AAFb1tyWcIcKeaCo20nN5R-pbISAjCvOleA'

const bot = new TelegramBot(token, {polling: true})

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id
    if (msg.data === 'search') {
        bot.sendMessage(chatId, messages.start, {parse_mode: 'HTML'})
    }
  }) 

  bot.on('callback_query', (msg) => {
    const chatId = msg.message.chat.id
    bot.sendMessage(chatId, messages.start, {parse_mode: 'HTML'})
  })

  bot.on('text', (msg) => {
    const chatId = msg.chat.id
    if (!msg.text.includes('start')){
        gis(msg.text, async (error, results) => {
            if (error) console.log(error)
            const filter = results.filter(element => element.width > 700 && element.url.endsWith('.jpg') || element.width > 700 && element.url.endsWith('.jpeg') || element.width > 700 && element.url.endsWith('.png'))
            const imagesLinkArray = []
            const text = 'Изображение по данному запросу не найдены'
            if (filter.length !== 0) {
                for (let i = 0; imagesLinkArray.length < 10; i +=1) {
                    bot.sendChatAction(chatId, 'upload_photo')
                    await axios({url: filter[i].url, method: 'GET', timeout: 500}).then(response => {
                        imagesLinkArray.push({ type: 'photo', media: response.config.url })
                    }).catch(err => {})
                }
            }else{
                imagesLinkArray.push(text)
            }

            Promise.all(imagesLinkArray).then(async result => {
                if (!result.includes(text)) {
                    await bot.sendMediaGroup(chatId, result)
                } else {
                    await bot.sendMessage(chatId, text)
                }
                bot.sendMessage(chatId, messages.newSearch, {reply_markup: {
                    inline_keyboard: [[{text: '🔎 Поиск', callback_data: 'search'}]]
                }})
            })
        })
    }
  })