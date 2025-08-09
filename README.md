# 📌 SentireIA Frontend

Este projeto é a interface de usuário central da SentireIA, atuando como a camada de apresentação que orquestra a interação com os diversos serviços da plataforma. Seu objetivo principal é fornecer uma experiência de usuário intuitiva e segura para a visualização e gestão de dados essenciais de clínicas psiquiátricas e psicológicas, como informações de pacientes, profissionais e agendamentos.

Desenvolvido com Angular e Angular Material, este frontend se conecta à API central para traduzir a orquestração e robustez do backend em uma interface interativa e amigável, facilitando a administração de todas as operações da clínica.

---

## 🚀 Funcionalidades Principais

- **🔐 Autenticação de Usuário**  
  Cadastro, login e confirmação de conta por código.

- **📩 Reenvio de Código**  
  Solicitação de um novo código de confirmação.

- **🎨 Interface Moderna**  
  Layout consistente e responsivo utilizando **Angular Material**.

- **💬 Feedback ao Usuário**  
  Mensagens de sucesso e erro em tempo real com **MatSnackBar** e carregamento visual com **mat-spinner**.

- **🌐 Comunicação com API REST**  
  Estrutura de serviços como `AuthService` para integração com o backend.

---

## 🛠 Tecnologias Utilizadas

- **Framework:** Angular  
- **Linguagem:** TypeScript  
- **Estilização:** Angular Material  
- **HTTP Requests:** HttpClient  
- **Gerenciamento de Estado:** RxJS  
- **Gerenciamento de Pacotes:** npm  

---

## 📋 Pré-requisitos

Antes de iniciar, você precisa ter instalado:

- **[Node.js](https://nodejs.org/)** (versão 14 ou superior)  
- **npm** (vem com o Node.js)  
- **Angular CLI**  
  ```bash
  npm install -g @angular/cli
- **Backend:** O projeto depende de uma API de backend em execução. Certifique-se de que a API SentireIA esteja rodando em http://localhost:8080 ou ajuste o ambiente de acordo.

## Primeiros Passos
Siga estas instruções para configurar e rodar o projeto em sua máquina local.

- **Clonar o Repositório**
  ```bash
  git clone https://github.com/Merssoo/sentireia-front.git
  cd sentireia-front
- **Instalar as Dependências**
  ```bash 
  npm install
  
- **Executar o Servidor de Desenvolvimento**:
  Execute **ng serve** para iniciar o servidor de desenvolvimento. Navegue até http://localhost:4200/. A aplicação recarregará automaticamente se você fizer alterações nos arquivos-fonte.
