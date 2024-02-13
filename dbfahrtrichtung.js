function waitForElements(selector, callback) {
    const intervalId = setInterval(() => {
        const elements = document.querySelectorAll(selector);
        if (elements.length) {
            clearInterval(intervalId);
            callback(elements);
        }
    }, 100);
}

function addZugnummerLink(zugnummerElement, fahrt, jahr) {
    const zugnummerText = zugnummerElement.getAttribute('transport-text');

    if (!document.getElementById('fahrtrichtungsContainer_' + zugnummerText)) {

        if (zugnummerText) {
            let zugnummer = zugnummerText.replace(/\D/g, '');

            if (zugnummer.length === 3) {
                zugnummer = "0" + zugnummer;
            } else if (zugnummer.length === 2) {
                zugnummer = "00" + zugnummer;
            } else if (zugnummer.length === 1) {
                zugnummer = "000" + zugnummer;
            }

            let searchUrl = `https://www.fernbahn.de/datenbank/suche/?zug_id=${encodeURIComponent(jahr)}010${encodeURIComponent(zugnummer)}#sd-reihungen`;


            let headingContainer = document.createElement('div');
            headingContainer.style.display = "flex";
            headingContainer.style.flexDirection = "row";
            headingContainer.style.gap = "5px";
            headingContainer.style.alignItems = "center";
            headingContainer.style.marginBottom = "5px";
            headingContainer.style.borderBottom = "1px solid black";
            headingContainer.style.width = "100%";
            headingContainer.style.height = "100%";
            headingContainer.style.padding = "5px";


            let headingHeader = document.createElement('h3');
            headingHeader.textContent = `DB Fahrtrichtung (Beta)`;
            headingHeader.style.fontSize = "1em";
            headingHeader.style.color = "black";
            headingHeader.style.margin = "0";
            headingHeader.style.userSelect = "none";

            let iconElement = document.createElement('img');
            iconElement.src = chrome.runtime.getURL('icons/dbfahrtrichtung.svg');
            iconElement.style.width = "20px";
            iconElement.style.height = "20px";
            iconElement.style.userSelect = "none";

            headingContainer.appendChild(iconElement);
            headingContainer.appendChild(headingHeader);


            let linkElement = document.createElement('a');
            linkElement.href = searchUrl;
            linkElement.textContent = `Fahrtrichtung von ${zugnummerText}`;
            linkElement.target = "_blank";
            linkElement.style.color = "#ec0016";
            linkElement.style.fontWeight = "bold";
            linkElement.style.userSelect = "none";

            let helpElement = document.createElement('a');
            helpElement.href = "https://cd36.notion.site/Anleitung-und-Hilfe-fa9c11930c104df481ae5f6d7d4d3d36?pvs=4";
            helpElement.textContent = "Anleitung & Hilfe";
            helpElement.target = "_blank";
            helpElement.style.color = "black";
            helpElement.style.fontWeight = "bold";
            helpElement.style.userSelect = "none";

            let containerElement = document.createElement('div');
            containerElement.style.display = "flex";
            containerElement.style.flexDirection = "column";
            containerElement.style.marginTop = "5px";
            containerElement.style.border = "1px solid black";
            containerElement.style.padding = "5px";
            containerElement.style.borderRadius = "5px";
            containerElement.style.backgroundColor = "#f0f3f5";
            containerElement.style.width = "100%";


            containerElement.appendChild(headingContainer);
            containerElement.appendChild(linkElement);
            containerElement.appendChild(helpElement);

            
            containerElement.id = "fahrtrichtungsContainer_" + zugnummerText;



            let buttonWrapper = fahrt.querySelector('._gsdButtonWrapper');

            if (buttonWrapper) {
                buttonWrapper.style.display = "flex";
                buttonWrapper.style.flexDirection = "column";

                buttonWrapper.appendChild(containerElement);

            } else {
                console.log('Möglicherweise ist für folgende Fahrt keine Sitzplatzreservierung möglich: ', zugnummerElement);
            }
        }
    }
}


function setupNavigationObserver() {
    let lastUrl = location.href; // Speichere die aktuelle URL
    new MutationObserver(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            console.log('URL geändert von', lastUrl, 'zu', currentUrl);
            lastUrl = currentUrl;
            // Rufe deine Hauptfunktion erneut auf, um den Prozess zu starten
            main();
        }
    }).observe(document, { subtree: true, childList: true });
}




function main() {
    console.log('DOM loaded or URL changed');

    // Setze hier den gesamten Code ein, der bei einem Seitenaufruf oder einer URL-Änderung ausgeführt werden soll
    waitForElements('.platzreservierungAbschnitt', function (fahrten) {
        const jahr = document.querySelector('.platzreservierungen-fahrtrichtung__header-date')?.textContent.split(' ')[3] || new Date().getFullYear();

        fahrten.forEach(function (fahrt) {
            const zugnummerElement = fahrt.querySelector('.test-transport-chip');

            if (zugnummerElement && zugnummerElement.getAttribute('transport-text')) {
                addZugnummerLink(zugnummerElement, fahrt, jahr);
            } else if (zugnummerElement) {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'transport-text') {
                            addZugnummerLink(zugnummerElement, fahrt, jahr);
                            observer.disconnect();
                        }
                    });
                });

                observer.observe(zugnummerElement, {
                    attributes: true
                });
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', main);
setupNavigationObserver();

