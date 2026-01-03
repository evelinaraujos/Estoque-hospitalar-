# 🏥 Sistema de Controle de Estoque Hospitalar

Sistema web para gerenciamento e controle de entrada e saída de materiais médico-hospitalares e medicamentos, com monitoramento de datas de validade.

## 📋 Sobre o Projeto

Este sistema foi desenvolvido para auxiliar hospitais, clínicas e unidades de saúde no controle eficiente de seus estoques, permitindo o rastreamento completo de materiais e medicamentos, desde a entrada até a saída, com alertas automáticos para produtos próximos ao vencimento.

## ✨ Funcionalidades

- **Cadastro de Produtos**: Registro completo de materiais e medicamentos com informações detalhadas
- **Controle de Entrada**: Registro de novos lotes recebidos no estoque
- **Controle de Saída**: Registro de materiais utilizados ou dispensados
- **Monitoramento de Validade**: Visualização de datas de vencimento de todos os produtos
- **Alertas Automáticos**: 
  - Produtos com estoque baixo
  - Produtos próximos ao vencimento
  - Produtos vencidos
- **Histórico de Movimentações**: Rastreabilidade completa de entradas e saídas
- **Busca e Filtros**: Localização rápida por nome, categoria ou data de validade
- **Relatórios**: Visualização do status geral do estoque

## 🚀 Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla)
- LocalStorage para persistência de dados

## 📦 Categorias de Produtos

- Medicamentos
- Materiais Cirúrgicos
- EPIs (Equipamentos de Proteção Individual)
- Materiais de Curativo
- Descartáveis
- Equipamentos Médicos

## 💻 Como Usar

1. Clone este repositório:
```bash
git clone https://github.com/seu-usuario/estoque-hospitalar.git
```

2. Abra o arquivo `index.html` em seu navegador

3. Comece a cadastrar produtos e fazer o controle do estoque

## 📱 Interface

O sistema possui uma interface intuitiva e responsiva, adaptando-se a diferentes tamanhos de tela (desktop, tablet e mobile).

## 🎯 Público-Alvo

- Hospitais
- Clínicas
- Unidades Básicas de Saúde (UBS)
- Farmácias hospitalares
- Almoxarifados de unidades de saúde

## 📊 Informações Armazenadas

Para cada produto, o sistema registra:
- Nome do produto
- Categoria
- Quantidade em estoque
- Unidade de medida
- Número do lote
- Data de validade
- Fornecedor
- Data de entrada
- Histórico de movimentações

## 🔒 Armazenamento de Dados

Os dados são armazenados localmente no navegador utilizando LocalStorage, garantindo que as informações permaneçam salvas mesmo após fechar o navegador.

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Sinta-se à vontade para:

1. Fazer um fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commitar suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Fazer push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abrir um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais deta
