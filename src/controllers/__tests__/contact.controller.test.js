const contactController = require('../contact.controller');
const contactService = require('../../services/contact.service');

jest.mock('../../services/contact.service');

describe('Contact Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      query: {}
    };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendContactsFromCSV', () => {
    it('deve enviar contatos do CSV com sucesso', async () => {
      const mockResult = {
        total: 20,
        success: 18,
        failed: 2,
        errors: []
      };
      req.body.filename = 'contatos.csv';
      contactService.processCSVAndSendContacts.mockResolvedValue(mockResult);

      await contactController.sendContactsFromCSV(req, res, next);

      expect(contactService.processCSVAndSendContacts).toHaveBeenCalledWith('contatos.csv');
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.any(String)
      }));
    });

    it('deve usar arquivo padrão quando não informado', async () => {
      const mockResult = {
        total: 20,
        success: 20,
        failed: 0,
        errors: []
      };
      // Não define req.body.filename para usar o padrão
      contactService.processCSVAndSendContacts.mockResolvedValue(mockResult);

      await contactController.sendContactsFromCSV(req, res, next);

      expect(contactService.processCSVAndSendContacts).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true
      }));
    });

    it('deve tratar erro ao processar CSV', async () => {
      const error = new Error('Erro ao ler CSV');
      contactService.processCSVAndSendContacts.mockRejectedValue(error);

      await contactController.sendContactsFromCSV(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('sendContacts', () => {
    it('deve enviar contatos com sucesso', async () => {
      const mockContacts = [
        { nome: 'João', email: 'joao@test.com' },
        { nome: 'Maria', email: 'maria@test.com' }
      ];
      const mockResult = {
        total: 2,
        success: 2,
        failed: 0,
        errors: []
      };
      req.body.contacts = mockContacts;
      contactService.sendContactsFromRequest.mockResolvedValue(mockResult);

      await contactController.sendContacts(req, res, next);

      expect(contactService.sendContactsFromRequest).toHaveBeenCalledWith(mockContacts);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Contatos enviados',
        data: expect.objectContaining({
          total: 2
        })
      }));
    });

    it('deve retornar erro quando contacts não é um array', async () => {
      req.body.contacts = 'não é array';

      await contactController.sendContacts(req, res, next);

      expect(res.status).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: expect.anything()
      }));
    });

    it('deve retornar erro quando contacts está vazio', async () => {
      req.body.contacts = [];

      await contactController.sendContacts(req, res, next);

      expect(res.status).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: expect.anything()
      }));
    });

    it('deve tratar erro ao enviar contatos', async () => {
      const error = new Error('Erro ao enviar');
      req.body.contacts = [{ nome: 'João' }];
      contactService.sendContactsFromRequest.mockRejectedValue(error);

      await contactController.sendContacts(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
