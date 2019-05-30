// ==UserScript==
// @name         MoarSecrets
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  try to take over the world!
// @author       Grégory-William Flamant
// @match        *://portal.azure.com/*
// @grant        none
// ==/UserScript==

// SET THIS VARIABLE TO TRUE IF YOU WANT TO SEE MESSAGES IN CONSOLE
let DEBUG = true;
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

function startTimer(fn, time) {
    currentInterval = setInterval(fn, time);
}

function stopTimer(fn) {
    clearInterval(fn);
    currentInterval = null;
}

function windowCheck () {
    let currentLocation = window.location.href;
    let lastPart = currentLocation.substr(currentLocation.lastIndexOf('/') + 1);

    if (lastPart === "secrets" && !secretsLoaded) {
        stopTimer(currentInterval);
        startTimer(letsClick, 600);
    } else if(lastPart !== "secrets") {
        secretsLoaded = false;
        retry = 0;
    } else {
        if(DEBUG) console.log('We are on a secret page and all secrets seems loaded...');
    }
}

function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function addSearchBar() {
    $('.fxs-commandBar > ul').append(commandBar);
    $('.fxs-commandBar > ul').append('<a id="resultCount"></a>');

    $('#searchKV').on('keypress',function(e) {
        if(e.which == 13) {
            searchKV($(this).val());
        }
    });
}

const commandBar = '<div class="azc-formElementSubLabelContainer"><div class="azc-formElementContainer"><div class="fxc-base azc-control azc-editableControl azc-validatableControl azc-inputbox azc-textBox azc-validatableControl-none" data-control="true" data-editable="true" data-canfocus="true"><div class="azc-inputbox-wrapper azc-textBox-wrapper" data-bind="css:{&quot;fxc-has-search-icon&quot;: data.showSearchIcon}" tabindex="-1"><input id="searchKV" class="azc-input azc-formControl azc-validation-border" type="text" aria-multiline="false" placeholder="Search keyvault"><label class="fxs-hide-accessible-label" aria-atomic="true"></label></div></div></div><label class="azc-text-sublabel msportalfx-tooltip-overflow" data-bind="untrustedContent: $data" aria-hidden="true"></label></div></div>'

$.expr[":"].contains = $.expr.createPseudo(function(arg) {
    return function( elem ) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});

function searchKV(valueToSearch) {
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