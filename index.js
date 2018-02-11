const TelegramBot = require('node-telegram-bot-api')

const request = require('request')

const fs =require('fs')

const _ = require('lodash')

const TOKEN = '533411783:AAHehKw6oOspSrzDUXvrRHIYlGjmXTicO4U'

const bot = new TelegramBot(TOKEN, {
    polling: true
})

const KB = {
    currency: 'Currency',
    back: 'Back',
    picture: 'Pictures',
    object1: 'Object1',
    object2: 'Object2'
}

const PicScrs =     {
    [KB.object1]: [
        'car1.jpg',
        'obj1.jpg'
    ],
    [KB.object2]: [
        'obj2.jpg',
        'obj3.jpg',
        'obj4.jpg',
        'obj5.jpg',
        'obj6.jpg',
        'obj7.jpg'
    ]
}

bot.onText(/\/start/, msg => {
    sendGreeting(msg)
})

bot.on('message', msg=> {
    switch (msg.text) {
case KB.picture:
    sendPictureScreen(msg.chat.id)
    break
case KB.currency:
    sendCurrencyScreen(msg.chat.id)
    break
case KB.back:
    sendGreeting(msg, false)
    break
case KB.object1:
case KB.object2:
    sendPictureByName(msg.chat.id, msg.text)
    break

}
})

bot.on('callback_query', query => {
    // console.log(JSON.stringify(query, null, 2 ))

    const base = query.data

    const symbol = 'RUB'

    bot.answerCallbackQuery({
    callback_query_id: query.id,
    text: `You have chosen ${base}`
})

request(`http://api.fixer.io/latest?symbols=${symbol}&base=${base}`,(error, response, body) => {

    if (error) throw new Error(error)

    if (response.statusCode === 200) {

    const currencyData = JSON.parse(body)

    //console.log(currencyData)

    const html = `<b>1 ${base}</b> -  <em>${currencyData.rates[symbol]} ${symbol}</em>`
    bot.sendMessage(query.message.chat.id, html, {
        parse_mode: 'HTML'
    })
}
})
})
function sendPictureScreen(chatID) {
    bot.sendMessage(chatID, 'Type of picture', {
        reply_markup: {
            keyboard: [
                [KB.object1, KB.object2],
                [KB.back]
            ]
        }
    })
}

function sendGreeting(msg, sayHello = true) {
    const text = sayHello
        ?`Hello, ${msg.from.first_name}\nWhat do you want to do?`
        :`What do you want to do?`

    bot.sendMessage(msg.chat.id, text, {
        reply_markup: {
            keyboard: [
                [KB.currency, KB.picture]
            ]
        }
    })
}

function sendPictureByName(chatID, picName) {
    const srcs = PicScrs[picName]

    src = srcs[_.random(0,srcs.length - 1)]

    bot.sendMessage(chatID,`Loading...`)

    fs.readFile(`${__dirname}/image/${src}`,(error,picture) => {
        if (error) throw new Error(error)

        bot.sendPhoto(chatID, picture).then (() => {
        bot.sendMessage(chatID,`Sent`)
})

})
}

function sendCurrencyScreen(chatID) {

    bot.sendMessage(chatID, `Choose currency:`, {
        reply_markup:{
            inline_keyboard: [
                [
                    {
                        text:'Dollar',
                        callback_data:'USD'
                    }
                ],
                [{
                    text:'Euro',
                    callback_data:'EUR'
                }]
            ]
        }
    })

}