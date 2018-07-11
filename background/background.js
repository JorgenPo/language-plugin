function saveDictionary(key, dictionary) {
    var dictionaryObject = {};
    dictionaryObject[key] = dictionary;

    return browser.storage.local.set(dictionaryObject);
}

// Message handler
async function onMessage(request, sender, sendResponce) {
    if (!request.command) {
        sendResponce({
            error: "true",
            message: "bad request"
        });
        return;
    }

    var result = {};
    switch (request.command) {
        case "saveDictionary":
            result = await saveDictionary(request.key, request.dictionary);
            break;
        default:
            sendResponce({
                error: "true",
                message: `unknown command "${request.command}"`
            });
            return;
    }

    sendResponce({
        error: "false", 
        result: result
    });
}

browser.runtime.onMessage.addListener(onMessage);

