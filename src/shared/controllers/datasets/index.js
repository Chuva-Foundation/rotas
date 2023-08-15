const datasets = require('mapbox/datasets');

module.exports = {
    get: async(req, res) => {
        res.body = await datasets.get()
        return res;
    },

    get_by_id: async(req, res) => {
        res.body = await datasets.get_by_id(req.params.id)
        return res;
    },
    post: async(req, res) => {
        res.body = await datasets.post(req.body)
        return res;
    }
}
