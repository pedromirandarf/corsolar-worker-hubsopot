const productController = require('../product.controller');
const productService = require('../../services/product.service');
const path = require('path');

jest.mock('../../services/product.service');

describe('Product Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      params: {}
    };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      download: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('deve retornar produtos com sucesso', async () => {
      const mockProducts = {
        data: [{ id: 1, name: 'Produto 1' }],
        meta: { total: 1 }
      };
      productService.getAllProducts.mockResolvedValue(mockProducts);

      await productController.getProducts(req, res, next);

      expect(productService.getAllProducts).toHaveBeenCalledWith({});
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProducts.data,
        meta: mockProducts.meta
      });
    });

    it('deve tratar erro ao buscar produtos', async () => {
      const error = new Error('Erro ao buscar produtos');
      productService.getAllProducts.mockRejectedValue(error);

      await productController.getProducts(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('exportProducts', () => {
    it('deve exportar produtos com sucesso', async () => {
      const mockResult = { filename: 'products_123.csv', count: 10 };
      productService.fetchAndExportProducts.mockResolvedValue(mockResult);

      await productController.exportProducts(req, res, next);

      expect(productService.fetchAndExportProducts).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          filename: 'products_123.csv'
        })
      }));
    });

    it('deve tratar erro ao exportar produtos', async () => {
      const error = new Error('Erro ao exportar');
      productService.fetchAndExportProducts.mockRejectedValue(error);

      await productController.exportProducts(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('downloadProductsCSV', () => {
    it.skip('deve fazer download de arquivo CSV', () => {
      req.params.filename = 'products_123.csv';
      productController.downloadProductsCSV(req, res);
      expect(res.download).toHaveBeenCalled();
    });
  });
});
