// ==UserScript==
// @name         HideYammerThreads
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Hide Yammer threads
// @author       Gregory-William FLAMANT
// @match        https://www.yammer.com/{MyOrganization}/
// ==/UserScript==

(function() {
    'use strict';

    setInterval(function() {
        let childToRemove = [];
        let threadListItems = document.getElementsByClassName('yj-thread-list-item');

        if(threadListItems !== undefined && threadListItems.length > 0) {
            const parentNode = threadListItems[0].parentElement;

            // Insert here the groups to ignore.
            const excludedThreads = ["Dev Group", "Group HR"];

            for(let thread of threadListItems) {
                const threadTextValue = thread.childNodes[0].outerText;
                const isExcludedThread = excludedThreads.find( excludedThread => threadTextValue.includes(excludedThread));

                if(isExcludedThread !== undefined) {
                    childToRemove.push(thread);
                }
            }

            for(let thread of childToRemove) {
                parentNode.removeChild(thread);
            }
        }
    }, 3000);
})();
