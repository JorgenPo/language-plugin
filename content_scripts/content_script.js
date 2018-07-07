
class Yazik {
    constructor() {
        this.log("Starting extension");

        this.dictionary = [];

        this.loadDictionary();
        this.addHandlers();
    }

    log(message) {
        console.log("yazik: " + message);
    }

    error(error) {
        console.error("yazik: error: " + error);
    }

    // Loads local storage browser dictionary
    loadDictionary() {
        browser.storage.local.get("dictionary").then(dictionary => {
            if (dictionary.dictionary.length === undefined) {
                this.log(`Dictionary not found`);
                return;
            }

            this.dictionary = dictionary.dictionary;
            this.log(`Dictionary loaded (${this.dictionary.length} words)`);
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
        var dictionary = this.dictionary;
        return browser.storage.local.set({dictionary: this.dictionary});
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
            this.log(`Dictionary updated. Dictionary length = ${this.dictionary.length}`);
            let sendMessage = browser.runtime.sendMessage({command: "updateWordList"});
            sendMessage.then(responce => {}, error => {this.error(error)});
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