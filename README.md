# Projeto de Inventário de TI

Este é um projeto de inventário de TI que permite gerenciar e controlar os ativos de tecnologia de uma organização.

## Funcionalidades Principais

- Cadastro de ativos de TI.
- Edição de informações dos ativos.
- Visualização dos ativos cadastrados.
- Exclusão de ativos do inventário.
- Autenticação de usuários com hash seguro de senhas.
- Gerenciamento de sessões para controle de acesso.

## Instalação e Configuração

1. Clone o repositório do projeto:
  <code>git clone https://github.com/HigorChagas/inventario.git</code>
2. Navegue até o diretório do projeto:
  <code>cd nome-do-repositorio</code>
3. Instale as dependências do projeto:
  <code>npm install</code>
4. Crie um arquivo `.env` na raiz do projeto e defina as variáveis de ambiente necessárias, como as configurações do banco de dados e porta do servidor:
```
PORT=_porta_do_seu_servidor
DB_USER=seu_usuario_do_banco_de_dados
DB_PASSWORD=sua_senha_do_banco_de_dados
DB_URL=url_do_seu_banco_de_dados
DB_NAME=nome_do_banco_de_dados
```
5. Inicie o servidor:
  <code>npm start</code>
6. Acesse a aplicação no seu navegador em:
   <code>http://localhost:3000</code>

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE.md) para mais detalhes.

## Considerações Finais

Este projeto de inventário de TI é uma solução básica e pode ser expandido com diversas funcionalidades adicionais, como relatórios, notificações, entre outros. Sinta-se à vontade para contribuir, melhorar e adaptar conforme suas necessidades.

**Importante**: Este projeto contém informações sensíveis no arquivo `.env`. Certifique-se de nunca compartilhar esse arquivo em repositórios públicos ou com pessoas não autorizadas.

Para qualquer dúvida ou sugestão, entre em contato com [higornchagas@gmail.com](higornchagas@gmail.com).

Divirta-se codificando! 🚀
