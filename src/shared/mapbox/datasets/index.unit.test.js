const { http_client } = require('./http_client');
const { faker } = require('@faker-js/faker');
const datasets = require('./index');


const create_mock_dataset = () => ({
    owner: faker.internet.userName(),
    id: faker.string.uuid(),
    created: faker.date.past(),
    modified: faker.date.recent(),
    bounds: [-10, -10, 10, 10],
    features: 100,
    size: 409600,
    name: faker.commerce.productName(),
    description: faker.lorem.sentence()
})

jest.mock('./http_client', () => ({
    http_client: {
        get: jest.fn(),
        post: jest.fn(),
    }
}));

describe('datasets', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should get data', async () => {
        const mock_datasets = [
            create_mock_dataset(),
            create_mock_dataset()
        ]
        const expectedData = { data: mock_datasets };
        http_client.get.mockResolvedValue(expectedData);

        const result = await datasets.get();

        expect(http_client.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedData.data);
    });

    it('should get data by id', async () => {
        const id = 1;
        const expectedData = { data: 'data' };
        http_client.get.mockResolvedValue(expectedData);

        const result = await datasets.get_by_id(id);

        expect(http_client.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedData.data);
    });

    it('should post data', async () => {
        const dataset = { data: 'data' };
        const expectedData = { data: 'data' };
        http_client.post.mockResolvedValue(expectedData);

        const result = await datasets.post(dataset);

        expect(http_client.post).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedData.data);
    });
});
