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

function buildTypedUrlList(divName) {
  var URLs = [];
  var TIMES = [];
  // To look for history items visited in the last week,
  // subtract a week of microseconds from the current time.
  var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  var microsecondsPerHour = 1000 * 60 * 60
  var oneWeekAgo = (new Date).getTime() - microsecondsPerWeek;
  var twoHoursAgo = (new Date).getTime() -  microsecondsPerHour;

  // Track the number of callbacks from chrome.history.getVisits()
  // that we expect to get.
  // When it reaches zero, we have all results.
  var numRequestsOutstanding = 0;

  chrome.history.search({
        'text': '',              // Return every history item....
        maxResults: 100,
        'startTime': twoHoursAgo  // that was accessed less than one week ago.
    },
    function(historyItems) {
      // For each history item, get details on all visits.
      for (var i = 0; i < historyItems.length; ++i) {
        var url = historyItems[i].url;
        var currentTime = new Date(historyItems[i].lastVisitTime);
        var year = currentTime.getFullYear();
        var month = currentTime.getMonth();
        var date = currentTime.getDate();
        var hours = currentTime.getHours();
        var minutes = currentTime.getMinutes()+1;
        var seconds = currentTime.getSeconds();
        if(hours < 10){hours = '0'+hours;}
        if(minutes < 10){minutes = '0'+minutes;}
        var time = year+'/'+month+'/'+date+' '+hours+':'+minutes+':'+seconds;

        URLs.push("URL:" + url + " || Time: " + time);
        TIMES.push(time);

        var processVisitsWithUrl = function(url) {
          return function(visitItems) {
            processVisits(url, visitItems);
          };
        };
        chrome.history.getVisits({url: url}, processVisitsWithUrl(url));
        numRequestsOutstanding++;
      }
      console.log("Urls are:", URLs);
      console.log("Times are:", TIMES);
      if (!numRequestsOutstanding) {
        onAllVisitsProcessed();
      }
    });

  var urlToCount = {};

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

    // Sort the URLs, Optional
    // urlArray.sort(function(a, b) {
    //   return urlToCount[b] - urlToCount[a];
    // });

    buildPopupDom(divName, urlArray.slice(0, 30));
  };
}

document.addEventListener('DOMContentLoaded', function () {
  buildTypedUrlList("search_Url_div");
});