const { http_client } = require("../http_client");


module.exports = {
    get: async ({dataset_id}) => {
        const { data } = await http_client.get(`${dataset_id}/features/`);
        return data;
    },

    get_by_id: async ({dataset_id, id}) => {
        const { data } = await http_client.get(`${dataset_id}/features/${id}`);
        return data;
    },

    post: async ({dataset_id, feature}) => {
        const { data } = await http_client.post(`${dataset_id}/features`, feature);
        return data;
    }
}
