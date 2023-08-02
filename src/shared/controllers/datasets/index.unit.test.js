const { topics, sockets } = require('@chuva.io/less');
const { faker } = require('@faker-js/faker');
const { get, get_by_id, post } = require('.');
const datasets = require('mapbox/datasets'); 

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

jest.mock('mapbox/datasets', () => ({
    get: jest.fn(),
    get_by_id: jest.fn(),
    post: jest.fn(),
  }));

describe('Datasets routes', () => {
  const res = { body: null};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return the datasets when found',  async () => {
      // Prepare
      const mockDatasets = [
        create_mock_dataset(),
        create_mock_dataset()
      ];
      
      datasets.get.mockResolvedValueOnce(mockDatasets);

      // Act
      const result = await get({}, res);

      // Assert
      expect(result.body).toEqual(mockDatasets);
      expect(datasets.get).toHaveBeenCalled();
    });
  });

  describe('get_by_id', () => {
    it('should return the dataset when found', async () => {
      // Prepare
      const req = { params: { id: 1 } };
      const mockDataset = create_mock_dataset();
      datasets.get_by_id.mockResolvedValueOnce(mockDataset);

      // Act
      const result = await get_by_id(req, res);

      // Assert
      expect(result.body).toEqual(mockDataset);
      expect(datasets.get_by_id).toHaveBeenCalledWith(1);
    });
  });

  describe('post', () => {
    it('should return the created dataset', async () => {
      // Prepare
      const mockDataset = create_mock_dataset();
      const request_payload = {
        name: mockDataset.name,
        description: mockDataset.description
      };

      const req = { body: request_payload};

      datasets.post.mockResolvedValueOnce(mockDataset);

      // Act
      const result = await post(req, res);
      // Assert
      expect(result.body).toEqual(mockDataset);
      expect(datasets.post).toHaveBeenCalledWith(request_payload);
    });
  });
});
