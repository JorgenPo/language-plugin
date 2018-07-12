class Vocabulary {
    constructor() {
        this.windowId = 0;

        browser.windows.getCurrent({populate: true}).then(windowInfo => {
            this.windowId = windowInfo.id;
            this.updateWordList();
        });
        
        browser.runtime.onMessage.addListener(this.handleEvents.bind(this));

        this.addListeners();
    }

    async addListeners() {
        var emptyButton = document.querySelector(".vocabulary-empty");
        emptyButton.onclick = async () => {
            this.dictionary = [];

            let tabs = await this.getActiveTabs();
            let key = tabs[0].url + ".dictionary";

            let message = {
                command: "saveDictionary", 
                key: key,
                dictionary: this.dictionary
            };

            browser.runtime.sendMessage(message).then(responce => {
                this.updateWordList();
            });
        };
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
        const tableBody = document.querySelector(".vocabulary-table-body");

        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
        }
    }

    renderWordList(words) {
        const tableBody = document.querySelector(".vocabulary-table-body");

        this.clearWordList();

        for (let word of words) {
            let tr = document.createElement("tr");
            tr.className = "vocabulary-table-element";
            tr.id = `vocabulary-${word.id}`;

            tr.innerHTML = `<td>${word.text}</td><td>${word.translated}</td>`;

            tableBody.appendChild(tr);
        }
    }
}

(function () {
    var vocab = new Vocabulary();
})();