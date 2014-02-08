/**
 * Copyright 2011 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @author opensource@google.com
 * @license Apache License, Version 2.0.
 */

'use strict';

// Constants.
var RELOCATE_COOLDOWN_PERIOD_MS = 400;
var X_KEYCODE = 77;

// Global variables.
var queryEl = document.getElementById('query');
var labelEl = document.getElementById('label');
var queryResults;
var currentURL;

// Used by handleMouseMove() to enforce a cooldown period on relocate.
var mostRecentRelocateTimeInMs = 0;

var evaluateQuery = function() {
  var request = {
    'type': 'evaluate',
    'query': queryEl.value
  };
  chrome.extension.sendMessage(request);
};

var handleRequest = function(request, sender, callback) {
  if (request['type'] === 'update') {
    if(request['url']!==null) {
      currentURL=request['url'];
    }if (request['query'] !== null) {
      queryEl.value = request['query'];
      labelEl.value="";
    }if (request['results'] !== null) {
      queryResults = request['results'];
      if (queryResults[1]>1)
        console.log("Warning ! More than 1 match for this XPath : " + queryEl.value);
    }
  }
};

var handleMouseMove = function(e) {
  if (e.shiftKey) {
    // Only relocate if we aren't in the cooldown period. Note, the cooldown
    // duration should take CSS transition time into consideration.
    var timeInMs = new Date().getTime();
    if (timeInMs - mostRecentRelocateTimeInMs < RELOCATE_COOLDOWN_PERIOD_MS) {
      return;
    }
    mostRecentRelocateTimeInMs = timeInMs;

    // Tell content script to move iframe to a different part of the screen.
    chrome.extension.sendMessage({'type': 'relocateBar'});
  }
};

var handleKeyDown = function(e) {
  if (e.keyCode === X_KEYCODE && e.ctrlKey && e.shiftKey) {
    chrome.extension.sendMessage({'type': 'hideBar'});
  }
};

function saveToLocalStorage(){
  var siteJSON = {};
  var nodes=[];

  if(localStorage[currentURL]) {
    siteJSON=JSON.parse(localStorage.getItem(currentURL));
    nodes = siteJSON.nodes;
  }
  else {
    siteJSON.url = currentURL;
  }

  var currentNodeJSON = {};
  currentNodeJSON.label = labelEl.value;
  currentNodeJSON.xpath = queryEl.value;
  currentNodeJSON.value = queryResults[0]; //0 -> string ; 1 -> nodeCount
  currentNodeJSON.timestamp = new Date().getTime();
  nodes.push(currentNodeJSON);

  siteJSON.nodes=nodes;

  localStorage.setItem(currentURL,JSON.stringify(siteJSON));
}

var saveBtn = document.getElementById("saveBtn");
saveBtn.onclick=function() {saveToLocalStorage();};


queryEl.addEventListener('keyup', evaluateQuery);
queryEl.addEventListener('mouseup', evaluateQuery);

// Add mousemove listener so we can detect Shift + mousemove inside iframe.
document.addEventListener('mousemove', handleMouseMove);
// Add keydown listener so we can detect Ctrl-Shift-X and tell content script to
// steal focus and hide bar.
document.addEventListener('keydown', handleKeyDown);

chrome.extension.onMessage.addListener(handleRequest);

var request = {
  'type': 'height',
  'height': document.documentElement.offsetHeight
};
chrome.extension.sendMessage(request);
