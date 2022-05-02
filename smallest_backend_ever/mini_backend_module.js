let jsonFromServer = {};
let BASE_SERVER_URL;

//window.onload = async function() {    // bei mir nicht nötig, weil ES6-Module immer
//}                                     // warten, bis das Dokument geladen wurde


export const backend = {                // hier wird das komplette JSON
    setItem: function(key, item) {      // inkl. aller Schlüssel geschrieben
        jsonFromServer[key] = item;     // nachdem ein Schlüssel hinzugefügt
        return saveJSONToServer();      // oder aktualisiert wurde
    },
    getItem: function(key) {            // hier wird einfach nur auf ein
        if (!jsonFromServer[key]) {     // Element im JSON zugegriffen
            return null;                // -> kein Server-Zugriff
        }
        return jsonFromServer[key];
    },
    deleteItem: function(key) {         // hier wird das komplette JSON inkl. aller
        delete jsonFromServer[key];     // Schlüssel geschrieben nachdem ein Schlüssel
        return saveJSONToServer();      // aus dem JSON gelöscht wurde
    }
};


export async function downloadFromServer() {
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