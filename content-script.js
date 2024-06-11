"use strict";


browser.runtime.onMessage.addListener(request => {
    return Promise.resolve({response: window.getSelection().toString().trim()});
});

document.addEventListener("selectionchange", function() {
    let selectedText = window.getSelection().toString();
    sendNumber(selectedText);
});

document.addEventListener("click", function(event) {
    if (event.target.matches('.phone-link')) {
        const phoneNumber = event.target.innerText.trim();
        browser.runtime.sendMessage({ type: 'PHONE_NUMBER_CLICKED', number: phoneNumber });
        sendNumber(phoneNumber);
    }
});

document.addEventListener("select", function(e){
    var selectedText = e.target.value.substring(e.target.selectionStart, e.target.selectionEnd);
    sendNumber(selectedText);
});

const detectedPhoneNumbers = new Set();

// Fonction pour surligner les numéros de téléphone
async function highlightPhoneNumbers(element) {
    const phoneRegex = /(\d{2} ){4}\d{2}|\d{10}/g;
    if (element.nodeType === Node.TEXT_NODE && phoneRegex.test(element.textContent)) {
        const phoneNumbers = element.textContent.match(phoneRegex);
        if(phoneNumbers) {
            phoneNumbers.forEach(phoneNumber => {
                const onlyNumber = phoneNumber.replace(/\s/g, '');
                // Vérifiez si le numéro a déjà été détecté
                if (!detectedPhoneNumbers.has(onlyNumber)) {
                    console.log('Phone number found:', phoneNumber);
                    const highlightedNumber = `<span style="background-color: yellow;"><a class="phone-link">${onlyNumber}</a>📞</span>`;
                    const newNode = document.createElement('span');
                    newNode.innerHTML = element.textContent.replace(new RegExp(phoneNumber, 'g'), highlightedNumber);
                    element.parentNode.replaceChild(newNode, element);
                    
                    // Ajoutez le numéro au Set
                    detectedPhoneNumbers.add(onlyNumber);
                }
            }); 
        }
    } else if (element.nodeType === Node.ELEMENT_NODE) {
        for (let i = 0; i < element.childNodes.length; i++) {
            await highlightPhoneNumbers(element.childNodes[i]);
        }
    } else if (element.tagName === 'IFRAME') {
        browser.runtime.sendMessage({type: 'executeScriptInIframe', iframeSrc: element.src});
    }
}

window.addEventListener('load', (event) => {
    highlightPhoneNumbers(document.body);
});

// Créer une instance de l'observateur liée à la fonction de rappel
const observer = new MutationObserver((mutationsList, observer) => {
    // Utiliser la même fonction de rappel pour les mutations du DOM
    highlightPhoneNumbers(document.body);
});

// Commencer à observer le document avec la configuration appropriée
observer.observe(document.body, { childList: true, subtree: true });

// Fonction pour envoyer le numéro sélectionné
function sendNumber(selectedText) {
    console.log('Selected text is ' + selectedText);
    if (hasNumbers(selectedText.toString())) {
        var selectedNumber = selectedText.toString().trim().replace(/\+/g, "00").replace(/\D/g,'');
        console.log('Selected number is ' + selectedNumber);
    
        var sending = browser.runtime.sendMessage({
          selectedNumber: selectedNumber,
          action: "selectionText"
        });  
    }
}

// Fonction pour vérifier si une chaîne contient des chiffres
function hasNumbers(string) {
    return /\d/.test(string);
}

// Ajout d'un gestionnaire d'événements de clic aux éléments contenant les numéros de téléphone
//document.addEventListener('click', function(event) {
    // Vérifier si l'élément cliqué est un lien contenant un numéro de téléphone
//    if (event.target.matches('a[href^="tel:"]')) {
//        event.preventDefault(); // Empêcher le lien de s'ouvrir
//        var phoneNumber = event.target.innerText.trim(); // Récupérer le numéro de téléphone
//        console.log("Phone number clicked:", phoneNumber);
        // Mettre le numéro de téléphone dans l'élément d'entrée
//        document.querySelector('.number').value = phoneNumber;
//        // Déclencher la fonction pour appeler le numéro
        //callNumber();
//    }
//});

//document.addEventListener('click', function(event) {
    //if (event.target.matches('.call-link')) {
      //  event.preventDefault();
     //   const phoneNumber = event.target.dataset.number;
   //     window.postMessage({ type: 'CALL_NUMBER', number: phoneNumber }, '*');
 //   }
//});

//window.addEventListener('message', function(event) {
   // if (event.data.type === 'CALL_NUMBER') {
 //       browser.runtime.sendMessage({ type: 'CALL_NUMBER', number: event.data.number });
//    }
//});

// Ajout d'une fonction pour appeler le numéro de téléphone
//function callNumber() {
//    var numberInput = document.querySelector('.number');
//    if (hasNumbers(numberInput.value.toString().trim())) {
//        var selectedNumber = numberInput.value.trim().replace(/\+/g, "00").replace(/\D/g, '');
//        console.log("Calling number:", selectedNumber);
//        // Votre logique d'appel du numéro ici
//        alert("Simulated call to: " + selectedNumber);
//    }
//}
 