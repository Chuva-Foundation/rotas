const { route } = require('@chuva.io/less');
const { routes } = require('controllers');

module.exports = {
    post: route(routes.create, [])
}