module.exports = (socket) => {
    if (!socket.app.ending) {
        socket.connect(socket.driver, socket.app);
    }
}