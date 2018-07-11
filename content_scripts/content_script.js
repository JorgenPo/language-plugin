
class Yazik {
    constructor() {
        this.log("Starting extension");

        this.dictionary = [];

        this.loadPageDictionary();
        this.addHandlers();
    }

    log(message) {
        console.log("yazik: " + message);
    }

    error(error) {
        console.error("yazik: error: " + error);
    }

    getWrappedText(text) {
        return `<span class='yazik-dict-word'>${text}</span>`;
    }

    highlightWords() {
        let bodyText = document.body.innerHTML;

        for (let word of this.dictionary) {
            let text = word.text;

            let regexp = new RegExp(`\\b(${text})\\b`, "gi");

            bodyText = bodyText
                .replace(regexp, this.getWrappedText(text));
        }

        document.body.innerHTML = bodyText;
    }

    // Loads local storage browser dictionary
    loadPageDictionary() {
        const url = document.location.href;
        const dictionaryKey = `${url}.dictionary`;

        browser.storage.local.get(dictionaryKey).then(dictionary => {
            if (!dictionary[dictionaryKey] || dictionary[dictionaryKey].length === undefined) {
                this.log(`Dictionary not found`);
                return;
            }

            this.dictionary = dictionary[dictionaryKey];
            this.log(`Dictionary loaded (${this.dictionary.length} words)`);

            this.highlightWords();
        });
    }

    // Set up double click handlers
    addHandlers() {
        this.onDoubleClick = this.onDoubleClick.bind(this);
        document.addEventListener("dblclick", this.onDoubleClick);
    }
    
    onDoubleClick(event) {
        let selection = window.getSelection().toString();

        if (selection.length > 0) {
            if (!this.isNewWord(selection)) {
                // TODO: handle this gracefuly
                return;
            }

            this.handleNewWord(selection);
        }
    }

    saveDictionary() {
        const url = document.location.href;
        let key = `${url}.dictionary`;

        let message = {
            command: "saveDictionary", 
            key: key,
            dictionary: this.dictionary
        };

        return browser.runtime.sendMessage(message);
    }

    // Check if user already studying this word
    isNewWord(word) {
        for (let wordObj of this.dictionary) {
            if (wordObj.text === word) {
                return false;
            }
        }

        return true;
    }


    // Add new word to the dictionary
    handleNewWord(word) {
        var saved = () => {
            const url = document.location.href;
            const dictionaryKey = `${url}.dictionary`;

            this.log(`Dictionary updated. Dictionary length = ${this.dictionary.length}`);
            let sendMessage = browser.runtime.sendMessage({command: "updateWordList", dictionaryKey: dictionaryKey});
            sendMessage.then(responce => {
                this.highlightWords();
            }, error => {this.error(error)});
        };

        var fail = (error) => {
            this.error(`Failed to update dictionary: ${error}`);
        };

        this.dictionary.push({text: word});
        this.saveDictionary().then(saved, fail);
    }
}

(function() {
    const yazik = new Yazik();
})();