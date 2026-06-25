interface API {
}
interface HTTP {
}
interface BOT {
}
interface TEMP {
}
interface USER {
}
interface FLEX {
}
interface Keyboard {
  /**
   * reply(button, options)
   * @param button - button
   * @param [options] - options
   * @returns any
   */
  reply(button: any, options?: any): any;
  /**
   * remove()
   * @returns any
   */
  remove(): any;
  /**
   * contact(text)
   * @param text - text
   * @returns any
   */
  contact(text: any): any;
  /**
   * location(text)
   * @param text - text
   * @returns any
   */
  location(text: any): any;
  /**
   * poll(text, type)
   * @param text - text
   * @param [type] - type
   * @returns any
   */
  poll(text: any, type?: any): any;
}

declare global {
  /**
   * sendMessage(text, options)
   * @param text - text
   * @param [options] - options
   * @returns any
   */
  var sendMessage: (text: any, options?: any) => any;
  /**
   * sendPhoto(photo, options)
   * @param photo - photo
   * @param [options] - options
   * @returns any
   */
  var sendPhoto: (photo: any, options?: any) => any;
  /**
   * sendVideo(video, options)
   * @param video - video
   * @param [options] - options
   * @returns any
   */
  var sendVideo: (video: any, options?: any) => any;
  /**
   * sendAudio(audio, options)
   * @param audio - audio
   * @param [options] - options
   * @returns any
   */
  var sendAudio: (audio: any, options?: any) => any;
  /**
   * sendVoice(voice, options)
   * @param voice - voice
   * @param [options] - options
   * @returns any
   */
  var sendVoice: (voice: any, options?: any) => any;
  /**
   * sendDocument(document, options)
   * @param document - document
   * @param [options] - options
   * @returns any
   */
  var sendDocument: (document: any, options?: any) => any;
  /**
   * sendSticker(sticker, options)
   * @param sticker - sticker
   * @param [options] - options
   * @returns any
   */
  var sendSticker: (sticker: any, options?: any) => any;
  /**
   * sendAnimation(animation, options)
   * @param animation - animation
   * @param [options] - options
   * @returns any
   */
  var sendAnimation: (animation: any, options?: any) => any;
  /**
   * sendLocation(lat, lng, options)
   * @param lat - lat
   * @param lng - lng
   * @param [options] - options
   * @returns any
   */
  var sendLocation: (lat: any, lng: any, options?: any) => any;
  /**
   * sendContact(phone, name, options)
   * @param phone - phone
   * @param name - name
   * @param [options] - options
   * @returns any
   */
  var sendContact: (phone: any, name: any, options?: any) => any;
  /**
   * sendPoll(question, opts, options)
   * @param question - question
   * @param opts - opts
   * @param [options] - options
   * @returns any
   */
  var sendPoll: (question: any, opts: any, options?: any) => any;
  /**
   * sendChatAction(action, options)
   * @param action - action
   * @param [options] - options
   * @returns any
   */
  var sendChatAction: (action: any, options?: any) => any;
  /**
   * sendReplyKeyboard(text, keyboardRows, parse, opts)
   * @param text - text
   * @param keyboardRows - keyboardRows
   * @param [parse] - parse
   * @param [opts] - opts
   * @returns any
   */
  var sendReplyKeyboard: (text: any, keyboardRows: any, parse?: any, opts?: any) => any;
  /**
   * removeKeyboard(text, parse)
   * @param text - text
   * @param [parse] - parse
   * @returns any
   */
  var removeKeyboard: (text: any, parse?: any) => any;
  /**
   * editMessage(messageId, text, options)
   * @param messageId - messageId
   * @param text - text
   * @param [options] - options
   * @returns any
   */
  var editMessage: (messageId: any, text: any, options?: any) => any;
  /**
   * editCaption(messageId, caption, options)
   * @param messageId - messageId
   * @param caption - caption
   * @param [options] - options
   * @returns any
   */
  var editCaption: (messageId: any, caption: any, options?: any) => any;
  /**
   * editMedia(messageId, media, options)
   * @param messageId - messageId
   * @param media - media
   * @param [options] - options
   * @returns any
   */
  var editMedia: (messageId: any, media: any, options?: any) => any;
  /**
   * editButton(messageId, buttons, options)
   * @param messageId - messageId
   * @param [buttons] - buttons
   * @param [options] - options
   * @returns any
   */
  var editButton: (messageId: any, buttons?: any, options?: any) => any;
  /**
   * editCallbackMessage(text, buttons, messageId)
   * @param text - text
   * @param [buttons] - buttons
   * @param [messageId] - messageId
   * @returns any
   */
  var editCallbackMessage: (text: any, buttons?: any, messageId?: any) => any;
  /**
   * deleteMessage(messageId, options)
   * @param messageId - messageId
   * @param [options] - options
   * @returns any
   */
  var deleteMessage: (messageId: any, options?: any) => any;
  /**
   * answerCallback(text, alert)
   * @param [text] - text
   * @param [alert] - alert
   * @returns any
   */
  var answerCallback: (text?: any, alert?: any) => any;
  /**
   * answerInlineQuery(results, opts)
   * @param results - results
   * @param [opts] - opts
   * @returns any
   */
  var answerInlineQuery: (results: any, opts?: any) => any;
  /**
   * forwardMessage(toChatId, messageId, options)
   * @param toChatId - toChatId
   * @param messageId - messageId
   * @param [options] - options
   * @returns any
   */
  var forwardMessage: (toChatId: any, messageId: any, options?: any) => any;
  /**
   * copyMessage(toChatId, messageId, options)
   * @param toChatId - toChatId
   * @param messageId - messageId
   * @param [options] - options
   * @returns any
   */
  var copyMessage: (toChatId: any, messageId: any, options?: any) => any;
  /**
   * pinMessage(messageId, options)
   * @param messageId - messageId
   * @param [options] - options
   * @returns any
   */
  var pinMessage: (messageId: any, options?: any) => any;
  /**
   * unpinMessage(options)
   * @param [options] - options
   * @returns any
   */
  var unpinMessage: (options?: any) => any;
  /**
   * broadcast(userIds, text, buttons, delayMs)
   * @param userIds - userIds
   * @param text - text
   * @param [buttons] - buttons
   * @param [delayMs] - delayMs
   * @returns Promise<any>
   */
  var broadcast: (userIds: any, text: any, buttons?: any, delayMs?: any) => Promise<any>;
  /**
   * runCommand(command, params)
   * @param command - command
   * @param [params] - params
   * @returns Promise<any>
   */
  var runCommand: (command: any, params?: any) => Promise<any>;
  /**
   * waitForAnswer(nextCommand, options)
   * @param nextCommand - nextCommand
   * @param [options] - options
   * @returns Promise<any>
   */
  var waitForAnswer: (nextCommand: any, options?: any) => Promise<any>;
  /**
   * clearWait()
   * @returns any
   */
  var clearWait: () => any;
  /**
   * setUserProperty(name, value)
   * @param name - name
   * @param value - value
   * @returns any
   */
  var setUserProperty: (name: any, value: any) => any;
  /**
   * getUserProperty(name)
   * @param name - name
   * @returns any
   */
  var getUserProperty: (name: any) => any;
  /**
   * deleteUserProperty(name)
   * @param name - name
   * @returns any
   */
  var deleteUserProperty: (name: any) => any;
  /**
   * setBotProperty(name, value)
   * @param name - name
   * @param value - value
   * @returns any
   */
  var setBotProperty: (name: any, value: any) => any;
  /**
   * getBotProperty(name)
   * @param name - name
   * @returns any
   */
  var getBotProperty: (name: any) => any;
  /**
   * getUserData()
   * @returns Promise<any>
   */
  var getUserData: () => Promise<any>;
  /**
   * setUserData(data)
   * @param data - data
   * @returns Promise<any>
   */
  var setUserData: (data: any) => Promise<any>;
  /**
   * updateUserData(fn)
   * @param fn - fn
   * @returns Promise<any>
   */
  var updateUserData: (fn: any) => Promise<any>;
  /**
   * reply(text, buttons)
   * @param text - text
   * @param [buttons] - buttons
   * @returns any
   */
  var reply: (text: any, buttons?: any) => any;
  /**
   * ask(question, nextCommand, options)
   * @param question - question
   * @param nextCommand - nextCommand
   * @param [options] - options
   * @returns Promise<any>
   */
  var ask: (question: any, nextCommand: any, options?: any) => Promise<any>;
  /**
   * tryOrNotify(fn, errorText)
   * @param fn - fn
   * @param [errorText] - errorText
   * @returns Promise<any>
   */
  var tryOrNotify: (fn: any, errorText?: any) => Promise<any>;
  /**
   * isAdmin()
   * @returns any
   */
  var isAdmin: () => any;
  /**
   * sleep(ms)
   * @param ms - ms
   * @returns any
   */
  var sleep: (ms: any) => any;
  var API: API;
  var FLEX: FLEX;
  var TEMP: TEMP;
  var HTTP: HTTP;
  var BOT: BOT;
  var USER: USER;
  var keyboard: Keyboard;
  var flex: any;
  var user: any;
  var chat: any;
  var message: any;
  var message_id: any;
  var reply_to_message_id: any;
  var command: any;
  var params: any;
  var request: any;
  var isCallback: any;
  var callbackData: any;
  var callbackQueryId: any;
  var callbackMessageHasMedia: any;
  var isInlineQuery: any;
  var inlineQuery: any;
  var inlineQueryId: any;
  var __router__: any;
}

export {};
