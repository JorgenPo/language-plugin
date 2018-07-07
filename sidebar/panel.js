
class Vocabulary {
    constructor() {
        this.updateWordList();
        browser.runtime.onMessage.addListener(this.handleEvents.bind(this));
    }

    handleEvents(request, sender, sendResponce) {
        if (!request.command) {
            sendResponce({result: "fail", message: "bad request"});
            return;
        }

        switch(request.command) {
            case "updateWordList":
                this.updateWordList();
            break;
            default:
                sendResponce({result: "fail", message: `unknown command "${request.command}"`});
                return;
        }
        
        sendResponce({result: "success"});
    }

    error(error) {
        console.error("yazik: ", error);
    }

    updateWordList() {
        var getDictionary = browser.storage.local.get("dictionary");

        let success = dictionary => {
            let words = dictionary.dictionary;
            this.renderWordList(words);
        };

        let failture = error => {
            this.error("Failed to get dictionary: " + error);
        };

        getDictionary.then(success, failture);
    }

    clearWordList() {
        const list = document.querySelector(".vocabulary-list");
        
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }
    }

    renderWordList(words) {
        const list = document.querySelector(".vocabulary-list");

        this.clearWordList();
        
        for (let word of words) {
            let li = document.createElement("li");
            li.textContent = word.text;
            list.appendChild(li);
        }
    }
}

(function() {
    var vocab = new Vocabulary();
})();