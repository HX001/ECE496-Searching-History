// import axios from "axios";


// chrome.webNavigation.onHistoryStateUpdated.addListener( (details) => {
//     alert(details.frameId);
//     if(details.frameId === 0) {
//
//         // Fires only when details.url === currentTab.url
//         chrome.tabs.get(details.tabId, function(tab) {
//             if(tab.url === details.url) {
//                 chrome.storage.local.get(['userName','examName'], function(data){
//
//                     var request = new XMLHttpRequest();
//
//                     request.open("POST", "https://sleepy-bayou-41000.herokuapp.com/classifyurl", true);
//                     request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//                     // Handle request state change events
//                     request.onreadystatechange = function() {
//                         // If the request completed
//
//                         if (request.readyState == 4) {
//                             alert(request.responseText);
//                             if (request.status == 200) {
//                                 // If it was a success, close the popup after a short delay
//                                 // window.setTimeout(window.close, 1000);
//                             } else {
//                                 // Show what went wrong
//                                 // statusDisplay.innerHTML = 'Error saving: ' + xhr.statusText;
//                             }
//                         }
//                     };
//                     request.send(JSON.stringify({
//                         user_id : data.userName,
//                         access_time : new Date(),
//                         website_url : tab.url,
//
//                     }));
//                 });
//             }
//         });
//     }
// })

chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
        // read changeInfo data and do something with it
        // like send the new url to contentscripts.js

        if (tab.url == "chrome://newtab/")
            return
        else if (tab.url.includes("http://localhost:3000/"))
            return
        else if (tab.url.includes("google"))
            return

        if (changeInfo.status != 'complete' || tab.status != 'complete' || tab.url == undefined)
            return

        chrome.storage.local.get(['userName','examName'], function(data){

            var request = new XMLHttpRequest();

            request.open("POST", "http://0.0.0.0:5000/classifyurl", true);
            request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            // Handle request state change events
            request.onload = function() {
                if (request.status === 200) {
                    var json = JSON.parse(request.responseText);
                    if (json.status != "User is not found")
                    alert("You are openning a website relate to " + request.responseText);
                } else {
                    // errorCallback();
                }
            };
            request.onerror = function() {
                alert("The request couldn't be completed.");
                // errorCallback();
            };
            // request.onreadystatechange = function() {
            //     // If the request completed
            //
            //
            //     alert(tab.url)
            //     alert(request.readyState)
            //
            //     if (request.readyState == 4) {
            //         alert(request.status);
            //         if (request.status == 200) {
            //             // If it was a success, close the popup after a short delay
            //             // window.setTimeout(window.close, 1000);
            //         } else {
            //             // Show what went wrong
            //             // statusDisplay.innerHTML = 'Error saving: ' + xhr.statusText;
            //         }
            //     }
            // };
            // request.send({
            //     "user_id" : data.userName,
            //     "access_time" : new Date(),
            //     "website_url" : tab.url,
            //
            // });
            // Set up some data to send in the AJAX request

            var data = JSON.stringify({
                "user_id" : data.userName,
                "access_time" : new Date(),
                "website_url" : tab.url,

            });

            request.send(data);
            // $.ajax({
            //     type: "POST",
            //     url: "https://sleepy-bayou-41000.herokuapp.com/classifyurl",
            //     data: {
            //         user_id : data.userName,
            //         access_time : new Date(),
            //         website_url : tab.url,
            //
            //     },
            //     success: function(msg){
            //         alert(msg);
            //     },
            //     error: function(){
            //         alert("error");
            //     }
            // });





            // axios.post('https://sleepy-bayou-41000.herokuapp.com/classifyurl',
            //     {
            //         user_id : data.userName,
            //         access_time : new Date(),
            //         website_url : tab.url,
            //
            //     })
            //     .then(response => {
            //         alert(response);
            //     });
        });

        // chrome.tabs.sendMessage( tabId, {
        //     message: 'hello!',
        //     url: changeInfo,
        //     tab: tab
        // })
        // if (changeInfo.url) {
        //
        // }
    }
);

// // chrome.tabs.onCreated.addListener(
// //     function(tabId, changeInfo, tab) {
// //         // read changeInfo data and do something with it
// //         // like send the new url to contentscripts.js
// //         alert('You open a website');
// //         chrome.tabs.sendMessage( tabId, {
// //             message: 'hello!',
// //             url: changeInfo,
// //             tab: tab
// //         })
// //         if (changeInfo.url) {
// //             chrome.tabs.sendMessage( tabId, {
// //                 message: 'hello!',
// //                 url: changeInfo.url
// //             })
// //         }
// //     }
// // );
//
// // chrome.webRequest.onBeforeRequest.addListener(
// //     function(details) {
// //         console.log(details)
// //     }
// // );
