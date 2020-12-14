'use strict';

module.exports = (socket, request, response) => {
    // Ignore aborted requests
    if (request.aborted) {
        return response.end();
    }

    // Ignore when the url path is not base
    if (request.url != "/") {
        socket.app.log.out("info", module, "No page available for URL: " + request.url);
        return response.end();
    }

    let method;
    if (request.headers.stream) {
        if (request.headers.stream == "Started") {
            method = 'streamStart';
        }
        if (request.headers.stream == "Stopped") {
            method = 'streamStop';
        }
    }

    if (method) {
        socket.requests[method](socket, request.url, request.headers);
    }

    response.end();
};