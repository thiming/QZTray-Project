function connectAndPrint() {
    // our promise chain
    connect().then(function() {
        return print();
    }).then(function() {
        success();              // exceptions get thrown all the way up the stack
    }).catch(fail);             // so one catch is often enough for all promises
    
    // NOTE:  If a function returns a promise, you don't need to wrap it in a fuction call.
    //        The following is perfectly valid:
    //
    //        connect().then(print).then(success).catch(fail);
    //
    // Important, in this case success is NOT a promise, so it should stay wrapped in a function() to avoid confusion
}

// connection wrapper
//  - allows active and inactive connections to resolve regardless
//  - try to connect once before firing the mimetype launcher
//  - if connection fails, catch the reject, fire the mimetype launcher
//  - after mimetype launcher is fired, try to connect 3 more times
function connect() {
    return new Promise(function(resolve, reject) {
        if (qz.websocket.isActive()) {	// if already active, resolve immediately
            resolve();
        } else {
            // try to connect once before firing the mimetype launcher
            qz.websocket.connect().then(resolve, function retry() {
                // if a connect was not successful, launch the mimetime, try 3 more times
                window.location.assign("qz:launch");
                qz.websocket.connect({ retries: 2, delay: 1 }).then(resolve, reject);
            });
        }
    });
}

// print logic
function print() {
    var printer = "XPS Document Writer";
    var options =  { size: { width: 8.5, height: 11}, units: "in", density: "600" };
    var config = qz.configs.create(printer, options); 
    var data = [{ type: 'pdf', data: 'assets/pdf_sample.pdf' }];

    // return the promise so we can chain more .then().then().catch(), etc.
    return qz.print(config, data);
}

// notify successful print
function success() { 
    alert("Success");
}

// exception catch-all
function fail(e) {
    alert("Error: " + e);
}
