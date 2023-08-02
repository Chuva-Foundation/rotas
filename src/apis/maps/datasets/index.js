const { route } = require('@chuva.io/less');
const controller = require('controllers/datasets');

module.exports = {
    get: route(async (req, res) => {
        return controller.get(req, res);
    }, []),

    post: route(async (req, res) => {
        return await controller.post(req, res);
    }, [])
}
