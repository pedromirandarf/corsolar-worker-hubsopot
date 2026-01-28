const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const MarkdownIt = require('markdown-it');

// Configurar markdown-it
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true
});

/**
 * Página inicial de documentação
 */
router.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '../../docs/index.html');
  res.sendFile(indexPath);
});

/**
 * Renderiza markdown como HTML
 */
const renderMarkdown = (req, res, filename) => {
  const filePath = path.join(__dirname, '../../docs', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Documento não encontrado</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
          h1 { color: #e74c3c; }
        </style>
      </head>
      <body>
        <h1>❌ Documento não encontrado</h1>
        <p>O arquivo ${filename} não existe.</p>
        <a href="/docs">← Voltar para documentação</a>
      </body>
      </html>
    `);
  }

  const markdown = fs.readFileSync(filePath, 'utf-8');
  const html = md.render(markdown);
  
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${filename} - Worker HubSpot</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f5f7fa;
        }

        .navbar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px 40px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .navbar a {
          color: white;
          text-decoration: none;
          font-weight: 600;
          transition: opacity 0.3s;
        }

        .navbar a:hover {
          opacity: 0.8;
        }

        .container {
          max-width: 1000px;
          margin: 40px auto;
          background: white;
          padding: 60px;
          border-radius: 10px;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
        }

        h1 {
          color: #667eea;
          border-bottom: 3px solid #667eea;
          padding-bottom: 10px;
          margin-bottom: 30px;
        }

        h2 {
          color: #764ba2;
          margin-top: 40px;
          margin-bottom: 20px;
          font-size: 1.8rem;
        }

        h3 {
          color: #667eea;
          margin-top: 30px;
          margin-bottom: 15px;
          font-size: 1.4rem;
        }

        h4 {
          color: #764ba2;
          margin-top: 20px;
          margin-bottom: 10px;
        }

        code {
          background: #f4f4f4;
          padding: 2px 8px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          color: #e74c3c;
          font-size: 0.9em;
        }

        pre {
          background: #2d3748;
          color: #e2e8f0;
          padding: 20px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 20px 0;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }

        a {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
        }

        a:hover {
          text-decoration: underline;
        }

        ul, ol {
          margin: 20px 0;
          padding-left: 30px;
        }

        li {
          margin: 10px 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        th {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px;
          text-align: left;
        }

        td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
        }

        tr:hover {
          background: #f8f9fa;
        }

        blockquote {
          border-left: 4px solid #667eea;
          padding-left: 20px;
          margin: 20px 0;
          color: #666;
          background: #f8f9fa;
          padding: 15px 20px;
          border-radius: 4px;
        }

        img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 20px 0;
        }

        .back-link {
          display: inline-block;
          margin-bottom: 20px;
          padding: 10px 20px;
          background: #667eea;
          color: white !important;
          border-radius: 5px;
          text-decoration: none;
          transition: all 0.3s;
        }

        .back-link:hover {
          background: #764ba2;
          transform: translateX(-5px);
          text-decoration: none;
        }

        @media (max-width: 768px) {
          .container {
            padding: 30px 20px;
            margin: 20px;
          }
          
          .navbar {
            padding: 15px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="navbar">
        <a href="/docs">← Voltar para Documentação</a>
      </div>
      <div class="container">
        ${html}
      </div>
    </body>
    </html>
  `);
};

/**
 * Rotas para cada documento
 */
router.get('/usage', (req, res) => renderMarkdown(req, res, 'USAGE.md'));
router.get('/docker', (req, res) => renderMarkdown(req, res, 'DOCKER.md'));
router.get('/testing', (req, res) => renderMarkdown(req, res, 'TESTING.md'));
router.get('/readme', (req, res) => renderMarkdown(req, res, '../README.md'));

module.exports = router;
