// Document text metrics and manipulations

class TextManager {
    constructor() {
        this.originalDoc = document.body.innerHTML;
    }

    _getWrappedText(text, translated) {
        return `<jqElement class='yazik-dict-word' translated='${translated}'>${text}</jqElement>`;
    }

    // Highlight all words in array in document body
    highlightWords(words) {
        var doc = this.originalDoc;

        for (let word of words) {
            let text = word.text;

            let regexp = new RegExp(`\\b(${text})\\b`, "gi");

            doc = doc
                .replace(regexp, this._getWrappedText(text, word.translated));
        }

        document.body.innerHTML = doc;

        this._addHandlers();
    }

    _showOriginalText(jqElement) {
        jqElement.text(jqElement.attr("original"));
        jqElement.removeClass("translated");
    }

    _showTranslatedText(jqElement) {
        jqElement.attr("original", jqElement.text());
        jqElement.text(jqElement.attr("translated"));
        jqElement.addClass("translated");
    }

    _addHandlers() {
        let self = this;
        $(".yazik-dict-word").mouseover(function() {
            let span = $(this);

            if (!span.hasClass("translated")) {
                self._showTranslatedText(span);
            }
        });

        $(".yazik-dict-word").mouseout(function() {
            let span = $(this);

            if (span.hasClass("translated")) {
                self._showOriginalText(span);
            }
        });
    }
}