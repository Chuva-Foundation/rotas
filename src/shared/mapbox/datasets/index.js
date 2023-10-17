
const { http_client } = require('./http_client');
const features = require('./features');

module.exports = {
    features,

    get: async () => {
        const { data } = await http_client.get()
        return data;
    },

    get_by_id: async (id) => {
        const { data } = await http_client.get(id);
        return data;
    },

    post: async (dataset) => {
        const { data } = await http_client.post('', dataset);
        return data;
    }
}
