class Vocabulary {
    constructor() {
        this.windowId = 0;

        browser.windows.getCurrent({populate: true}).then(windowInfo => {
            this.windowId = windowInfo.id;
            this.updateWordList();
        });
        
        browser.runtime.onMessage.addListener(this.handleEvents.bind(this));
    }

    handleEvents(request, sender, sendResponce) {
        if (!request.command) {
            sendResponce({
                result: "fail",
                message: "bad request"
            });
            return;
        }

        switch (request.command) {
            case "updateWordList":
                this.updateWordList(request.dictionaryKey);
                break;
            default:
                sendResponce({
                    result: "fail",
                    message: `unknown command "${request.command}"`
                });
                return;
        }

        sendResponce({
            result: "success"
        });
    }

    error(error) {
        console.error("yazik: ", error);
    }

    async getActiveTabs() {
        return browser.tabs.query({
            windowId: this.windowId,
            active: true
        });
    }

    async updateWordList(key) {
        if (!key) {
            let tabs = await this.getActiveTabs();
            key = tabs[0].url + ".dictionary";
            console.log(key);
        }

        var getDictionary = browser.storage.local.get(key);

        let success = dictionary => {
            let words = dictionary[key];
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

(function () {
    var vocab = new Vocabulary();
})();