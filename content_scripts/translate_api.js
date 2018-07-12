// This file contains all translation code

// v0.1 Yandex translate api
class YandexTranslator {
    constructor() {
        this.apiKey = "trnsl.1.1.20180711T161122Z.067469e513640613.bf1e590a05726b09b5b537df9f303454d815744c";
        this.apiUrl = "https://translate.yandex.net/api/v1.5/tr.json/";
    }

    async makeRequest(action, data) {
        var responce = {};
        try {
            responce = await $.ajax({
                url: this.apiUrl + action,
                method: "POST",
                data: data
            });
        } catch(e) {
            throw new Error(e);
        } 

        if (responce.code === 200) {
            return responce;
        } else {
            throw new Error(this.errorCodeToText(responce.code));
        }
    }

    async translate(text, fromLang, toLang) {
        const action = "translate";

        let data = {
            key: this.apiKey,
            text: text,
            lang: `${fromLang}-${toLang}`
        };

        try {
            var result = await this.makeRequest(action, data);
            return result.text[0];
        } catch(error) {
            throw new Error(error);
        }
    }

    async getTextLanguage(textToCheck) {
        const action = "detect";

        let data = {
            key: this.apiKey,
            text: textToCheck
        };

        try {
            var result = await this.makeRequest(action, data);
            return result.lang;
        } catch(error) {
            throw new Error(error);
        }
    }

    errorCodeToText(code) {
        switch(code) {
            case 200:
                return "Success";
            case 401:
                return "Wrong API Key";
            case 402:
                return "Api Key Blocked";
            case 404:
                return "Dayly limit exceeded";
            default: 
                return "Unknown error code: " + code;
        }
    }
}