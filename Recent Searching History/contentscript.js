chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // listen for messages sent from background.js
        if (request.message === 'hello!') {
            console.log(request.url)
            console.log(request.tab)
            // var date = Date.now();
            // console.log(new Date(date).toLocaleString())
        }
    });