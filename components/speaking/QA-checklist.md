# ✅ QA Checklist - Layout Melhorado da Conversa

## 🎯 Critérios de Aceitação

### 1. Layout e Avatares ✅
- [ ] Avatares exibem lado a lado no desktop
- [ ] Avatar do usuário à direita, IA à esquerda
- [ ] Indicadores de atividade de voz funcionam em tempo real
- [ ] Animação de "pulse" aparece quando falando
- [ ] Conexão visual entre avatares está presente
- [ ] Click nos avatares mostra tooltip (futuro: modal de perfil)

### 2. Sistema de Mensagens ✅
- [ ] Mensagens do usuário aparecem à direita (verde)
- [ ] Mensagens da IA aparecem à esquerda (azul)
- [ ] Mensagens são agrupadas por proximidade temporal (<30s)
- [ ] Timestamps aparecem em formato legível
- [ ] Bubbles têm cantos arredondados apropriados
- [ ] Hover mostra ações (play, editar, mais opções)
- [ ] Scores de pronúncia aparecem para mensagens do usuário

### 3. Auto-scroll e Navegação ✅
- [ ] Scroll automático funciona para novas mensagens
- [ ] Auto-scroll pausa quando usuário rola para cima
- [ ] Botão "voltar ao final" aparece quando necessário
- [ ] Scroll é suave e responsivo
- [ ] Estado de "usuário rolou para cima" é detectado corretamente
- [ ] Scroll funciona com muitas mensagens (>50)

### 4. Painel de Contexto ✅
- [ ] Painel lateral direito funciona no desktop
- [ ] Mostra objetivo da sessão
- [ ] Exibe estatísticas em tempo real (mensagens, correções)
- [ ] Botão de fechar/mostrar funciona
- [ ] Controles rápidos estão acessíveis
- [ ] Botão "Encerrar Sessão" funciona

### 5. Responsividade 📱
- [ ] Layout funciona em desktop (>1024px)
- [ ] Layout se adapta para tablet (768px-1024px)
- [ ] Layout funciona em mobile (<768px)
- [ ] Painel lateral se torna overlay em mobile
- [ ] Avatares se reorganizam verticalmente em telas pequenas
- [ ] Touch targets são adequados (>44px)
- [ ] Gestos de scroll funcionam suavemente

### 6. Acessibilidade ♿
- [ ] Navegação por teclado funciona
- [ ] Labels ARIA estão presentes
- [ ] Contrast ratio >= 4.5:1 para texto
- [ ] Focus outlines são visíveis
- [ ] Screen readers conseguem navegar
- [ ] Região de mensagens tem role="log"
- [ ] Novas mensagens são anunciadas (aria-live)

### 7. Performance 🚀
- [ ] Renderização suave com 10+ mensagens
- [ ] Sem lag perceptível com 50+ mensagens
- [ ] Auto-scroll não causa jank
- [ ] Agrupamento de mensagens otimiza re-renders
- [ ] Animações não impactam performance
- [ ] Memory usage estável durante sessão longa

### 8. Integração com Vapi 🎤
- [ ] Estados de voz (isUserSpeaking/isAISpeaking) funcionam
- [ ] Eventos do Vapi atualizam indicadores corretamente
- [ ] Transcrições aparecem em tempo real
- [ ] Scores e correções são exibidos adequadamente
- [ ] Timer da sessão funciona
- [ ] Status de conexão é mostrado corretamente

## 🧪 Cenários de Teste

### Cenário 1: Primeira Conversa
1. Inicie uma nova sessão
2. Verifique avatares lado a lado
3. Fale algo e confirme indicador de voz
4. Verifique mensagem aparece à direita
5. IA responde, mensagem aparece à esquerda
6. Confirme auto-scroll funciona

### Cenário 2: Conversa Longa
1. Continue conversa por 10+ turnos
2. Role para cima no histórico
3. Confirme auto-scroll pausa
4. Nova mensagem chega
5. Verifique botão "voltar ao final"
6. Click no botão e confirme scroll

### Cenário 3: Mobile/Responsivo
1. Abra em device mobile
2. Verifique layout se adapta
3. Teste gestos de scroll
4. Abra/feche painel de contexto
5. Confirme touch targets
6. Teste rotação de tela

### Cenário 4: Agrupamento de Mensagens
1. Envie mensagem
2. Dentro de 30s, envie outra
3. Confirme mensagens agrupadas
4. Espere >30s, envie terceira
5. Confirme nova bolha separada
6. Verifique diferentes speakers

### Cenário 5: Indicadores de Voz
1. Inicie conversa
2. Fale algo
3. Confirme avatar pulsa/anima
4. Pare de falar
5. IA responde
6. Confirme avatar da IA anima

## 🐛 Testes de Edge Cases

### Volume Alto de Mensagens
- [ ] 100+ mensagens renderizam sem lag
- [ ] Scroll permanece suave
- [ ] Memory não vaza
- [ ] Auto-scroll funciona corretamente

### Conexão Instável
- [ ] Indicadores de status funcionam
- [ ] Mensagens não se perdem
- [ ] Reconexão é handled graciosamente
- [ ] Estado é mantido durante interrupções

### Conteúdo Extremo
- [ ] Mensagens muito longas (500+ chars)
- [ ] Mensagens muito curtas ("ok")
- [ ] Caracteres especiais/emojis
- [ ] Diferentes idiomas/acentos

### Multi-device/Browser
- [ ] Chrome desktop
- [ ] Firefox desktop
- [ ] Safari desktop
- [ ] Chrome mobile
- [ ] Safari mobile
- [ ] Edge desktop

## 📊 Métricas de Performance

### Benchmarks Alvo
- **First Paint**: < 100ms
- **Scroll Performance**: 60fps
- **Message Render**: < 50ms
- **Auto-scroll Trigger**: < 100ms
- **Memory Usage**: < 50MB após 30min

### Ferramentas de Medição
- Chrome DevTools Performance
- React Developer Tools Profiler
- Lighthouse Accessibility Audit
- WebPageTest Mobile
- Memory Usage Monitor

## 🎨 Validação Visual

### Desktop Layout
- [ ] Cabeçalho com timer e progress
- [ ] Avatares centralizados e balanceados
- [ ] Mensagens bem alinhadas
- [ ] Painel lateral proporcional
- [ ] Cores contrastam adequadamente

### Mobile Layout
- [ ] Elementos se reorganizam verticalmente
- [ ] Text sizes são legíveis
- [ ] Espaçamento adequado para touch
- [ ] Overlay não obstrui conteúdo
- [ ] Navigation é intuitiva

## 🚀 Critérios de Launch

### Funcionalidade Core ✅
- [x] Layout funciona corretamente
- [x] Integração com Vapi mantida
- [x] Auto-scroll implementado
- [x] Responsive design functional
- [x] Acessibilidade básica

### Nice-to-Have 🔄
- [ ] Audio replay buttons funcionais
- [ ] Message editing implementado
- [ ] Keyboard shortcuts
- [ ] Export transcript feature
- [ ] Voice activity visualization avançada

## 📋 Sign-off

**Desenvolvedor**: _________________ **Data**: _________

**Product Owner**: _________________ **Data**: _________

**QA Tester**: _________________ **Data**: _________

**Accessibility Review**: _________________ **Data**: _________

---

## 📝 Notas de Implementação

### Prioridades de Fix
1. **Blocker**: Funcionalidade básica quebrada
2. **Critical**: UX significativamente impactada
3. **Major**: Funcionalidade não-crítica não funciona
4. **Minor**: Melhorias de polish/estética

### Release Criteria
- Todos os "Blocker" e "Critical" resolvidos
- 90%+ dos testes de aceitação passando
- Performance dentro dos benchmarks
- Accessibility audit score > 90%