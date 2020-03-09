// ==UserScript==
// @name         MoarSecrets_TEST
// @namespace    http://tampermonkey.net/
// @version      2.7.5
// @author       Grégory-William Flamant
// @match        *://portal.azure.com/*
// @run-at document-end
// @grant        none
// ==/UserScript==

// SET THIS VARIABLE TO TRUE IF YOU WANT TO SEE MESSAGES IN CONSOLE
const DEBUG = false;

let currentInterval = null;
let secretsLoaded = false;
let retry = 0;

(function() {
    'use strict';
    startTimer(windowCheck, 1000);
})();

async function letsClick() {
    if($(".azc-grid-pageable-loadMoreContainer").is(":visible")) {
        if(DEBUG) console.log('I want to see moar secrets!');
        $(".azc-grid-pageable-loadMoreContainer").click();
        retry = 5;
    } else {
        if(retry == 5) {
            secretsLoaded = true;
            stopTimer(currentInterval);
            if(DEBUG) console.log('Secrets loaded!');
            if(DEBUG) console.log('Start listening url again...');
            startTimer(windowCheck, 1000);
            retry = 0;

            addSearchBar();
        } else {
            // To prevent the in-progress loader
            if(DEBUG) console.log("Let's retry before stopTime");
            await sleep(1000);
            retry +=1;
        }
    }
}

function windowCheck () {
    let currentLocation = window.location.href;
    let lastPart = currentLocation.substr(currentLocation.lastIndexOf('/') + 1);

    if (lastPart === "secrets" && !secretsLoaded) {
        stopTimer(currentInterval);
        startTimer(letsClick, 600);
    } else if(lastPart !== "secrets") {
        if(DEBUG) console.log('We are NOT on a secret page...');
        secretsLoaded = false;
        retry = 0;

        if($('div[id="searchKVContainer"]').length > 0) {
            if(DEBUG) console.log('Remove searchKV container');
            removeSearchBar();
        }
    } else {
        if(DEBUG) console.log('We are on a secret page and all secrets seems loaded...');
    }
}

const commandBar = '<div id="searchKVContainer" class="azc-formElementSubLabelContainer" style="display: -webkit-flex; -webkit-align-items:center;"><div class="azc-formElementContainer"><div class="fxc-base azc-control azc-editableControl azc-validatableControl azc-inputbox azc-textBox azc-validatableControl-none" data-control="true" data-editable="true" data-canfocus="true"><div class="azc-inputbox-wrapper azc-textBox-wrapper" tabindex="-1"><input id="searchKV" class="azc-input azc-formControl azc-validation-border" type="text" aria-multiline="false" placeholder="Filter by secret name..."><label class="fxs-hide-accessible-label" aria-atomic="true"></label></div></div></div><label class="azc-text-sublabel msportalfx-tooltip-overflow" data-bind="untrustedContent: $data" aria-hidden="true"></label></div></div>'

function addSearchBar() {
    if($('div[id="searchKVContainer"]').length > 0) {
        if(DEBUG) console.log(`Length of search KV Container : {$('div[id="searchKVContainer"]').length}`);
        removeSearchBar();
    }

    $('.fxs-commandBar > ul')
        .append(commandBar)
        .append('<a id="resultCount" style="display: -webkit-flex; -webkit-align-items:center;"></a>');

    $('#searchKV').on('keypress',function(e) {
        if(e.which == 13) {
            searchKV($(this).val());
        }
    });

}

function removeSearchBar() {
    if(DEBUG) console.log("Invoke removeSearchBar()");
    $('div[id="searchKVContainer"]').remove();
    $('#resultCount').remove();
}

function searchKV(valueToSearch) {
    if(DEBUG) console.log(`Value to search: {valueToSearch}`);
    if(valueToSearch === "") {
        $('.azc-grid-groupdata tr').show();
        displayResultsCounted(0);
    } else {
        let res = $('.azc-grid-groupdata tr td:first-child:contains("'+valueToSearch+'")').parent();
        res.show();
        displayResultsCounted(res.length);
        $('.azc-grid-groupdata tr td:first-child:not(:contains("'+valueToSearch+'"))').parent().hide();
    }
}

function displayResultsCounted(count) {
    if(count === 0) {
        $("#resultCount").text("");
    } else {
        $("#resultCount").text(`${count} result(s)`);
    }
}

/*
*   UTILS
*/

// TODO Use space as separator to search
// Jquery contains now uppercase values
$.expr[":"].contains = $.expr.createPseudo(function(arg) {
    return function( elem ) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});

function startTimer(fn, time) {
    currentInterval = setInterval(fn, time);
}

function stopTimer(fn) {
    clearInterval(fn);
    currentInterval = null;
}

function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
