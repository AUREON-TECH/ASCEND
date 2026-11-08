# ASCEND — integração com AUREON BASE

## Estado verificado em 2026-11-08
AUREON BASE: repositório AUREON-TECH/Aureon-Base; projeto Vercel `aureonbase` com `live=false` e último deployment em `ERROR`. **Não liberar cadastro público até corrigir o backend.**

## Arquitetura
- PWA: GitHub Pages em `https://aureon-tech.github.io/ASCEND/`
- API: AUREON BASE (domínio público HTTPS a confirmar após deployment funcional)
- Projeto SaaS: `ascend` (não reutilizar `tradevision`)
- SDK existente: `sdk/aureon-v1.js`
- Autenticação: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/request-password-reset`, `/auth/reset-password`
- Dados privados: `/v1/projects/ascend/data/<collection>` com tenant isolation no servidor

## Configuração necessária no backend
1. Corrigir a implantação Vercel e verificar `GET /health` e `GET /ready`.
2. Confirmar PostgreSQL, migrações, variáveis e proteção de segredos.
3. Criar registro de projeto `ascend` no banco com registro público e acesso gratuito, sem trial de 7 dias e sem cobrança. Revisar o modelo de acesso antes de cadastrar usuários.
4. Configurar `CORS_ORIGINS` para incluir `https://aureon-tech.github.io`.
5. Confirmar `ALLOWED_EMAILS` vazio, políticas de cadastro público e proteção contra abuso.
6. Configurar e testar e-mail de recuperação com remetente verificado.
7. Implementar no ASCEND login, cadastro, logout, recuperação e armazenamento individual usando a API.
8. Testar com duas contas distintas: dados da conta A jamais acessíveis pela B; sem acesso anônimo a registros privados.
9. Testar PWA Android/iOS, offline, atualização de cache e logout.
10. Só depois publicar como versão de produção.

## Coleções sugeridas
`profiles`, `priorities`, `dreams`, `tasks`, `spiritual_journal`, `purposes`, `fasts`, `verse_favorites`.
Todos os registros devem estar vinculados ao usuário autenticado no servidor; nunca confiar em um `user_id` fornecido pelo navegador.

## Nota de segurança
Não colocar senhas de banco, JWT secrets, service tokens ou credenciais privadas no GitHub Pages. Não simular autenticação com localStorage como se fosse login real.
