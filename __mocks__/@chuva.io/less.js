
module.exports = {
    topics: new Proxy({}, {
        get: () => {
            return {
                publish: async (message) => undefined
            }
        }
    }),

    sockets: new Proxy({}, {
        get: () => {
            return {
                publish: async (message) => undefined
            }
        }
    })
};
