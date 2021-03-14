// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.




// Event listner for clicks on links in a browser action popup.
// Open the link in a new tab of the current window.
function onAnchorClick(event) {
  chrome.tabs.create({
    selected: true,
    url: event.srcElement.href
  });
  return false;
}

// Given an array of URLs, build a DOM list of those URLs in the
// browser action popup.
function buildPopupDom(divName, data) {
  var popupDiv = document.getElementById(divName);

  var ul = document.createElement('ul');
  popupDiv.appendChild(ul);

  for (var i = 0, ie = data.length; i < ie; ++i) {
    var a = document.createElement('a');
    a.href = data[i];
    a.appendChild(document.createTextNode(data[i]));
    a.addEventListener('click', onAnchorClick);

    var li = document.createElement('li');
    li.appendChild(a);

    ul.appendChild(li);
  }
}

// Search history to find up to ten links that a user has typed in,
// and show those links in a popup.
function buildTypedUrlList(divName, startTime) {
  var URLS = [];
  var TIMES = [];
  // To look for history items visited in the last week,
  // subtract a week of microseconds from the current time.
  var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  var microsecondsPerHour = 1000 * 60 * 60
  var oneWeekAgo = (new Date).getTime() - microsecondsPerWeek;
  var twoHoursAgo = (new Date).getTime() - 0.5 * microsecondsPerHour;

  // Track the number of callbacks from chrome.history.getVisits()
  // that we expect to get.  When it reaches zero, we have all results.
  var numRequestsOutstanding = 0;

  chrome.history.search({
        'text': '',              // Return every history item....
        maxResults: 100,
        'startTime': startTime  // that was accessed less than one week ago.
    },
    function(historyItems) {
      // For each history item, get details on all visits.
      for (var i = 0; i < historyItems.length; ++i) {
        var url = historyItems[i].url;
        var currentTime = new Date(historyItems[i].lastVisitTime);
        var year = currentTime.getFullYear();
        var month = currentTime.getMonth()+1;
        var date = currentTime.getDate();
        var hours = currentTime.getHours();
        var minutes = currentTime.getMinutes();
        var seconds = currentTime.getSeconds();
        if(hours < 10){hours = '0'+hours;}
        if(minutes < 10){minutes = '0'+minutes;}
        var time = year+'/'+month+'/'+date+' '+hours+':'+minutes+':'+seconds;
        URLS.push(url);
        TIMES.push(time);
        var processVisitsWithUrl = function(url) {
          // We need the url of the visited item to process the visit.
          // Use a closure to bind the  url into the callback's args.
          return function(visitItems) {
            processVisits(url, visitItems);
          };
        };
        chrome.history.getVisits({url: url}, processVisitsWithUrl(url));
        numRequestsOutstanding++;
      }
      console.log("Urls are:", URLS);
      console.log("Times are:", TIMES);
      if (!numRequestsOutstanding) {
        onAllVisitsProcessed();
      }
    });


  // Maps URLs to a count of the number of times the user typed that URL into
  // the omnibox.
  var urlToCount = {};

  // Callback for chrome.history.getVisits().  Counts the number of
  // times a user visited a URL by typing the address.
  var processVisits = function(url, visitItems) {
    for (var i = 0, ie = visitItems.length; i < ie; ++i) {
      // Ignore items unless the user typed the URL.
      // if (visitItems[i].transition != 'typed') {
      //   continue;
      // }

      if (!urlToCount[url]) {
        urlToCount[url] = 0;
      }

      urlToCount[url]++;
      // console.log("URL: ", url);
      // console.log("Count: ",  urlToCount[url]);
    }

    // If this is the final outstanding call to processVisits(),
    // then we have the final results.  Use them to build the list
    // of URLs to show in the popup.
    if (!--numRequestsOutstanding) {
      onAllVisitsProcessed();
    }
  };

  // This function is called when we have the final list of URls to display.
  var onAllVisitsProcessed = function() {
    // Get the top scorring urls.
    urlArray = [];
    for (var url in urlToCount) {
      urlArray.push(url);
    }

    // Sort the URLs by the number of times the user typed them.
    urlArray.sort(function(a, b) {
      return urlToCount[b] - urlToCount[a];
    });

    buildPopupDom(divName, urlArray.slice(0, 10));
  };
};

// chrome.alarms.onAlarm.addListener(function (alarm) {
//
//   buildTypedUrlList("search_Url_div");
//
// });

// function getUserName() { // expects function(value){...}
//   chrome.storage.local.get('userName', function(data){
//     if(data.userName === undefined) {
//       return false; // default value
//     } else {
//       return data.userName;
//     }
//   });
// }


function login() {

  var userName = document.getElementById('userName').value;
  var examName = document.getElementById('examName').value;
  console.log(userName);
  chrome.storage.local.set({userName : userName, examName: examName}, function(){
    if(chrome.runtime.lastError) {
      throw Error(chrome.runtime.lastError);
    }
  });
}

function result(divName) {

  chrome.storage.local.get(['userName','examName'], function(data){
    if(data.userName === undefined) {
      document.getElementById(divName).innerHTML = "Unregister";
    } else {
      document.getElementById(divName).innerHTML = "Current Name:" + data.userName + "<br />" + "Current Exam:" + data.examName;
      // document.getElementById("userName").innerHTML = data.userName;
      // document.getElementById("examName").innerHTML = data.examName;

      // a.href = data.userName;
    }
  });
}

window.addEventListener('DOMContentLoaded', function(evt) {
  // Cache a reference to the status display SPAN
  // Handle the bookmark form submit event with our addBookmark function
  result('status-display');

  document.getElementById('Login')
      .addEventListener('submit', login);


});