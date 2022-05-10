let jsonFromServer = {};
let transactionStarted = false;
let BASE_SERVER_URL;

//window.onload = async function() {    // bei mir nicht nötig, weil ES6-Module immer
//}                                     // warten, bis das Dokument geladen wurde


export const backend = {
    startTransaction: function() {               // start transaction processing. The data will be written to the server if
        return transactionStarted = true;        // a commit is issued or restored from the server in case of a rollback 
    },
    commit: function() {                                            // write data to the server
        return (transactionStarted) ? saveJSONToServer() : false;   // and stop transaction processing
    },
    rollback: function() {                                          // restore the data from the server
        return (transactionStarted) ? downloadFromServer() : false; // and stop transaction processing
    },
    setItem: function(key, item) {                                  // hier wird das komplette JSON inkl. aller Schlüssel
        jsonFromServer[key] = item;                                 // geschrieben, nachdem ein Schlüssel hinzugefügt
        return (transactionStarted) ? true : saveJSONToServer();    // oder aktualisiert wurde
    },
    getItem: function(key) {                                        // hier wird einfach nur auf ein
        if (!jsonFromServer[key]) {                                 // Element im JSON zugegriffen
            return null;                                            // -> kein Server-Zugriff
        }
        return jsonFromServer[key];
    },
    deleteItem: function(key) {                                     // hier wird das komplette JSON inkl. aller
        delete jsonFromServer[key];                                 // Schlüssel geschrieben nachdem ein Schlüssel
        return (transactionStarted) ? true:  saveJSONToServer();    // aus dem JSON gelöscht wurde
    }
};


export async function downloadFromServer() {
    transactionStarted = false;
    let result = await loadJSONFromServer();    // funktion für download aller Daten
    jsonFromServer = JSON.parse(result);
    console.log(Object.keys(jsonFromServer).length + ' keys Loaded\n');
}


export function setURL(url) {
    BASE_SERVER_URL = url;
}

/**
 * Loads a JSON or JSON Array to the Server
 * payload {JSON | Array} - The payload you want to store
 */

async function loadJSONFromServer() {
    let response = await fetch(BASE_SERVER_URL + '/nocors.php?json=database&noache=' + (new Date().getTime()));
    return await response.text();

}

/**
 * Saves a JSON or JSON Array to the Server
 */
function saveJSONToServer() {
    transactionStarted = false; 
    return new Promise(function(resolve, reject) {
        let xhttp = new XMLHttpRequest();
        let proxy = determineProxySettings();
        let serverURL = proxy + BASE_SERVER_URL + '/save_json.php';
        xhttp.open('POST', serverURL);

        xhttp.onreadystatechange = function(oEvent) {
            if (xhttp.readyState === 4) {
                if (xhttp.status >= 200 && xhttp.status <= 399) {
                    resolve(xhttp.responseText);
                } else {
                    reject(xhttp.statusText);
                }
            }
        };

        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp.send(JSON.stringify(jsonFromServer));         // hier werden alle Daten geschrieben

    });
}


function determineProxySettings() {
    return '';
}

export { jsonFromServer };