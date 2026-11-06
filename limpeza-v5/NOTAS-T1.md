# NOTAS-T1 — a HUD aprovada sobre a cena da rodada 2

Tranche T1 (construção I0004): a casca da HUD julgada LIBERADA na T0
(`~/workspace/jogo-hud-t0/`) ligada à cena NOVA da rodada 2 do Codex
(cópia julgada em `~/workspace/entrega-codex-rodada2/mapa3d/`).
Pasta da tranche: `~/workspace/jogo-t1/`. Nada foi publicado.

## Ficheiros e proveniência

| Ficheiro | Origem | Estado |
| --- | --- | --- |
| `index.html`, `jogo.css` | T0, com adaptações mínimas (abaixo) | adaptados |
| `jogo.js` | T0, reescrito na ligação à API nova | reescrito |
| `cena.js` | entrega rodada 2 | **INTOCADO** — SHA-256 `bcc99436…754d3` antes e depois (manifesto da entrega) |
| `mundo.js` | entrega rodada 2 | intocado — SHA-256 `433c35a9…a0121f` |
| `vendor/three.min.js` | entrega rodada 2 | cópia — SHA-256 `7ae04663…3e9` confere com o manifesto |
| `vendor/GLTFLoader.js` | entrega rodada 2 | cópia — SHA-256 `5c15967b…ab` confere |
| `modelos/orc-t1.glb` | entrega rodada 2 | cópia — SHA-256 `fe73cf88…cbd` confere |
| `modelos/ual1-teste.glb` | — | **NÃO copiado de propósito** (ver elenco) |

Servir por HTTP (o carregador de GLB não funciona em `file://`):
`python -m http.server 8080 --directory ~/workspace/jogo-t1`.

## O elenco que entra na cena (create)

`Campo3D.create(#mapa, { area: {cols:10, rows:7, origin:{x:0,y:0}}, units: ELENCO, qualidade })`
com o elenco oficial do jogo e só ele:

| id | nome | modelo | casa (x,y) | altura |
| --- | --- | --- | --- | --- |
| `orc` | Orc Test | `modelos/orc-t1.glb` | (3,3) | 2,4 m |
| `ong` | Ong | `marcador` | (6,2) | 1,75 m |
| `capanga` | Capanga 1 | `marcador` | (7,4) | 1,8 m |
| `lobo` | Lobo da Caverna | `marcador-lobo` | (2,5) | 0,9 m |

A **figura de teste animada UAL1 fica FORA** — vive só na demo do Codex;
não é personagem do jogo e o GLB nem sequer foi copiado para esta pasta.
Ong/Capanga/Lobo entram como marcadores internos da vista (a própria API
os define assim) até existirem GLB próprios pela rota Flow → Oficina3D;
quando existirem, troca-se só o campo `modelo` de cada entrada.

## O que trocou face à T0

1. **Criação:** T0 usava a API antiga (`create(el, {labels})`, elenco fixo
   dentro da cena). T1 usa o contrato da rodada 2: `create(el, {area,
   units, qualidade})` + `await`-equivalente por `view.ready` (a selecção
   inicial e a frase de abertura só acontecem depois de `ready` resolver;
   rejeição de carregamento cai na linha de mensagem).
2. **Ordem de scripts:** `three.min.js → GLTFLoader.js → mundo.js →
   cena.js → jogo.js` (a da entrega). A camada de etiquetas deixou de ser
   um div da casca: a cena cria a sua `.etiquetas` dentro de `#mapa` e a
   casca só lhe dá estilo (`.nome`, com a regra de cobertura da montagem).
3. **Toques:** o íman de centros projectados da T0 morreu. Tudo passa por
   `hitTest(clientX, clientY)` — contenção: figura pela caixa projectada,
   casa pelo plano do solo, sem raio de atracção em píxeis.
4. **Adaptador único:** a conversão motor (x,y) ↔ vista (x,z) vive num só
   sítio do `jogo.js` (`casaVista`/`casaMotor`). `showMovement` e `move`
   recebem casas convertidas ali; a casa do `hitTest` converte-se ali;
   nenhum outro ponto do código traduz coordenadas.
5. **Gestos = os da demo dele:** ponteiros seguidos um a um; arrasto
   >7 px vira gesto de órbita (`orbit(dx,dy)`, só tem efeito em 360) e
   cancela o toque; dois dedos = pinça de zoom (razão de distâncias) e
   cancela o toque; fim de pinça deixa a frase de zoom na linha. Toque
   limpo = `tratarToque`. Sem lutas: um gesto é uma coisa só.
6. **Pop-up rápido com as TRÊS câmeras:** Fixa · Seguir · **360°** (novo
   botão `cam-360`, sincronizado pelo evento `camera` e por
   `getState().camera`), zoom com limites reais (`zoomRange` desactiva os
   botões nos extremos; passos de 0,25 como na demo), ajuda do grid e
   qualidade — todos ligados à API nova.
7. **Qualidade real:** a API nova só tem `alta|baixa`. Os três botões da
   T0 (que eram só preferência guardada, sem efeito) viraram dois —
   **Baixa/Alta** — ligados a `setQualidade`, aplicados já na vista;
   a preferência persiste (`localStorage hudt1-qualidade`) e entra no
   `create`. Sem efeito inventado, agora com efeito verdadeiro.
8. **Ajuda do grid — distinção escrita:** o interruptor da casca governa
   as **casas acesas ao mover** (`showMovement`), como na T0. **Não** é o
   `setGridVisible` da cena: a grade auxiliar da vista continua desligada
   e nunca é ligada por esta casca (lei do mundo sem tabuleiro). O nome
   do interruptor mantém-se o da lei ("Ajuda do grid — casas acesas ao
   mover").
9. **Parar:** a API nova não tem `stop()`. Uma ordem de `move` nova
   cancela a fila anterior (contrato da vista), por isso Parar = `move`
   imediato para a última casa confirmada da própria figura
   (`getState().units[].posicao`). Aproximação declarada da casca.
10. **Posição na ficha:** lida de `posicao {x,y}` (coords do motor) da
    projecção pública; o cartão público mostra também ESTADO real
    (`vivo` → De pé/Caído). **(Substituído pela T1.1: o cartão público
    aqui descrito foi substituído pelo cartão de vista sem números —
    ver a secção "Correcção T1.1" no fim deste ficheiro.)** A
    disciplina da T0 mantém-se: ficha completa
    só da própria (Ong, TEST); besta e outras = cartão público, vida de
    besta nunca, em nenhum ramo.
11. **`getState()` mudou de forma e o código segue-a:** unidades são
    projecções `{id, nome, posicao:{x,y}, altitude, vivo}`; `moving` é
    um indicador global da cena; `selected`/`camera`/`zoom`/`zoomRange`
    vêm do estado. O evento `moveend` entrega a projecção pública
    (`u.id`, `u.nome`) — o tratador usa-a assim.

## O que continua aproximação — e porquê

- **Alcance = BFS da demo do Codex** (4 vizinhos, bordas da área, casas
  ocupadas), com os orçamentos da demo: Orc 7 · Ong 5 · Capanga 6 ·
  Lobo 9 casas. **(Corrigido pela T1.2: desde a T1.2 só o orçamento
  da Ong corre — a vista da jogadora só controla a própria; os valores
  de Orc/Capanga/Lobo listados acima são constantes inertes herdadas
  da demo, sem nenhum caminho de interface que os use — ver a secção
  "Tranche T1.2" no fim deste ficheiro.)** NÃO é o alcance do motor:
  quando o motor real mandar
  `casasAlcancaveis`, a casca troca `calcularAlcance()` pela projecção
  recebida e converte-a no adaptador — o resto não muda. (Na T0 a
  aproximação era Manhattan ≤4 uniforme; a T1 adopta a BFS da demo por
  ser a aproximação que a rodada 2 verificou, com percursos que contornam
  figuras em vez de um losango pintado.)
- **Ataques, rolagem, consumível, ordem de vez e valores da ficha** =
  demonstração TEST da casca, exactamente como na T0 (sem motor). O
  ressalvo R-T0-2 mantém-se registado para a tranche do adaptador: a
  faixa só deve mostrar técnicas/custos da unidade da jogadora do
  aparelho quando o motor ligar.
- **Parar** pela via do `move` imediato (item 9 acima).
- **Voo/queda** não entram na casca do jogo: na entrega são botões de
  demonstração da demo do Codex, não acções de batalha; a casca não os
  reproduz.

## Verificação medida (esta tranche)

- `node --check jogo.js` — válido.
- SHA-256 de `cena.js` **antes e depois**: `bcc99436…754d3`, igual ao
  manifesto da entrega. `mundo.js`, vendor e GLB conferidos contra o
  manifesto — todos iguais.
- Greps na página do jogo: `sr-only` = 0 · manipuladores de setas
  (`data-passo`, `ArrowKeys`, `Arrow*`) = 0 · `ual1` = 0 (elenco limpo).
- Métodos chamados em `jogo.js`: só API que existe no objecto congelado
  da rodada 2 — `create/ready, getState, hitTest, move, select,
  setCamera, setZoom, setQualidade, showMovement, showHover, orbit, on`.
  Chamadas da API antiga (`projectCell` para toque, `view.stop`,
  `getStats()` directo) = 0.
- Todos os ids referenciados pelo JS existem no HTML (20/20).
- **Layout:** a geometria da faixa (56 px fixos), da linha de mensagem
  (≥120 px úteis em retrato — 145 px medidos na T0), do pop-up (fundo
  dentro do ecrã) e da ficha (25,0%) é a da casca T0 **medida por CDP e
  LIBERADA**, com CSS inalterado nesses pontos; as únicas diferenças de
  marcação estão dentro do pop-up (um botão de câmera a mais, um de
  qualidade a menos), que não tocam na faixa nem na mensagem.
  A remedida CDP nesta VM foi tentada e **o Chromium gerido recusou o
  arranque** ("Hatch WebGL domain policy is required for browser
  startup") — política da plataforma, não contornada. Fica declarado:
  **render e FPS não foram medidos aqui**; a prova de ecrã é no celular
  do Mestre, como manda o portão do desenho — é também onde a T0 foi
  aprovada.

## Correcções pós-julgamento — ressalvas da lente Leis (R-T1-1 e R-T1-2)

O `JULGAMENTO-T1-LEIS.md` saiu **LIBERADO COM RESSALVAS**, com duas
frases por corrigir. Ambas fechadas só em `jogo.js` (a cena continua
intocada):

- **R-T1-1 — a frase final do Parar estava errada.** O `move` imediato
  dispara `moveend` **sincronamente** dentro da cena (`cena.js`:
  `opts.immediate` → `emit('moveend', …)`), por isso o tratador da
  casca pintava "…parou." durante a chamada e a linha seguinte do
  botão, `say('A parar…')`, sobrescrevia-a — a frase que ficava era o
  presente contínuo para uma paragem já concluída. Correcção: a ordem
  trocou — `say('A parar…')` corre **antes** de `view.move(…,
  { immediate: true })`, e nada corre depois dele; a última frase
  pintada é agora a do `moveend`: "**<nome> parou.**"
- **R-T1-2 — arrastar fora da câmera 360 não tinha efeito nem frase.**
  Em Fixa/Seguir, `orbit()` é vazio por desenho da cena, e o gesto de
  arrasto (que cancela correctamente o toque) terminava sem resposta —
  era o único gesto sem resposta da página. Correcção: o `pointerup`
  regista `eraArrasto` (o gesto deste ponteiro virou arrasto, sem ser
  pinça) e, ao fechar o gesto, chama `fraseArrasto()`: se a câmera não
  estiver em 360, a linha fica com "**O arrasto só gira na câmera
  360° — muda em ⚙ → Câmera → 360°**". Em 360 não há frase — a órbita
  visível é a própria resposta. A pinça continua a fechar com a frase
  de zoom, e os cancelamentos (`pointercancel`/`lostpointercapture`)
  mantêm o comportamento já aprovado.

Verificação das correcções: leitura do fluxo nos dois ramos (a ordem
das frases no Parar; `eraArrasto` capturado antes de `gesto` ser
limpo, com a guarda `!multi`) · greps — `say('A parar…')` na linha
imediatamente anterior ao `view.move` imediato e sem nenhum `say`
depois dele nesse ramo; `fraseArrasto` definida e chamada só no ramo
do arrasto · `node --check jogo.js` válido · SHA-256 de `cena.js`
antes e depois das correcções: `bcc99436…754d3` — **intocado**
(`mundo.js` também confere: `433c35a9…a0121f`). As observações
R-T1-3 (folga da linha "Câmera" do pop-up — confirmar no celular) e
R-T1-4 (`if (!u) return` inalcançável em `entrarMover`) não pediam
fecho e ficam como estavam registadas.

---

## Correcção T1.1 — decisão do Mestre (03/11 07:35-07:36)

Decisão dele, na prova da T1 no celular: apertar no monstro pode abrir
informação ("acho legal"), mas **nenhuma informação técnica/mecânica**
da figura pode aparecer na tela da jogadora — isso, nas palavras dele,
é "meta game": a jogadora não pode saber o que a personagem não sabe.
Refino da mesma conversa: o cartão pode trazer só informação de **vista
e história leve, tipo Pokédex** — como ele é por fora e onde ele
normalmente é encontrado — "algo bem tranquilo, nada específico demais"
(sem fraquezas, hábitos táticos ou vantagens usáveis).

### O que saiu

- **O "cartão público" das figuras que não são a própria** (ramo `else`
  de `abrirFicha`): mostrava CA, DEFESA, ARMA, POSIÇÃO (casa x, y lida
  de `posicao`) e ESTADO (De pé/Caído), com a nota de "dados públicos".
  Saiu por inteiro — ramo, campos e nota.
- **As entradas mecânicas de figuras alheias em `FICHAS`**: `FICHAS`
  ficou só com a ficha completa da própria (Ong). As entradas de
  Orc/Capanga/Lobo (ca/defesa/arma) foram removidas do objecto.
- **A CA do alvo nas frases de ataque**: a frase de rolagem dizia
  "… = N contra CA ${alvoCA}" — a CA do alvo é informação técnica do
  monstro e vazava pela linha de mensagem. O campo `alvoCA` foi
  removido de `ATAQUES` (definições incluídas); a CA da própria Ong,
  na ficha dela, fica — é dela.

### O que entrou

- **Cartão de vista** na mesma coluna lateral e no mesmo estilo, para
  qualquer figura que não seja a própria: cabeçalho com nome + tipo
  (Besta/Criatura/Pessoa) + etiqueta TEST; secções **"Onde se encontra"**
  e **"Como ele é"** (aparência); uma frase curta e tranquila; e a nota
  final "A ficha técnica desta figura só o Mestre vê — na tela da
  jogadora não há números nem mecânica dela." Campos permitidos, e só
  estes: nome, tipo, onde, aparência, frase. Os dados vivem num objecto
  novo e separado dos mecânicos, `VISTA`, sem um único campo técnico.
  Em `jogo.css` entrou uma regra (`.vista`, 11 px) para o texto corrido
  do cartão, no mesmo padrão da coluna.
- **A frase de ataque nova**: mostra só a rolagem de quem ataca
  (técnica, `1d20 + bónus próprio`, conta) e fecha com "o Mestre
  confirma se acertou".
- **Aproximação declarada do passo seguinte (frase × botão):** nesta
  casca TEST, "Confirmar" significa que o Mestre confirmou o acerto —
  o `confirmar` da casca resolve sempre como acerto e não há ramo de
  falha. O ramo de falha (o Mestre dizer que errou) chega com a vista
  do Mestre / a ligação ao motor, em tranche própria. Não é defeito
  escondido: é aproximação escrita, herdada da T1 e registada aqui por
  declaração (via (a) do julgamento T1.1-Leis, ressalva R-T11-2).
- O tratador de `moveend` continua a reabrir a ficha/cartão da figura
  que acabou de andar (`fichaAberta === u.id → abrirFicha(u.id)`),
  agora válido para os dois tipos de cartão.

### Os textos do cartão de vista

- **Lobo da Caverna (Besta)** — onde: cavernas e lugares escuros e
  fechados. Aparência a partir da **descrição aprovada pelo Mestre em
  02/11**: lobo grande de quatro patas, pelo escuro cinzento-carvão,
  cicatriz sobre o olho esquerdo branco e cego, ponta da orelha
  direita cortada, pata dianteira esquerda branca. Os **espinhos das
  costas ficaram de fora de propósito** (traço do verso, fora da vista
  frontal neste desenho).
- **Orc Test (Criatura)** e **Capanga 1 (Pessoa)** — textos **TEST
  genéricos e provisórios**, de demonstração, sem cânone inventado
  (Orc: terras afastadas e lugares de batalha; figura humanoide grande
  e forte. Capanga: estradas e lugares de passagem; um homem comum).
  São para substituir pelos textos dele quando ele os der.

### Verificação medida (T1.1)

- `node --check jogo.js` — válido.
- SHA-256 antes/depois, iguais: `cena.js` `bcc99436…754d3` ·
  `mundo.js` `433c35a9…a0121f` — a cena e o mundo não foram tocados
  (só `jogo.js` e `jogo.css` mudaram; nada foi publicado).
- Greps: `alvoCA` = 0 ocorrências no ficheiro · `contra CA` = 0 ·
  `Dados públicos` = 0 · `abrirFicha` não referencia `posicao`
  (0 hits dentro da função) · o ramo do cartão de vista lê **só**
  `v.onde`, `v.aparencia`, `v.frase` (+ nome/sub no cabeçalho) —
  nenhum `f.defesa`/`f.arma`/`v.*` mecânico resta (o único hit de um
  grep largo a `v.posicao` é a variável de laço do BFS de ocupação em
  `calcularAlcance`, lógica interna pré-existente, fora de qualquer
  exibição) · dentro do objecto `VISTA`, o único dígito é o "1" do
  nome próprio "Capanga 1" — nenhum número mecânico · `espinho` = 0
  (o traço do verso não entrou).
- Leitura de volta dos trechos alterados: dados (`ATAQUES`/`FICHAS`/
  `VISTA`), frase de rolagem, `abrirFicha` nos dois ramos, chip da
  própria, fechar ficha e chamadas de toque (`abrirFicha(hit.unitId)`)
  — sintaxe e fluxo (seleccionar, Mover, Atacar, fechar, chip)
  intactos.

---

## Tranche T1.2 — decisões do Mestre (03/11 07:52)

Sobre a página publicada, o Mestre decidiu três coisas; as duas
primeiras executam-se nesta tranche da casca, a terceira fica com a
fronteira declarada no ponto 3. Só mudaram `jogo.js`, `jogo.css` e
`index.html`; **nada foi publicado**.

### 1. A vista da jogadora só controla a própria

- **A figura activa é constante: a Ong.** `selecionada` só é atribuída
  em `selecionar()`, e `selecionar(` só é chamada com `PROPRIA`
  (arranque e chip da ficha — prova por grep abaixo). Acabou o modo
  herdado do teste de um celular só em que tocar noutra figura trocava
  a selecção e se movia/atacava com ela, com rotação de vez
  (`ORDEM_VEZ` removida: 0 ocorrências).
- **Tocar noutra figura** abre o cartão de vista dela (T1.1, intacto)
  e marca-a como **alvo** (`alvo`); nunca troca a figura activa nem a
  vez. Tocar na Ong abre a ficha dela. Um estado pendente aberto
  (Mover/Atacar/Rolagem/Consumível/Resultado) repõe-se à base ao tocar
  numa figura, como antes — mas agora sem trocar quem é a activa.
- **A vez é sempre da Ong nesta vista.** As vezes dos inimigos são do
  Mestre e **não se simulam aqui** — aproximação TEST declarada, com
  destino: vista do Mestre / ligação ao motor. Por vez TEST, a Ong
  pode **mover uma vez e atacar uma vez** (marcas `moveu`/`atacou`,
  gastas no `moveend` e no Confirmar; repetir a acção dá frase, nunca
  silêncio). **Encerrar** fecha a vez dela com a frase de que o Mestre
  continua a batalha e abre a vez seguinte dela (rodada +1, usos
  repostos). Com isto fecham-se, por desenho desta vista, os resíduos
  R-1/R-2/R-3 do julgamento T1.1-Privacidade (o orçamento/técnica da
  besta como figura activa neste aparelho): as entradas de `ATAQUES`
  das outras figuras foram **removidas** (o objecto só tem `ong`;
  `ATAQUES[` só é indexado por `PROPRIA` — prova por grep) e nenhum
  caminho da interface chama `view.move`/ataque com figura ≠ própria
  (as duas chamadas a `view.move` levam `selecionada`, a constante).
- **Alvo e alcance TEST:** sem alvo, Atacar pede para tocar no inimigo;
  com alvo, Atacar abre as técnicas **da Ong**. O ataque só resolve se
  o alvo estiver a **até 2 casas** da Ong — distância por BFS de 4
  vizinhos sobre a grelha (`distanciaAte`, sem contar a cena; as outras
  figuras bloqueiam a passagem, a casa do alvo é o destino). Longe
  demais (ao abrir o Atacar ou ao Confirmar) = frase clara a mandar
  aproximar com o Mover, **sem rolagem**. É aproximação TEST da casca:
  o alcance real é do motor.
- **Abertura de depuração `window.mapa3d` (OBS-T12-1, herdada da
  T1):** a página expõe a API da cena como `window.mapa3d = view`, o
  que permite contornar a casca pela consola do navegador ou por
  script. **Não é um caminho da interface** (toques, botões, gestos
  e teclado estão todos fechados à própria, como acima); é uma
  abertura de depuração desta fase demo, a mesma que a demo e a
  bateria de testes usam desde a rodada 2. Destino declarado: **não
  vai ao ar na build de produção ligada ao motor** — nessa build a
  autoridade é o motor e a vista da jogadora não recebe esta pega.

### 2. Números de dano flutuantes, por parcela, com interruptor

- Ao **Confirmar** um acerto da Ong, saem da figura atacada números
  separados por **tipo de parcela**, desfasados no tempo (150 ms entre
  parcelas), cada tipo com cor e etiquetinha próprias: **dado**
  (pergaminho), **FOR** (laranja), **bónus** (dourado), **magia**
  (violeta de alma). Os números sobem ~54 px e desvanecem seguindo a
  posição projectada da figura atacada (`view.projectUnit(id)` +
  `requestAnimationFrame`, camada `#danos` da casca). Um **total** —
  a soma das parcelas **dela** — fecha a sequência, um pouco maior;
  coube limpo na mesma coluna de números, por isso ficou.
- **As parcelas são todas de quem ataca (a Ong)** — nenhum dado do
  alvo entra: sem vida, sem CA, sem defesa do monstro (a frase de
  rolagem continua sem a CA do alvo, como na T1.1). Decomposição TEST
  da demonstração (valores inventados, até o VLAB/DMG fornecer a
  decomposição real), em `DANO_TEST`:
  - **Lâmina de Maré** (técnica): dados **2d6** — cada face rola na
    hora e aparece como o seu próprio número —, **força = 12** (o FOR
    da ficha TEST dela; segue o exemplo do Mestre: quem tem 12 de
    força vê sair o 12), **bónus fixo TEST = 2**, **magia fixa
    TEST = 3** (a Lâmina é técnica de alma/água).
  - **Ataque básico**: dados **1d6**, força 12, bónus 2, sem magia.
  - Totais possíveis: técnica 19–29, básico 15–20 (só parcelas dela).
    (Correcção R-T12-1: o mínimo da técnica é 1+1 de dados + 12 de
    força + 2 de bónus + 3 de magia = 19; uma versão anterior desta
    nota dizia 20–29 — erro só da nota, os números do jogo estavam
    certos.)
- **Interruptor "Números de dano"** no pop-up ⚙ (linha nova em
  `index.html`, ao lado da Ajuda do grid): é uma **opção** — mora nas
  configurações, **nunca na barra**. Ligado por omissão, persistido em
  `localStorage` (`hudt1-numeros-dano` = `ligado`/`desligado`), como a
  qualidade. Desligado, `mostrarDano` **não é chamado** (a única
  chamada está sob `numerosDano ? … : null` — prova por grep) e
  nenhum número aparece; o acerto continua a resolver-se e a frase a
  sair. **Semântica do interruptor (fecho R-T12-2):** desligar impede
  números **novos** a partir desse momento; números já a flutuar no
  ar no instante do desligar não são apagados — terminam o seu curso
  (no máximo ~2,3 s). Comportamento aceite como normal para uma
  opção deste tipo.

### 3. Impacto na casca — e a fronteira com a cena

- No momento do acerto (Confirmar), a casca dispara um **efeito de
  impacto** sobre a figura atacada: um anel/estalo dourado que expande
  e some em ~0,5 s, posicionado sobre a projecção dela pelo mesmo
  mecanismo dos números. É o que a casca consegue fazer já.
- **Fronteira declarada:** a **viragem de frentes** (quem ataca vira-se
  para o alvo e quem é atacado vira-se para o atacante) e o **gesto do
  golpe** são da **CENA** (frente do Codex, adendo próprio) e **não se
  fingem na casca** — nenhum elemento desta tranche simula rotação ou
  gesto que a cena não fez.

### Verificação medida (T1.2)

- `node --check jogo.js` — válido.
- SHA-256 de `cena.js` **antes e depois**: `bcc99436…754d3`; de
  `mundo.js`: `433c35a9…a0121f` — **intocados** (iguais à T1/T1.1 e ao
  manifesto da rodada 2). Ficheiros finais desta tranche: `jogo.js`
  37.905 B `8fa7a8be…a07` · `jogo.css` 13.597 B `2c010eb0…bdf` ·
  `index.html` 4.422 B `67203d81…51e`.
- Greps em `jogo.js`: `ORDEM_VEZ` = 0 · `alvoNome` = 0 (o campo e os
  seus usos saíram com as entradas alheias de `ATAQUES`) ·
  `dataset.pendente` = 0 (o pendente é agora a variável
  `ataquePendente`) · `ATAQUES[selecionada]` = 0 (só `ATAQUES[PROPRIA]`,
  2×) · `selecionar(` só com `PROPRIA` (2 chamadas + a definição) ·
  `mostrarDano(` = 1 definição + 1 chamada, a chamada sob o ternário
  do interruptor.
- IDs: os 23 ids referenciados por `jogo.js` existem todos em
  `index.html`, incluindo os dois novos (`danos`, `tog-danos`).
- **Simulação isolada da lógica nova** (o mesmo algoritmo, fora da
  cena): distâncias do arranque — Orc 4, Capanga 3, Lobo 7 casas, todos
  > 2, logo o primeiro Atacar manda aproximar com o Mover (orçamento
  da Ong: 5 casas); com a Ong movida para (6,4), a distância ao
  Capanga passa a 1 e o ataque resolve. Amostras de parcelas:
  técnica = dado+dado+FOR 12+bónus 2+magia 3; básico = dado+FOR 12+
  bónus 2 (sem magia) — só valores da Ong.
- **Render/FPS não medidos aqui** (a VM continua sem prova de ecrã da
  cena WebGL); a prova de ecrã é no celular do Mestre, após julgamento
  e publicação por outra frente.
- Leitura de volta de todos os trechos alterados e percurso mental dos
  fluxos: abrir → tocar no Lobo (cartão de vista + alvo; a activa
  continua a Ong) → Atacar longe demais (frase, sem rolagem) → Mover
  (só a Ong anda; `moveend` gasta o uso) → Atacar (técnicas dela) →
  rolagem (sem CA do alvo) → Confirmar (impacto + números por parcela
  a sair do alvo; com o interruptor desligado, impacto e frase, sem
  números) → Continuar → Encerrar (vez seguinte dela, usos repostos).
  Ramos: Atacar sem alvo (frase a mandar tocar no inimigo); alvo longe
  demais ao Confirmar (volta à base, sem dano); segundo Mover/Atacar
  na mesma vez (frase, sem repetir); tocar na Ong com estado pendente
  (repõe a base e abre a ficha dela).


## Tranche da ilustração no cartão de vista (Pokédex) — 03/11

Desenho: `DESENHO-CARTAO-ILUSTRACAO.md` (reconstrucao-3d/), julgado
LIBERADO COM RESSALVAS pelas lentes de Fidelidade/Visual e de
Privacidade/Leis, com as emendas aplicadas no §6 do próprio desenho.
Origem: proposta do Mestre (03/11 08:11) — ao apertar numa criatura,
o cartão de vista mostra também a ilustração dela. A ilustração é
vista pura (a aparência desenhada), na mesma disciplina do texto:
só entra a arte aprovada daquela criatura.

### O que entrou

- **Dois derivados novos** em `imagens/` (pasta nova do conjunto),
  sem crop e sem tocar nos originais — só redimensionar/recomprimir
  (rota: Python PIL, na VM):
  - `imagens/lobo.jpg` — 896×500 (de 2752×1536), JPEG qualidade 82,
    21.777 B, SHA-256 `0187007b…938a`.
  - `imagens/orc.webp` — 640×910 (de 1280×1820), WebP **com alfa**
    preservado, 112.638 B, SHA-256 `7d0c20c1…5156`. Nota de rota: o
    desenho pedia qualidade ≈85, mas medida na VM a q85 dava
    140.262 B e a q80 123.884 B — os dois furavam o tecto de 120 KB;
    usou-se **q76**, a primeira qualidade sob o tecto (112.638 B).
    O tecto manda; a qualidade é o "≈".
  - Peso total acrescentado: 134.415 B (≤ 240 KB); cada ficheiro
    ≤ 120 KB. As imagens só carregam quando um cartão com imagem
    abre (a `<img>` só existe nesse ramo) — custo zero no arranque.
- **`VISTA` ganhou um campo e só um:** `imagem`, apenas em `lobo`
  (`imagens/lobo.jpg`) e `orc` (`imagens/orc.webp`). O Capanga ficou
  **sem o campo**: não existe arte aprovada dele em lado nenhum do
  workspace (lacuna declarada no desenho §1.3) — o cartão dele fica
  só texto, como na T1.2, até existir arte aprovada.
- **A peça:** no ramo de vista de `abrirFicha`, quando `v.imagem`
  existe, entra `<figure class="retrato-vista">` logo após o
  cabeçalho e antes de "Onde se encontra" (primeiro vê-se, depois
  lê-se), com `alt="Ilustração de ${nome}"` e o `onerror` como
  **atributo inline** no template
  (`onerror="this.closest('figure').remove()"`) — nunca listener
  tardio (com `innerHTML` um listener podia perder um 404 rápido).
  Sem `imagem`, o elemento nem é renderizado. CSS novo mínimo em
  `jogo.css`: moldura sobre o preto da própria arte (`#000`), borda
  fina de ouro `rgba(201,162,39,.45)`, `border-radius:8px`,
  `object-fit:contain` (a figura inteira, sem corte),
  `aspect-ratio:4/3` com `max-height:34vh` em paisagem e `1/1` com
  `max-height:30vh` no bloco de retrato. A ficha da própria (Ong)
  não foi tocada; `index.html` intacto.

### Proveniência das imagens (fonte → derivado → aprovação)

- **Lobo da Caverna.** Fonte aprovada e congelada:
  `oficina-audit/tribunal-p3/passo1-frente-lobo/frente-candidata.jpg`
  (JPEG 2752×1536, 1.496.032 B, SHA-256 `df1cc0e6…c565a`).
  Aprovação: desenho escrito F2 aprovado directamente pelo Mestre
  (02/11 23:27, "Aprovo o Lobo assim"); imagem produzida por esse
  desenho; conferência independente E5 com A1/A2/A3 presentes nos
  lados certos; aprovada como está e **congelada por SHA** por
  decisão delegada do Juiz (03/11). Derivado: `imagens/lobo.jpg`
  (acima). Conferência com olhos nesta tranche, fonte × derivado:
  mesma figura frontal — pelo cinzento-carvão, cicatriz sobre o
  olho esquerdo branco e cego, ponta da orelha direita cortada,
  pata dianteira esquerda branca, nenhum espinho visível de frente;
  figura inteira, nada cortado. O texto do cartão nomeia exactamente
  estes traços.
- **Orc (Orc Test).** Fonte aprovada: vista frontal (`orc_frente.png`)
  do conjunto canónico de referência da Oficina (etapa de cor,
  REF-01), a aparência aprovada de que deriva o modelo 3D:
  `goals/oficina-3d-session-audit-and-weekend-continuation/hidden_files/2026-11-01-cor/canonicas/orc_frente.png`
  (PNG RGBA 1280×1820, 2.316.006 B, SHA-256 `30c0f83d…903b6c`).
  Derivado: `imagens/orc.webp` (acima), alfa preservado para o
  fundo ser o preto da moldura. Conferência com olhos nesta
  tranche, fonte × derivado: a mesma vista frontal — pele verde,
  tranças, presas, pinturas de guerra vermelhas, machado de guerra
  de lâmina dupla, armadura de placas com espigões, pele de lobo ao
  ombro, troféus e adaga no cinto; figura inteira, nada cortado.
  Usou-se só a vista frontal; as diagonais do Orc ficam fora desta
  peça.

### Inscrição obrigatória do Orc (fosso, fronteira, reversibilidade)

- **Fosso de especificidade, nomeado:** a imagem do Orc mostra pele
  verde, tranças, presas, pinturas vermelhas e troféus que o texto
  do cartão não nomeia. O texto continua genérico e etiquetado TEST
  ("figura humanoide grande e forte, de ombros largos e braços
  compridos") até às palavras oficiais do Mestre — nada do que o
  texto afirma é falso na imagem, e o fosso é facto conhecido e
  aceite, não descoberta posterior. É proibido "completar" o texto
  a partir da imagem sem a palavra dele.
- **Leitura do equipamento visível:** o machado, a armadura e a
  pele de lobo ao ombro são aparência aprovada que a personagem vê
  (vista), sem nenhum dado de ficha agarrado — a proibição da T1.1
  era de dados de ficha (a arma como mecânica, com nome e dano; a
  CA como número), e continua de pé para texto e números.
- **Frase-fronteira (registo exacto):** "a ilustração do Orc mostra,
  como aparência aprovada, o machado e a armadura que a criatura
  traz: é o que a personagem vê. Não é campo de ficha: o nome da
  arma, o dano e a CA continuam fora da tela da jogadora."
- **Reversibilidade declarada:** se o olho do Mestre reprovar a
  imagem do Orc no cartão publicado, o Orc volta a cartão só-texto
  (retira-se o campo `imagem` da entrada dele em `VISTA`), sem
  discussão.

### Sem recorte — e a variante mínima nomeada, não autorizada

Nenhum recorte (crop) foi feito nesta tranche: usa-se o
enquadramento integral aprovado. Preço medido e aceite: na fixture
do Lobo a figura ocupa só ~27% da largura do quadro (o resto é
margem preta), por isso no cartão ela renderiza pequena (≈50 px em
paisagem; ≈20 px CSS em retrato) — presente e identificável; quem
carrega os traços finos é o texto ao lado. Fica nomeada, para uma
eventual pergunta futura ao Mestre, a **variante mínima** (corte só
das margens pretas puras, zero píxeis da figura) — **não está
autorizada** e não foi feita.

### Verificação medida (esta tranche)

- `node --check jogo.js` — válido.
- SHA-256 de `cena.js` **antes e depois**: `bcc99436…d5d7d59`; de
  `mundo.js`: `433c35a9…a0121f` — **intocados** (iguais à T1.2).
  `index.html` também intacto (`67203d81…51e`). Ficheiros finais:
  `jogo.js` 38.865 B `a8cca6df…6079` · `jogo.css` 14.118 B
  `7b5f6759…3a23` · `imagens/lobo.jpg` 21.777 B `0187007b…938a` ·
  `imagens/orc.webp` 112.638 B `7d0c20c1…5156`.
- **Fontes de imagem intactas:** SHA-256 da fixture do Lobo e da
  canónica do Orc iguais antes e depois da construção
  (`df1cc0e6…c565a` / `30c0f83d…903b6c`) — originais não tocados,
  não convertidos, não movidos.
- **Derivados conferidos com olhos** (fonte × derivado, lado a
  lado): Lobo — mesma figura e traços (acima), composição integral;
  Orc — mesma vista frontal e equipamento (acima), alfa preservado
  (lê-se sobre o preto da moldura).
- **Diff de chaves de `VISTA`** (objecto extraído da fonte e
  avaliado): `orc` = nome/sub/**imagem**/onde/aparencia/frase ·
  `lobo` = nome/sub/**imagem**/onde/aparencia/frase · `capanga` =
  nome/sub/onde/aparencia/frase (sem acréscimo). Só o campo
  `imagem` foi acrescentado, só em duas figuras. `FICHAS` (a Ong)
  não contém `imagem` nem foi alterada.
- **Simulação do ramo sem imagem, por execução do template real:**
  o ternário `retratoVista` e o template do corpo foram extraídos
  da fonte de `jogo.js` e executados para os três cartões —
  Capanga: `retratoVista = ''`, **0 elementos `figure`/`img`** no
  HTML gerado (cartão como na T1.2); Lobo e Orc: exactamente 1
  `figure` + 1 `img`, com o `src` certo, o `alt` certo, o
  `onerror` inline presente, e a figura antes de "Onde se
  encontra". Greps herdados da T1.1 continuam a 0: `alvoCA`,
  `contra CA`. O ramo do cartão continua a ler só
  nome/sub/onde/aparencia/frase/imagem.
- Leitura de volta de todos os trechos alterados (`VISTA`, o ramo
  de vista de `abrirFicha`, as duas regras novas de CSS).
- **Por provar (declarado):** o render final nas duas orientações
  (844×390 e 390×844) e a legibilidade dos traços a DPR real
  (≈2,77, o telefone dele) — nesta VM não há prova de ecrã WebGL;
  provam-se nas capturas dos críticos desta tranche e no olho do
  Mestre após a publicação (frente separada). Critério fechado no
  desenho §4.8: retrato passa com figura identificável + pata
  branca legível; paisagem exige olho cego/cicatriz + pata; só a
  falha do olho em paisagem a DPR real devolve a peça a desenho.
- **Prova de publicação (EM-ILC-1, frente de publicação, 03/11):**

> Fallback §4.6 provado em navegador (publicação): com `imagens/lobo.jpg` temporariamente ausente do conjunto servido, o cartão do Lobo abriu sem moldura, sem ícone de imagem partida e sem erro no fluxo; ficheiro reposto e SHA do derivado reconferido (`0187007b…938a`). Capturas 844×390 e 390×844 dos cartões do Lobo e do Orc conferidas: moldura dentro da coluna, figura completa (contain), texto alcançável por rolagem.

## Tranches T1.4+T1.3 — sistema dele + turnos e IA (construída sobre T1.2+ilustração; NÃO publicada)

Construída a partir dos desenhos julgados `DESENHO-T14-SISTEMA-DELE.md`
(SHA `2b29a093…`) e `DESENHO-T13-TURNOS-IA.md` (SHA `779ed855…`), com a
§5.2 do T1.4 aplicada como mapa de costura sobre o T1.3, e com a ordem
de imersão do Mestre de 03/11/2026 às 08:45 aplicada por cima dos
desenhos onde eles divergissem em TEXTO VISÍVEL (ver abaixo).

### Nasceu / morreu / mudou — por ficheiro

`jogo.js`:
- **Nasceu** `COMBATE_TEST` (dados de combate TEST das quatro figuras,
  campos fechados: `ca/atkQtd/atkFaces/atkBonus/arma/dano/alcance` +
  `transformacao` só na Ong; vida/PA de monstro = 0 campos — A6),
  `bonusTeste()`, `defesaDe()` e `DEFESA_TEST` derivados (resíduo
  classe (b), confinados no IIFE; em produção saem para o motor de
  regras — nunca para a vista), `rolarExpressao()` (gramática
  `NdM[+B]`, sub-expressões de nome próprio ignoradas por construção),
  a máquina de turnos completa (`INICIATIVA_TEST`, `passarVez`,
  `iniciarVezIA`, `vezDaIA`, `agendarAtaqueIA`, `consumirContextoIA`,
  `relogioIA`, `fimDaVezIA`, `escolherDestinoIA`, `atacarIA`,
  `sofrerDano`, `fimDeBatalha`), a reserva de movimento em metros com
  setas do teclado, `mapaDistancias()` (pontuação que atravessa
  ocupadas) e `distanciaEntre()` (BFS com bloqueio — byte-igual ao
  antigo `distanciaAte`).
- **Morreu**: o `1d20` e tudo o que dele pendia (`DANO_TEST`,
  `ATAQUES`, `rolarParcelas`, `ALCANCE_ATAQUE`, `BONUS_IA_TEST`,
  `DANO_IA_TEST`, `alvoCA`, `ORCAMENTOS.ong`, o `moveu` booleano, a
  `rodada` que começava em 2, os campos `perdido|cd|cura` da ficha,
  as armas inventadas «Lâmina Brutal»/«Véu de Névoa»), a etiqueta
  visível TEST, a nota de sistema do cartão de vista.
- **Mudou**: a ficha dela foi re-baseada à fonte (vida 99, alma 91/0
  com Livre derivado, CA 30, ataque «Teste 1d6+10», INT 19; os atributos
  sem fonte nesta fatia ficam marcados TEST de exibição); o alcance do
  toque passa sobre `distanciaEntre`; o chip compõe a vida de
  `danoSofrido`; o `moveend` desdobra-se por dono (monstro/Ong) com
  consumo único da reserva; o ataque dela rola 1d6 de verdade no
  clique e o Confirmar revela o acerto guardado; os flutuantes
  nascem das parcelas da expressão dela (10 flutuantes, atraso de
  100 ms, dispersão ±22 px, clamp de `cx` a [28, ecrã−28] no tick).
- Intocados: `cena.js`, `mundo.js`, `index.html`, `imagens/` (SHA
  conferidos), a peça da ilustração (`imagem`/ramo de vista/
  `.retrato-vista`) e a trava da jogadora da T1.2.

`jogo.css`: morrem `.t-forca`/`.t-magia`; nasce `.dano.t-tecnica`
(azul — reservada; nenhuma parcela nomeada entra nesta fatia porque a
ficha dela tem `tecnica: null`). Mais nada: os estados novos
(`vez-ia`/`fim`) pintam-se com os componentes existentes.

### Fontes e derivações (resumo; o detalhe está nos desenhos)

- Teste = `1d6 + bonusTeste` contra `Defesa = round(CA/3)+3`;
  `bonusTeste = 9 + floor(min(atkBonus,19)/10)` = 10 para os quatro
  (D3 provisório declarado). Defesas: Ong 13 (transformada 14 =
  base +1, teto 15 — NUNCA round(36/3)+3=15: erro apanhado em bancada
  e corrigido), Orc 14, Lobo 14, Capanga 13.
- Dano = expressão da ficha: Chicote 8d6+28 [36–76] média 56;
  transformada 8d6+34 [42–82] média 62; alcance do Chicote 6.
- Ataque básico = 0 PA (leitura R3-M04; pergunta N10 pendente para
  05/11). Transformação = 40 PA com débito real via `paGasto`
  (91 → 51), snapshot de dano/Defesa, sem duração/reversão na fonte
  (nada inventado). Crítico, RD e vantagem: FORA (CB-01, decisão
  para 05/11). Exaustão: fora (sem fonte nesta fatia).
- Elenco decidido pelo Mestre (03/11/2026 08:28): os TRÊS monstros
  contra ela, só para ver o sistema; a queda por volta do fim da 2.ª
  rodada é comportamento ESCOLHIDO e declarado — nunca amaciação.
- Costura aberta: as reservas internas da IA (7/6/9 m) derivam do
  `n_casas` de perseguição; o campo `movimento` da engine dá 2/4/4
  (MOV-05) — divergência registada, a decidir com o Mestre.
- Divergência de rótulos: a engine expõe `atkRotulo` 1d6+19; o que se
  EXECUTA aqui é 1d6+10 (bónus executado da §2.1 do T1.4) — nunca
  fundir os dois.
- Divergência BFS×Manhattan no alcance (o desenho do T1.3 já a tinha):
  com corpos no caminho, a distância BFS pode exceder a Manhattan;
  comportamento registado, sem correcção nesta fatia.

### A ordem de imersão (Mestre, 03/11/2026 08:45)

«o RPG tem que ser 100% imersivo, não pode ter coisas que tiram a
imersão» — sobre a nota do cartão de vista e o rodapé «demonstração
TEST» da página publicada. Regra: na tela, só existe o mundo do jogo;
as regras de privacidade cumprem-se EM SILÊNCIO. Frases removidas ou
reescrevas nesta construção (só texto visível; mecânica e números
intactos — os desenhos são desviados apenas no texto visível, por
ordem directa posterior aos julgamentos):

- REMOVIDA a nota inteira «A ficha técnica desta figura só o Mestre
  vê — na tela da jogadora não há números nem mecânica dela.» do ramo
  de vista de `abrirFicha`.
- Rodapé do cartão de vista: «Cartão de vista · demonstração TEST» →
  «Cartão de vista». Rodapé da ficha dela: «Ficha Base · valores TEST
  fictícios» → «Ficha Base». A etiqueta visível «TEST» dos cabeçalhos
  sai (a marcação TEST fica nos comentários, nas NOTAS e nas
  constantes internas).
- Frases reescritas para a voz do mundo: «A tua ficha completa,
  <b>Ong</b> — valores TEST de demonstração.» → «A tua ficha,
  <b>Ong</b>.»; «ficaria com <b>51</b> de PA livre (valores TEST)» →
  «ficarias com <b>51</b> de PA livre»; «VALORES TEST — a rolagem
  corre no sistema (demonstração)» → «a rolagem corre no sistema do
  jogo»; consumível «sem suporte nesta fatia do motor» → «a <b>Ong</b>
  não tem nada para usar agora.»; alerta «não incluído (demonstração)»
  → «não incluído.»; «fim da batalha de teste.» → «fim desta
  batalha.»; «(batalha de teste)» → «(esta batalha)».

### Aceite interno — resultados (VM sem GPU; N=20.000 salvo indicação)

- `node --check jogo.js` OK. Greps de extinção em `jogo.js`/`jogo.css`/
  `index.html`: `d20`, `DANO_TEST`, `1d20`, `Lâmina`, `Véu de Névoa`,
  `BONUS_IA_TEST`, `DANO_IA_TEST`, `alvoCA`, `data-passo` = 0.
- A2 (extracção, PRNG mulberry32 — o LCG inicial tinha viés medido e
  foi substituído; a casca usa `Math.random` uniforme): acerto 67,0%
  vs Defesa 13 e 50,3% vs 14 (esperado 66,7%/50%); faces uniformes;
  totais [11,16]; com `atkBonus` 25 o bónus continua 10 (teto D3).
- A3: médias 56,06 (Chicote) e 62,06 (transformada), intervalos
  exactos, cada amostra = 8 dados + bónus.
- A6: `window.COMBATE_TEST === undefined && window.DEFESA_TEST ===
  undefined` confirmado em arranque real da casca (só o resíduo
  conhecido `window.mapa3d`); superfície de `COMBATE_TEST` conferida
  por extracção — linhas de monstro só com os campos permitidos.
- A5b: faixa e mensagem pré-Confirmar byte-idênticas (a menos do nome
  público do alvo e da rolagem pública) com `acerta` true/false.
- A7: Transformação debita ao dígito (91 → 51 de PA livre, ficha
  compõe 51); segunda recusa sem debitar; a recusa por PA insuficiente
  não é alcançável pela interface nesta fatia (só há uma Transformação
  de 40 < 91) — verificada por leitura de código.
- A8: totais da IA dentro dos intervalos das expressões reais;
  acertos 66,5–66,8% / 49,6–50,6%.
- §7.8 (destino IA): os 7 cenários passam + propriedade em 90
  configurações aleatórias (destino sempre alcançável, ≤ reserva,
  distância mínima).
- Arranque real da casca (DOM/vista fictícios, relógio virtual,
  `Math.random` injectado): 67 verificações PASS — rotação completa e
  intercepções da vez alheia (EM-P4/P2), queda na rodada 2 com o RNG
  no máximo (dano sofrido 91 na rodada 1; `setVivo('ong', false)` uma
  vez), relógio de guarda e moveend tardio (zero efeitos), `view.move`
  a lançar (a vez sobrevive), reserva em metros com setas e toque
  misturados (9,0 → 1,5 → esgotada fecha sozinha), guardas das setas,
  ataque dela (10 flutuantes, total = soma, A9 sem fora-de-ecrã a
  390 px), Transformação, Parar (D-13.15).
- §7.5: `vezAtual` só é atribuído na declaração, em `iniciarVez` e em
  `iniciarVezIA`; `indiceVez`/`rodada++` só em `passarVez`.
- Imersão: «só o Mestre vê» = 0; «valores TEST» = 0; «demonstração» =
  2 ocorrências, ambas em comentários do código (fora de strings de
  UI = 0); «TEST fict» = 0.
- Ritmo simulado com o elenco decidido (3 monstros): ≈49,0 de dano
  esperado/rodada contra ela; queda na rodada 1 impossível (máximo
  91 < 99); queda típica no fim da rodada 2 (52,1%) ou no início da
  3.ª (37,7%); rodada 4+ em 10,2% das batalhas; transformada reduz
  para ≈36,7/rodada. Comparação histórica: P(≥1 acerto de Lobo ou
  Capanga na rodada 1) = 88,5% ≈ os 88,9% medidos no tempo do T1.2.
- Por provar nesta VM (declarado): render/WebGL real, o clique real
  no mapa 3D, e o jogo real no telefone — provam-se nos críticos e no
  olho do Mestre depois da publicação (frente separada).

### Emendas dos julgamentos aplicadas (pós-construção, 03/11)

Os dois julgamentos da construção (lentes Privacidade/Imersão e
Exequibilidade — LIBERADO COM RESSALVAS os dois) fecharam quatro
emendas, aplicadas por I0004 sob CM-000009. Só `jogo.js` mudou;
mecânica, números e registos internos intactos.

- **EM-PC1 (Privacidade/Imersão §5.1/§7) — o nome de exibição do Orc
  deixa de dizer «Test»** (3 literais): `ELENCO` (L34)
  `nome: 'Orc Test'` → `'Orc'`; `ALVO_NOME` (L80) `'o Orc Test'` →
  `'o Orc'`; `VISTA.orc` (L209) `nome: 'ORC TEST'` → `'ORC'`. O `id`
  interno, estas NOTAS, os desenhos e as fixtures continuam a
  chamar-lhe «Orc Test» (registo interno). A etiqueta 3D nasce de
  `ELENCO.nome` (a casca cria a cena com `units: ELENCO`), e a frase
  de alvo lê o nome projectado pela cena — por isso a emenda chega
  às quatro superfícies (etiqueta 3D, indicador de vez, cabeçalho do
  cartão, frases) sem tocar em `cena.js`.
- **EM-PC2 (Privacidade/Imersão §5.4/§7) — rodapé do cartão de vista
  removido:** a linha `<footer>Cartão de vista</footer>` saiu do
  ramo de vista de `abrirFicha` («cartão de vista» é nome interno da
  peça, não artefacto do mundo). O cartão fica: cabeçalho →
  ilustração → «Onde se encontra» → «Como ele é» → frase. O rodapé
  «Ficha Base» da ficha dela fica (é o nome do documento-ficha dela
  no sistema do Mestre).
- **E-1 (Exequibilidade §2 — endurecimento do consumo de
  contexto):** em `vezDaIA`, o contexto de movimento passa a
  registar o destino — `contextoIA = { id, seq, destino: { x:
  destino.x, y: destino.y }, relogio: … }`; no tratador de
  `moveend`, ramo do monstro, o consumo passa a ser condicional:
  só consome quando `contextoIA.id === u.id`, existe `destino` e a
  posição chegada é exactamente esse destino. Um `moveend` fora do
  destino é ignorado SEM consumir (nunca consome um contexto fresco
  da mesma figura); um contexto de ataque (sem `destino`) nunca é
  consumido por um `moveend`. O relógio de guarda (`relogioIA`) não
  mudou: continua a consumir o contexto de movimento pelo caminho
  actual. A casca deixa de depender da prova sobre a cena (que
  mostrava o cenário inconstrutível com os eventos actuais).
- **O-1 (Exequibilidade §5 — indicador no fim de batalha):**
  `atualizarVez()` passa a pintar, com `batalhaFim`, «FIM» / nome
  DELA / rodada final (`nomeCena(PROPRIA)`), como o desenho T1.3
  §1.7 prescreve — em vez do nome do monstro que tinha a vez no
  golpe fatal.

**Verificação medida destas emendas (VM sem GPU):**
- `node --check jogo.js` OK. Greps: `Orc Test`/`ORC TEST` = **0**
  em todo o `jogo.js` (ficheiro inteiro, comentários incluídos);
  `<footer>Cartão de vista</footer>` = **0** (a única ocorrência
  restante de «Cartão de vista» é um comentário interno de código).
- Bancada de extracção re-corrida (N=20.000): **tudo passou, sem
  desvio** — acerto 67,0% vs Defesa 13 / 50,3% vs 14; dano dela
  [36,76] média 56,06; transformada [42,82] média 62,06; ritmo
  inalterado (queda impossível na rodada 1; típica fim da 2.ª /
  início da 3.ª).
- Arranque completo re-corrido: **70/70** — A5b continua
  byte-idêntico (faixa e mensagem pré-Confirmar), A6 confinamento
  intacto (`window.COMBATE_TEST`/`DEFESA_TEST` indefinidos),
  rotação completa, relógio de guarda + `moveend` tardio, reserva e
  setas, queda com `setVivo` uma vez. (As expectativas de nome da
  cópia de verificação foram actualizadas para o nome novo —
  a bancada media o comportamento antigo «Orc Test».)
- Cenários dedicados das emendas: **23/23** — EM-PC1 nas quatro
  superfícies e nenhuma frase gerada com «Orc Test»; EM-PC2
  (cartão sem rodapé; «Ficha Base» fica); O-1 (queda →
  `setVivo('ong', false)` exactamente uma vez → indicador
  «FIM / Ong»); E-1 (o cenário forçado: `moveend` obsoleto durante
  a vez seguinte da mesma figura NÃO consome o contexto fresco —
  sem frase, sem ataque, a vez continua; a chegada ao destino
  registado consome e o ataque acontece; um `moveend` durante um
  contexto de ataque é ignorado e o ataque acontece exactamente
  uma vez).
- Intactos, SHA conferidos no fim: `cena.js` `bcc99436…d5d7d59`,
  `mundo.js` `433c35a9…a0121f`, `index.html` `67203d81…51e`,
  `jogo.css` `bc86cac7…`, `imagens/lobo.jpg` `0187007b…`,
  `imagens/orc.webp` `7d0c20c1…` — todos iguais aos publicados.
  **Não publicado** (publicação pausada; o PC não foi contactado).


## Tranche T1.5 — Modo automático + Supervisor do Comestre (03/11/2026)

- **Decisão do Mestre (03/11/2026 10:32):** a página ganha uma
  opção **Modo automático** ligável por ele, para testar o jogo
  como se players estivessem a jogar e ele a supervisionar.
  **Adenda dele (03/11 10:37–10:38):** a supervisão não é externa
  nem superficial — nasce dentro da casca o **Supervisor do
  Comestre**. Desenho fechado:
  `goals/jogo-campo-de-batalha-do-rpg-assimila-o/files/reconstrucao-3d/DESENHO-T15-MODO-AUTOMATICO.md`.
  Na construção inicial só mudaram `jogo.js` e estas NOTAS
  (`jogo.css` intocado — as classes `.cfgrow`/`.tog` existentes
  chegaram); nas correcções pós-críticos ao vivo, abaixo,
  `jogo.css` mudou também, só nas regras do Supervisor.
- **Modo automático (5 linhas):** opção nas configurações rápidas
  (⚙), DESLIGADA por omissão e sem persistência — a linha
  (`.cfgrow` + `.tog`, «Modo automático»/«Ligado»/«Desligado») é
  criada por `jogo.js` em `#cfgpop`, antes de `#stats`, porque o
  `index.html` é sagrado. Ligado, a Ong joga pela IA básica de
  teste PELO PIPELINE LEGAL: o handler de cliques foi refactorado
  para a função nomeada `tratarAcao(acao)` e o controlador chama
  as mesmas acções (atacar → ataque-basico → confirmar →
  continuar → encerrar); o movimento automático é o do toque
  (estado `movendo`, custo/caminho pendentes, desconto único no
  `moveend`). Política v1: alvo = monstro vivo mais próximo por
  `distanciaEntre` (desempate pela ordem de turnos); fora do
  alcance de 6, no máximo UM movimento por vez (melhor destino da
  BFS da reserva, pontuado por `mapaDistancias` do alvo, só se
  melhorar a distância); depois ataca só se estiver ao alcance,
  senão encerra. Ritmo 850 ms entre passos (constante
  `PASSO_AUTO_MS`, dentro de 700–1000); desligar sobe a geração e
  limpa o relógio — passo pendente nunca corre e o `moveend` com
  o modo desligado não agenda passo novo. **Limitação v1
  declarada: Transformação e consumível NUNCA são automáticos**
  (ficam manuais). Nenhum botão novo na barra e nenhuma frase
  `say()` nova: o único texto novo visível é o rótulo e os
  estados, nas configurações.

- **Supervisor do Comestre (adenda):** módulo interno sentado
  nos chokepoints existentes — valida TODA a acção ANTES de ela
  acontecer: as dela em `tratarAcao` (reserva/custo, alcance,
  ordem da vez, alvo vivo; o PA da Transformação valida-se no
  Confirmar, antes do débito), o movimento por toque e por seta,
  e a IA dos monstros (`vezDaIA` confere o destino contra a
  reserva interna; `atacarIA` confere o alcance). Acção ilegal =
  bloqueada antes, com evento `bloqueada` + razão em palavras
  simples no registo interno e estado intacto: nos bloqueios
  "moles" o caminho existente continua e recusa com a frase de
  sempre, sem efeito; nos "duros" (ataque-basico fora das
  condições, encerrar a andar — caminhos sem recusa própria) a
  acção pára no Supervisor. Não cria mecânica paralela nem muda
  números nem frases. **Invariantes vigiados** após resoluções e
  `moveend` e num relógio leve de 500 ms: soma das parcelas =
  total do dano (nos dois sentidos), PA gasto dentro de
  [0, alma total] e alma livre nunca negativa, dano sofrido
  nunca negativo e vida calculada nunca acima do máximo,
  reserva de movimento dentro de [0, 9,0], figuras sempre dentro
  da arena e nunca duas na mesma casa, fluidez pelos eventos
  `stats` da vista (amostras de FPS ≤1/s e lacunas >2 s
  registadas). Violação dura = **a batalha congela na hora**
  (continuações e relógios parados, faixa terminal com
  Recomeçar) — SEM chamar `fimDeBatalha` e SEM `setVivo`: a Ong
  não caiu. **Pontos de retorno:** snapshot serializável completo
  (rodada, índice/vez, posições e vivo de todas as unidades,
  `danoSofrido`, `paGasto`, `transformada`, `reservaMovimento`,
  `atacou`, `alvo`) no arranque de cada turno (`iniciarVez`/
  `iniciarVezIA`), com deduplicação por turno; a acção
  «Voltar ao último estado bom» (nas configurações) restaura o
  snapshot do turno anterior — posições repostas com moves
  `immediate:true` sob a guarda `restaurando` (o `moveend`
  ignora a reposição), `setVivo` quando difere, temporizadores e
  contextos cancelados, geração invalidada — e retoma a vez
  pelos caminhos normais. Um passo atrás (v1). **Superfície do
  Mestre, só nas configurações:** secção do Supervisor com lista
  de alertas (rodada + razão simples; vazia em batalha limpa), o
  botão de voltar e o botão **Exportar registo**, que despeja o
  JSON do registo (eventos, alertas, snapshots, estado actual e
  amostras de fluidez — SEM Defesas nem constantes de combate)
  num `<pre>` dentro do pop-up. Nada disto na barra, no mapa ou
  em frases novas.
- **Limitações honestas do Supervisor (v1):** a fluidez só se
  mede pelo que a vista emite em `stats` (sem eventos `stats`,
  não há amostras nem lacunas para registar); congelar NÃO se
  anuncia na superfície de jogo, por imersão — o erro vive só na
  área de supervisão das configurações e no registo exportável;
  os pontos de retorno voltam UM turno atrás; o Supervisor
  valida os chokepoints da casca — não substitui o H10 do jogo
  de verdade, é a semente dele neste protótipo.

- **Bateria T1.5 (harness Node com DOM/vista fictícios e RNG de
  semente fixa; `hidden_files/bateria-t15/bateria-t15.mjs`):
  11/11 PASS** (corrida total ≈36 s; `node --check jogo.js` OK):
  (1) omissão desligado — após 2.500 ms: 0 rolagens, 0 movimentos
  da Ong, vez dela à espera; a linha está em `#cfgpop` antes de
  `#stats`, `aria-pressed=false`, «Desligado». (2) Ligado desde o
  início — FIM em 16,8 s sem nenhum clique nas acções, 2 rolagens
  legais `1d6+10` dela (todas face 1–6 e total = face+10), 2
  rodadas vistas. (3) Desligar a 250 ms com passo pendente —
  após +3.000 ms: 0 mensagens novas, 0 movimentos, 0 rolagens,
  vez continua dela. (4) Movimento automático por vez ≤ 9,0 m —
  3 vezes dela medidas, somas [0,0; 0,0; 0,0] m (no cenário-base
  o alvo mais próximo já está ao alcance; o movimento real é o
  do caso 5). (5) Cenário afastado fabricado na vista falsa —
  distância inicial Ong→Lobo 7 (>6): 1 movimento automático
  ANTES da 1.ª rolagem e ataque já ao alcance (distância 1 ≤ 6).
  (6) Zero Transformação automática em toda a corrida (0
  mensagens; extra: 0 de consumível). (7) SHA dos 5 sagrados
  intactos no fim. (8) Acções ilegais injectadas bloqueadas
  ANTES, estado intacto: atacar fora de alcance (1 bloqueada,
  «Alvo fora de alcance», 0 rolagens), ataque-basico fora das
  condições (1 bloqueada dura, 0 rolagens), mover por toque além
  da reserva (1 bloqueada, «Casa fora da reserva de movimento»,
  0 movimentos), Transformação sem PA via fixture `paGasto=60`
  na cópia em memória (1 bloqueada no Confirmar, «Alma livre não
  chega…»; a ficha segue com 31 de alma livre — débito zero).
  (9) Invariante violada de propósito (Lobo posto em (99,99)
  pela vista falsa) — a batalha CONGELOU com o alerta «Figura
  fora da arena», Ong viva e indicador sem «FIM» (não caiu),
  faixa terminal com Recomeçar; após +2.000 ms: 0 mensagens e 0
  movimentos novos. (10) Voltar ao último estado bom — com 3
  snapshots guardados, restaurou exactamente o do turno anterior
  (rodada 1, vez do Lobo): os 9 campos canónicos iguais e as
  unidades idênticas, comparados campo a campo contra a
  exportação. (11) Batalha automática limpa fecha com **ZERO
  alertas** do Supervisor; registo com 16 eventos, despejado AO
  VIVO por blocos para `registo-supervisor.jsonl` durante a
  corrida do caso 2: **1.213 B / 16 linhas** (os críticos ao
  vivo lêem esse ficheiro enquanto a corrida decorre).
- **Correcções pós-críticos ao vivo (03/11/2026, mesma tranche):**
  os três críticos ao vivo (Mecânica, Visual, Conflitos/Erros —
  julgamentos `JULGAMENTO-T15-AOVIVO-*.md`) deram **LIBERADO COM
  RESSALVAS** os três, sem falha grave; TODAS as ressalvas foram
  aplicadas nesta passagem (só `jogo.js`, `jogo.css` e estas
  NOTAS mudaram):
  1. **Gelo selado em todas as portas** (Conflitos A1):
     `tratarToque` e o clique no chip da ficha testam
     `supCongelado` à entrada e não mutam NADA depois de
     congelado (sem alvo novo, sem estado, sem apagar
     `ataquePendente`, sem repintar a faixa); a mesma guarda
     entrou em `passoSeta`. Os restantes caminhos de mutação
     foram conferidos: `tratarAcao` já estava selada, o
     controlador automático e `agendarPassoAuto` já testavam o
     gelo, e as continuações da IA morrem com o `seqTurno` que o
     congelamento sobe.
  2. **Guarda de época no `moveend` dela** (Conflitos A2): uma
     época inteira (`supEpoca`) sobe em `supCongelar` e em
     `supRestaurar`; cada movimento dela (toque, seta ou
     automático; o Parar regista a época antes do move imediato)
     guarda a época ao partir. Um `moveend` tardio com época
     diferente NÃO desconta reserva nem repinta nada — e havendo
     restauro pendente, reafirma as posições do snapshot
     restaurado (moves `immediate:true` sob `supRestaurando`).
  3. **`supConferirSoma` com retorno** (Conflitos A3): devolve
     booleano; `atacarIA` e o Confirmar dela ABORTAM a resolução
     nesse tick se devolver falso (sem `sofrerDano`, sem frase
     de Acerto nem dano) — o defeito latente fica fechado.
  4. **Registo completo e auditável** (Mecânica A1/A2/A3/A4 +
     Conflitos A4 + Visual A1/A2): o Supervisor regista também
     as acções LEGAIS dos monstros — movimento (actor, de→para,
     passos) à partida de `vezDaIA` e ataque (actor, alvo,
     acerto/falha e, no acerto, o total do dano) em `atacarIA`;
     os movimentos legais DELA (toque/seta/automático) registam
     actor, de→para e passos à partida; os ataques dela
     registam face/total da rolagem pública (no `ataque-basico`)
     e o dano total no Confirmar; há um **evento terminal**
     `fim` no `fimDeBatalha` natural (com o dano sofrido
     acumulado) e outro no congelamento; **todos os eventos
     levam timestamp** (`ts`, `Date.now()`). NUNCA entram
     Defesas nem constantes internas (conferido por parse ao
     JSONL: chaves presentes são só as públicas/dela). O despejo
     JSONL da bateria passa a incluir, por turno, o **snapshot
     canónico completo (posições incluídas)** como linhas
     `snapshot-turno` — o ficheiro ao vivo permite agora provar
     arena, ritmo e fim.
  5. **Tectos declarados** (Conflitos A5): `supRegisto` ≤
     **1.000 eventos** e `supPilha` ≤ **40 snapshots**, com
     rotação (os mais antigos saem primeiro); o `seq` dos
     eventos é um contador monotónico próprio, que sobrevive à
     rotação sem repetir números.
  6. **Relógio de guarda do movimento dela** (Conflitos A7):
     5.000 ms, como o da IA — armado a cada partida dela; se o
     `moveend` não vier, destrava sem descontar o que não andou
     (pendentes de custo limpos, estado `movendo` de volta à
     base, passo de seta só perde o `passoEmCurso`), com evento
     `guarda` no registo do Supervisor.
  7. **Âmbito do «Voltar» — DECIDIDO e testado** (Conflitos
     A8): voltar ao último estado bom **também funciona depois
     do FIM natural** da batalha. É, por decisão, a ferramenta
     de teste/replay do Mestre: repõe o snapshot do turno
     anterior ao da queda, com a Ong de pé outra vez
     (`batalhaFim` limpo, `setVivo` reposto), e a batalha
     retoma pelos caminhos normais. Não é fuga de mecânica —
     é âmbito declarado, provado pelo caso 12 da bateria.
  8. **CSS de contenção do Supervisor** (Visual A8): `jogo.css`
     ganha regras mínimas para `#sup-json` (altura máxima
     180 px, rolagem, `pre-wrap` + quebra de palavra) e
     `#sup-alertas` (altura máxima 96 px, rolagem interna,
     quebra de palavra) — o exportado e os alertas ficam
     contidos dentro do pop-up de 252 px.
  9. **A6 do Conflitos — NÃO corrigido em código, por decisão
     da coordenação:** o botão de alertas da superfície de jogo
     continua a dizer «nenhum». Razão registada: os alertas do
     Supervisor vivem SÓ na área de supervisão das
     configurações (adenda, ponto 4 — imersão); o botão de
     alertas é da superfície de jogo e **não recebe conteúdo do
     Supervisor** — a frase dele fala dos alertas do jogo, não
     dos do Supervisor.
  **Bateria estendida e re-corrida por inteiro: 15/15 PASS**
  (corrida total ≈62 s; `node --check jogo.js` OK) — os 11
  casos antigos passam todos outra vez (caso 2: FIM em 16,8 s,
  2 rolagens legais; caso 11: registo agora com 28 eventos,
  JSONL **5.354 B / 34 linhas** = 28 eventos + 6 snapshots) e
  juntam-se: **(9b)** pós-gelo, toque no mapa (inimigo, ela,
  chão) + clique no chip = **zero mutações** — estado canónico
  idêntico antes/depois, 0 mensagens e 0 movimentos novos.
  **(10b)** restauro com o movimento dela em voo (clique no
  «Voltar» no mesmo tick da partida): depois do `moveend`
  tardio, o estado canónico é **exactamente o snapshot** do
  turno anterior — reserva 9 vs 9 (sem desconto tardio) e
  unidades idênticas. **(12)** após o FIM natural, «Voltar»
  repõe o turno anterior (rodada 2, vez da Ong), Ong viva,
  indicador sem «FIM» e a batalha **retoma** (mensagens novas).
  **(13)** completude do registo na batalha limpa do caso 2:
  7 acções legais da IA (4 ataques), 1 evento terminal `fim`,
  timestamps em todas as 34 linhas, 6 snapshots com posições,
  2 rolagens dela com face/total — e **zero alertas**.

- **SHA finais:** `jogo.js` 95.855 B
  `c6485a8bbedfeeb235a9f7cb873c1d89047311f1a9a8bb1a0b1c345202ac64d8`;
  `jogo.css` 14.697 B `64dd62bc…4f9` (mudou só nas regras de
  contenção do Supervisor, correcção 8); sagrados
  conferidos no fim: `cena.js` `bcc99436…d5d7d59`, `mundo.js`
  `433c35a9…a0121f`, `index.html` `67203d81…51e`,
  `imagens/lobo.jpg` `0187007b…938a`, `imagens/orc.webp`
  `7d0c20c1…5156` — todos iguais aos do início da tranche.
  **Não publicado** (publicação pausada; notebook/PC não
  contactados).

- **Correcções FINAIS pós-críticos de entrega (03/11/2026, mesma
  tranche):** os dois críticos de entrega (Fidelidade/Sistema e
  Experiência/HUD/Imersão — julgamentos
  `JULGAMENTO-T15-ENTREGA-FIDELIDADE.md` e
  `JULGAMENTO-T15-ENTREGA-EXPERIENCIA.md`) deram **LIBERADO COM
  RESSALVAS** os dois. TODAS as ressalvas foram aplicadas nesta
  passagem (só `jogo.js`, `jogo.css` e estas NOTAS mudaram;
  mecânica, números, política v1, tectos e registo intactos):
  1. **FID-R1 (Fidelidade R1) — o automático NUNCA confirma um
     pendente de Transformação:** no ramo `rolagem` de
     `passoAutomatico`, se
     `ataquePendente.tipo === 'transformacao'`, o passo só
     reagenda a verificação (`agendarPassoAuto`) sem tocar no
     pendente — a decisão fica manual. Um pendente de chicote
     continua a confirmar como antes (o ataque básico é
     automático por desenho).
  2. **FID-R2 (Fidelidade R2) — «alvo vivo» a sério (2 linhas):**
     a selecção de alvo do automático filtra
     `unidade(id) && unidade(id).vivo !== false` (existência já
     não chega) e `supValidarAcaoOng` devolve o bloqueio «O alvo
     já não está na batalha» também quando
     `unidade(alvo).vivo === false` (logo após o teste de
     existência, antes do alcance). O defeito era latente nesta
     tranche (só a Ong cai); fica fechado antes de qualquer
     tranche com morte de monstros.
  3. **EXP-R1 (Experiência R1) — superfície honesta no gelo:**
     (a) `atualizarVez()` mostra «FIM» também com
     `supCongelado` (e `supCongelar` passa a chamá-la) — estado
     terminal honesto; nome e rodada seguem só a regra de
     `batalhaFim`, sem mais toques. (b) Pós-gelo, `tratarAcao`
     (excepto `recomecar`, que continua a ser o único que age),
     `tratarToque` e o clique no chip respondem na linha de
     mensagem com a frase do mundo «A batalha parou — prime
     Recomeçar.» — sem mutação nenhuma (o selo mantém-se;
     acaba-se o silêncio, proibido nesta casca). (c) O botão de
     alertas: havendo alertas do Supervisor, a frase passa a
     «Alertas: vê nas configurações (⚙).» — só a existência e o
     caminho, NUNCA o conteúdo; em batalha limpa, a frase de
     sempre («nenhum») não muda. **Refinamento registado (à
     correcção 9/A6 anterior):** durante o jogo, nada do
     Supervisor na superfície — a decisão A6 mantém-se; depois
     da batalha parada, a superfície pode dizer que há alertas
     e onde vê-los, nunca o que dizem.
  4. **EXP-R2 (Experiência R2) — retorno do «Voltar»:**
     linha de estado própria da secção do Supervisor em
     `#cfgpop` (`#sup-ultimo`, criada por `jogo.js` como as
     outras linhas, com contenção em `jogo.css`): restauro com
     sucesso → «Voltado ao turno anterior — rodada X, vez de
     Y.»; sem estado anterior → «Ainda não há um estado
     anterior guardado.»; exportar → «Registo exportado
     abaixo.». Tudo dentro das configurações, sem `say()` novo.
  5. **EXP-R3 (Experiência R3) — desligar a meio, provado e
     declarado. Semântica declarada: desligar cancela o FUTURO,
     não desfaz o passo já lançado.** (i) Desligar durante a
     `rolagem` automática do chicote: o Confirmar NÃO acontece
     sozinho — o passo pendente é limpo com o relógio/geração,
     a vez fica à espera e o pendente continua manual (o
     Confirmar à mão resolve depois, provado). (ii) Desligar
     durante o movimento automático (`movendo`): a animação já
     lançada TERMINA — a posição final assenta e o desconto
     legal único acontece no `moveend` dela — e NENHUMA acção
     automática nova começa (o `moveend` com o modo desligado
     não agenda passo novo). Nenhum código novo foi preciso
     para esta semântica: é o comportamento dos mecanismos
     existentes (geração + relógio limpo; `agendarPassoAuto`
     recusa com o modo desligado), agora provado por bateria.
  **Bateria estendida e re-corrida por inteiro: 21/21 PASS**
  (corrida total ≈87 s; `node --check jogo.js` OK) — os 15
  casos antigos passam todos outra vez (caso 2: FIM em 16,9 s,
  2 rolagens legais; caso 11: 28 eventos, JSONL 5.354 B / 34
  linhas; os casos 9/9b foram actualizados à superfície
  honesta nova: 9 mede indicador «FIM» no gelo com a Ong viva,
  9b mede 4 mensagens novas — todas a frase do gelo — com o
  estado canónico idêntico e 0 movimentos) e juntam-se:
  **(14) FID-R1** — Transformação aberta à mão sem confirmar +
  automático ligado por 2.700 ms (≥2 ritmos): `paGasto` segue
  0, `transformada` segue false, nenhum débito; o Confirmar
  manual depois disso ainda confirma (paGasto 40,
  transformada true) — o pendente esperava o humano.
  **(15) FID-R2** — 15a: Lobo morto a distância 1 nunca é
  alvo (a 1.ª rolagem é contra o Capanga, o vivo mais
  próximo); 15b: com todos `vivo=false`, por 3.000 ms: 0
  rolagens, 0 movimentos, 0 mensagens novas, base estável;
  15c: `supValidarAcaoOng` regista 1 bloqueada de `atacar`
  com a razão «O alvo já não está na batalha». **(16) EXP-R1**
  — 16a: botão de alertas em batalha limpa diz «nenhum» como
  sempre; 16b: indicador «FIM» no gelo com a Ong viva; 16c:
  `tratarAcao`, toque e chip pós-gelo respondem todos com a
  frase do mundo e o estado canónico fica idêntico, com 0
  movimentos; 16d: com alertas do Supervisor, o botão diz
  «Alertas: vê nas configurações (⚙).» sem o conteúdo da
  razão. **(17) EXP-R2** — `#sup-ultimo`: sem estado anterior
  diz «Ainda não há um estado anterior guardado.»; após um
  Voltar com sucesso diz «Voltado ao turno anterior — rodada
  1, vez de Lobo da Caverna.»; após Exportar diz «Registo
  exportado abaixo.». **(18) EXP-R3(i)** — desligar durante a
  rolagem automática do chicote: após +3.000 ms, 0 mensagens
  novas (o Confirmar NÃO aconteceu sozinho) e o pendente
  segue na faixa à espera; o Confirmar manual resolve.
  **(19) EXP-R3(ii)** — desligar a meio do movimento
  automático (animação da vista falsa alargada a 600 ms neste
  caso — a real dura 220–1200 ms pela mesma fórmula e os
  15 ms do harness não deixam janela de desligar; o caminho
  move→moveend é o mesmo): a animação termina, a posição
  final assenta (6,2)→(0,2), desconto legal único (reserva
  0 = 9 − 6×1,5) e, após +2.500 ms, 0 mensagens novas, 0
  rolagens e nenhum movimento novo.
- **SHA finais (correcções finais):** `jogo.js` 98.356 B
  `880d010c7c3da4db8667be7a9eca75939ec98dd3315d6968f32d1ce93d40e5ea`;
  `jogo.css` 14.974 B
  `19ae8c965922453f17e4269d6198d1513b87788e0d0df5d2fb302e4284d6751d`
  (mudou só na regra de contenção de `#sup-ultimo`, EXP-R2);
  sagrados conferidos no fim: `cena.js`
  `bcc99436…d5d7d59`, `mundo.js` `433c35a9…a0121f`,
  `index.html` `67203d81…51e`, `imagens/lobo.jpg`
  `0187007b…938a`, `imagens/orc.webp` `7d0c20c1…5156` —
  todos iguais aos do início da tranche. **Não publicado**
  (publicação pausada; notebook/PC não contactados).

## Tranche T1.6 — Controlo de velocidade (03/11/2026)

- **Decisão do Mestre (03/11/2026 11:46):** a página ganha um
  controlo para **aumentar a velocidade até 3×** — só o RITMO da
  batalha muda; mecânica e resultados ficam iguais. **Refinamento
  dele (03/11 11:48): cinco passos — 1× · 1,5× · 2× · 2,5× · 3×**
  (o 1,5× e o 2,5× foram acrescentados por ele). Opção nas
  configurações, como as outras preferências. Nesta tranche só
  mudaram `jogo.js` e estas NOTAS; `jogo.css` NÃO mudou (a classe
  `.seg` já existia e chega para o grupo de botões). **Não
  publicado** — a publicação é fase posterior, após críticos.
- **O controlo:** linha «Velocidade» criada por `jogo.js` em
  `#cfgpop` (o `index.html` é sagrado), **imediatamente depois da
  linha do Modo automático e antes de `#stats`**: `.cfgrow` +
  rótulo `.cl` «Velocidade» + grupo `.seg` (`role="group"`,
  `aria-label="Velocidade"`) com 5 botões `1×`, `1,5×`, `2×`,
  `2,5×`, `3×` (vírgula decimal, como o zoom «1,0×» da página);
  o botão activo leva a classe `.on`. NUNCA na barra de baixo.
  Sem nenhuma frase `say()` nova — o único texto novo é o rótulo
  e os passos, dentro das configurações.
- **Persistência:** `localStorage` chave `hudt1-velocidade`,
  valores `'1'|'1.5'|'2'|'2.5'|'3'`, igual às outras
  preferências; leitura no arranque com validação — valor
  estranho guardado volta a 1; **1× por omissão**.
- **Ajudante único:** `const ritmo = ms => ms / velocidade;`
  A velocidade lê-se **no momento** de agendar cada espera ou
  duração — nunca fica capturada num fecho antigo.
  **Semântica da troca a meio da batalha (declarada):** o que já
  está em voo (relógio pendente, animação a correr) termina ao
  ritmo antigo; o passo seguinte já usa o novo. Sem
  re-agendamentos, sem tocar em gerações/épocas/`seqTurno`.
- **O que ESCALA (e só isto) — lista exacta dos sítios:**
  1. **`aguardar(ms)`** passa a esperar `ritmo(ms)` — cobre as
     três pausas de apresentação da vez da IA: `ESPERA_ANUNCIO_MS`
     800 (em `iniciarVezIA`), `ESPERA_ATAQUE_MS` 500 (em
     `agendarAtaqueIA`) e `ESPERA_FIM_MS` 1000 (em `fimDaVezIA`).
     Conferido por grep: `aguardar(` só tem estes 3 chamadores,
     todos de apresentação — nenhum é relógio de guarda.
  2. **Ritmo do Modo automático:** em `agendarPassoAuto`, o
     `setTimeout(..., PASSO_AUTO_MS)` passa a
     `ritmo(PASSO_AUTO_MS)` (850/velocidade).
  3. **Durações de movimento** passadas a `view.move` (a cena
     aceita `durationMs` por chamada — não foi preciso tocar na
     cena): seta `durationMs: 200` → `ritmo(200)`; toque
     `Math.min(1200, Math.max(220, destino.passos * 140))` →
     `ritmo(...)` sobre a expressão inteira; IA
     `Math.min(1700, Math.max(220, destino.passos * 190))` →
     `ritmo(...)`; e o movimento automático, que é o do toque
     tal e qual, recebe o mesmo `ritmo(...)` na sua chamada
     (4.ª chamada de movimento, mesma fórmula do toque). Os
     sítios com `immediate: true` (Parar e reposição/restauro do
     Supervisor) ficam INTOCADOS — são reposição, não
     apresentação.
  4. **Números flutuantes e impacto:** dentro de
     `lancarFlutuante` (chokepoint único), `atraso` e `dur`
     passam a `ritmo(atraso)`/`ritmo(dur)` — cobre
     `mostrarDano` (durações 1100/1000, atrasos 40+100·i) e
     `mostrarImpacto` (duração 480). E em `mostrarImpacto`
     (na forma corrigida pré-publicação — ver «Correcções»
     abaixo), a duração vai no elemento que tem a animação:
     `el.firstElementChild.style.animationDuration =
     (480/velocidade) + 'ms'` — o `firstElementChild` é o
     `<i>` de `innerHTML = '<i></i>'`, dono da animação
     `impactoExpande` (`.impacto i`, animação de .48s no
     `jogo.css`); a duração inline posta nesse elemento
     sobrepõe-se à duração do shorthand da regra, por
     construção CSS, e é nesse elemento que a bateria
     (N1/N3, medição corrigida) afirma 480/192/160 ms a
     1×/2,5×/3×. O que fica provado é o alvo correcto por
     construção CSS + a asserção da bateria sobre esse
     elemento; a confirmação visual final (o anel a expandir
     por completo em ~160 ms a 3×) NÃO foi feita nesta VM —
     sem navegador — e fica para o olho do Mestre no
     telefone, a limitação de sempre desta casca.
- **O que NÃO escala (deliberado, com a razão):**
  - **Relógios de guarda/segurança:** `GUARDA_IA_MS` 5000,
    `SUP_GUARDA_MOVIMENTO_MS` 5000 e `SUP_RELOGIO_MS` 500 são
    detectores de falha em tempo real, não ritmo; a 3× os
    movimentos acabam mais cedo, logo as margens só alargam,
    nunca apertam.
  - **Leitura de fluidez do Supervisor** (`supAmostraStats`:
    amostras ≤1/s, lacunas >2000 ms): mede o FPS de
    renderização que a cena emite em `stats` — tempo real da
    vista, independente do ritmo do jogo; a velocidade não muda
    a taxa de renderização, logo não pode gerar falsos
    congelamentos. A bateria prova-o: zero alertas a 3× (N3).
  - **LACUNA NOMEADA — velocidade de reprodução de clipes GLTF
    dentro da `cena.js` (mixer):** inalcançável a partir de
    `jogo.js`; mexer nela exigiria tocar no ficheiro sagrado.
    Atenua: o elenco actual não declara `animacoes` e o GLB do
    Orc não tem clipes — neste elenco, nada visível fica por
    escalar; se um modelo futuro trouxer clipes, essa velocidade
    vive no ficheiro sagrado e terá de ser tratada numa tranche
    que o possa tocar.
- **Bateria T1.6 (harness Node com DOM/vista fictícios e RNG de
  semente fixa; `hidden_files/bateria-t16/bateria-t16.mjs`,
  derivada da bateria-t15 — mesmo harness, com `localStorage`
  partilhável entre contextos e registo do `durationMs` de cada
  `view.move`; saída guardada em `saida-bateria-t16.txt`):
  27/27 PASS** (corrida total ≈134 s; `node --check jogo.js`
  OK). **Os 21 casos da T1.5 continuam verdes a 1×** (sem
  regredir nenhum; caso 2: FIM em 16,9 s, 2 rolagens legais;
  caso 11: zero alertas, registo com 28 eventos) e juntam-se:
  **(N1) Identidade de resultados** — batalha automática
  completa com a MESMA semente (12345) a 1×, a 2,5× e a 3×:
  estado final canónico (unidades com posições/vivo,
  `danoSofrido`=101, `paGasto`=0, `transformada`=false, rodada
  e vez da queda = rodada 2, vez do Lobo), eventos do registo
  (sem timestamps), sequência de mensagens e sequência de
  rolagens e totais ([6,16], [6,16]) **idênticos nas três** —
  só muda o tempo de relógio: **1× = 16,9 s; 2,5× = 6,9 s
  (rácio medido 2,45); 3× = 5,8 s (rácio medido 2,94)** —
  tolerância generosa face ao escalonamento de timers e aos
  15 ms fixos do movimento da vista falsa. Os `durationMs` dos
  3 movimentos da corrida escalam exactamente (×2,5/×3 sobre os
  valores de 1×) e os 6 anéis de impacto medem 480 ms / 192 ms /
  160 ms conforme a velocidade. **(N2) Troca a meio** — troca
  1×→3× com um movimento em voo e depois 3×→1× com outro
  movimento em voo: a batalha termina (FIM) e o canónico fica
  **idêntico** ao da corrida de referência à mesma semente
  (rolagens 2 = 2, eventos 28 = 28 — sem acções
  perdidas/duplicadas), com zero alertas do Supervisor.
  **(N3) Supervisor limpo a 3×** — a corrida a 3× de N1 termina
  pelo FIM natural em 5,8 s com **ZERO alertas** e sem
  congelamento. **(N4) Ilegais a 3×** — as injecções do caso 8
  repetidas com velocidade=3 continuam bloqueadas antes, estado
  intacto (atacar fora de alcance, ataque-basico fora das
  condições, mover além da reserva, Transformação sem PA com
  alma livre a seguir 31 e sem débito). **(N5) Persistência** —
  escolher 2,5× grava `hudt1-velocidade='2.5'` e marca o `.on`;
  «recarregar» (contexto novo com o mesmo `localStorage`)
  restaura 2,5× com o `.on` no botão certo; a estrutura da
  linha confere (`.cfgrow` + `.cl` + `.seg` com os cinco
  passos, índice imediatamente a seguir ao Modo automático e
  antes de `#stats`); sem nada guardado → 1× por omissão;
  valor estranho `'99'` → 1×. **(N6) Sagrados** — SHA dos 5
  sagrados intactos no fim de toda a bateria.
- **Correcções pré-publicação (03/11/2026, passagem única do
  executor de correcções, sob os dois julgamentos de entrega
  — ambos LIBERADO COM RESSALVAS):**
  1. **Anel de impacto no elemento certo** — origem: Crítico A
     (Fidelidade/Sistema), **Achado 1** e condições da ressalva.
     Em `mostrarImpacto` (`jogo.js`), a duração passou do span
     `.impacto` (sem animação própria; não é herdada) para o
     filho `<i>` dono de `impactoExpande`:
     `el.firstElementChild.style.animationDuration =
     (480/velocidade) + 'ms'`. O contentor fica como estava
     (`lancarFlutuante(..., 480, 'impacto')`, já escalado por
     `ritmo()`); `jogo.css` não muda por esta correcção.
     **Harness corrigido no mesmo sentido:** o DOM fictício da
     bateria foi estendido o mínimo necessário (getters
     `firstChild`/`firstElementChild` e o `innerHTML =
     '<i></i>' passa a expor esse `<i>` como filho real) e a
     medição de **N1/N3 passou a afirmar `animationDuration`
     no elemento `<i>`** — 480/192/160 ms a 1×/2,5×/3×, com os
     mesmos 6 impactos. **Prova em navegador real NÃO feita**
     (esta VM não tem navegador nem GPU): o que fica provado
     é o alvo correcto por construção CSS (a duração inline
     no próprio elemento dono da animação sobrepõe-se à
     duração do shorthand) + a asserção da bateria sobre esse
     elemento — a frase do ponto 4 acima foi corrigida para
     dizer exactamente isto, e a confirmação visual final
     fica para o olho do Mestre no telefone.
  2. **Encaixe da linha «Velocidade» empilhada** — origem:
     Crítico B (Experiência/HUD/Imersão), **Achados E1+E2**
     (condição antes de publicar; correcção preferida dele,
     opção 1). Medido por ele: largura útil do `#cfgpop` a
     390 px = **226 px**; a linha lado-a-lado media
     **245–248 px** (excesso de 19–22 px; o `3×` ficava
     cortado). Correcção mínima aplicada: em `jogo.js`,
     `linhaVelocidade.className = 'cfgrow vel'`; em
     `jogo.css`, SÓ duas regras novas —
     `.cfgrow.vel{flex-direction:column;align-items:stretch;gap:5px}`
     e `.cfgrow.vel .seg button{flex:1}` — nenhuma outra regra
     mudou. **Re-medição pelo método do crítico:** o rótulo
     fica por cima, na sua própria linha; a `.seg` ocupa a
     largura útil toda (226 px) e cada botão fica com
     **(226 − 2) / 5 ≈ 44,8 px de largura** (os 2 px são as
     bordas da `.seg`) × **44 px úteis de altura** (46 px da
     `.seg` menos as bordas) — encaixe resolvido sem corte e
     E2 resolvido com ele (antes 32,5–41,7 px de largura). A
     posição no DOM não mudou (depois do Modo automático,
     antes de `#stats`) e a **N5 continuou a passar** sem
     lhe tocar na estrutura, só na classe.
  **Re-corrida após as correcções:** bateria T1.6 inteira
  outra vez **27/27 PASS** (`node --check jogo.js` OK; na
  corrida de N1: 1× = 16,8 s, 2,5× = 6,8 s — rácio 2,47,
  3× = 5,6 s — rácio 2,99; anéis no `<i>` 480/192/160 ms).
- **SHA finais (após as correcções):** `jogo.js` 101.394 B
  `e7cc290455628b5df942ce028447cb08378a623988ed364b30c31ca56fa88e5d`;
  `jogo.css` 15.069 B
  `b4dc6924788f412ca0a3cb7efddd24d2452612c1a13fb12f44764615ba0a7c27`
  (na construção da tranche estava intocado — 14.974 B
  `19ae8c96…6751d`; mudou SÓ nesta passagem de correcções, com
  as duas regras `.cfgrow.vel` acima);
  sagrados reconfirmados no fim: `cena.js` `bcc99436…d5d7d59`,
  `mundo.js` `433c35a9…a0121f`, `index.html` `67203d81…51e`,
  `imagens/lobo.jpg` `0187007b…938a`, `imagens/orc.webp`
  `7d0c20c1…5156` — todos iguais aos do início da tranche.
  **Não publicado** (a publicação é fase posterior, após
  críticos; notebook/PC não contactados).

## Tranche T1.7 — Supervisor-Crítico: padrões, anotações e análises (03/11/2026)

- **Pedido do Mestre (03/11/2026 11:47, refinado às 11:50):** o
  Supervisor passa a ser também um **crítico**: «quero padrões,
  quero anotações, quero análises» — dicas de melhoria nas
  mecânicas, nas artes, na máquina, nas animações e na
  jogabilidade, a partir de um olhar de DENTRO do jogo (os
  códigos e as movimentações), não da tela. Desenho fechado:
  `goals/jogo-campo-de-batalha-do-rpg-assimila-o/files/reconstrucao-3d/DESENHO-T17-SUPERVISOR-CRITICO.md`.
  **Nesta tranche só mudaram `jogo.js`, `jogo.css` e estas
  NOTAS. Não publicado** (publicação é fase posterior, após
  críticos — o executor desta tranche não publica nem julga).
- **A camada é passiva e aditiva:** observa os eventos que já
  passam pelo `supRegistar` da T1.5 e pelas fronteiras que já
  existem (relógio de invariantes de 500 ms, tratador de `stats`
  ≤1/s, `moveend`, fronteiras de turno/rodada, `passarVez`) —
  **nenhum ciclo novo por frame**. Nunca altera uma acção, um
  número ou um ritmo. Toda a validação/congelamento/snapshots
  da T1.5 e tudo o que a T1.6 escalou ficaram intocados; os 27
  casos herdados da bateria continuam verdes (ver bateria).
- **DECISÃO — o `path` FICA no evento `mover` (do coordenador,
  registada aqui como mandado):** o caminho está disponível nos
  três pontos de registo e passou a ser gravado como lista de
  `{x, y}`: monstro (`destino.path`, no registo de `vezDaIA`),
  Ong por toque e Ong automática (parâmetro novo `path` de
  `supPartidaMovimentoOng`, com `destino.path`); a seta é passo
  de 1 casa e grava caminho = [actual, seguinte]. É aditivo ao
  formato do registo e os caminhos são iguais a qualquer
  velocidade — a identidade de resultados da T1.6 (caso N1)
  continuou a bater nas três velocidades com o campo presente.
  Sem isto, M2/M3 não teriam matéria: lêem os caminhos reais
  dos eventos.
- **REGRA DE NORMALIZAÇÃO PELA VELOCIDADE (dura):** TODOS os
  limiares de tempo das dicas (M1, J2, A2-tempo-parado e
  esperas) **dividem pelo factor activo**: cada intervalo medido
  guarda a velocidade activa no seu início e compara contra
  `limiar ÷ velocidade`; a anotação carrega a **medida real**
  (ms) e o **limiar efectivo já dividido**. FPS (Q1) e tempos
  de frame (Q2) são tempo real de renderização — **não
  escalam**, como a T1.6 já estabeleceu. A1 mede em casas, não
  em tempo. Prova na bateria: caso **V2** — vezes de monstro
  artificialmente lentas disparam a dica M1 a 1× com limiar
  4.040 ms e a 3× com limiar 1.347 ms (razão medida **3,00**);
  caso **V1** — a batalha sadia a 3× de N1 gera **zero** dicas
  de ritmo (M1/J2 calam).
- **Anotação e superfície:** cada dica é o objecto do §3 do
  desenho — `{id, batalha, segmento, rodada, vez, actor,
  categoria, padrao, medida, limiar, cronico, texto}` — com a
  frase em palavras simples. A lista **«Dicas do Supervisor»**
  vive em `#cfgpop`, **antes de `$('stats')`**, na mesma zona
  do Supervisor da T1.5, agrupada por categoria e renderizada
  como os alertas («Rodada 2 · vez do Lobo — …»). **Zero**
  presença fora das configurações: nada em `say()`, nada na
  barra, nenhum ícone novo (imersão 100% — o caso B11 audita o
  histórico inteiro de frases). A exportação (`supExportar`)
  ganhou `dicas: [...]` e `analises: {...}` **sem remover**
  nenhum campo actual.
- **Tectos declarados:** máximo **12 dicas por batalha** e
  **≤3 por categoria**; prioridade = repetições × desvio ao
  limiar, e padrão crónico sobe sempre (×10). Dedupe por chave
  padrão+actor+assunto: a mesma dica não se repete; se a medida
  **dobrar**, a entrada actualiza. **Excepção declarada aos
  padrões de totais (M3, M4, M5, A3):** passam `actualizar` —
  como só fazem sentido com a batalha completa, a anotação
  final reflecte o total final, que é o número que os críticos
  recalculam na bateria (caso B7). O que o tecto corta conta em
  `analises.cortadas` — silêncio sobre o corte é proibido.
- **Segmentos:** um `supRestaurar` com sucesso fecha o segmento
  corrente e abre um novo (`segmento` ++); os acumuladores
  **não cruzam o corte** e as dicas já emitidas ficam marcadas
  com o seu `segmento` (caso B10: uso de casas do segmento novo
  = 0 contra 43 do apagado; nenhuma dica do padrão antigo
  renasceu como segmento 2).
- **Agregado entre batalhas:** `localStorage`, chave
  **`hudt1-analises`**, **só contadores, nunca dados de
  fichas**: n.º de batalhas, histograma da rodada da queda, uso
  acumulado das 70 casas, distribuição acumulada de alvos da
  Ong automática, mín./mediana de FPS por batalha (tecto: as
  últimas 50), contagem de deslize por figura e contagem de
  padrões por chave. Padrão repetido em **≥3 batalhas** =
  **crónico** (`cronico: true`; a frase ganha «Já aconteceu em
  N batalhas.»), contado **uma vez por batalha** por padrão.
  Botão **«Limpar histórico de análises»** na área de
  supervisão — limpa **só** o agregado (caso B8: após limpar,
  dicas e eventos ficam com a mesma contagem).
- **Catálogo — o que ficou ACTIVO (todos com medida e limiar
  do desenho):** **M1** ritmo por turno (mediana por tipo vs
  envelope das esperas fixas + fórmulas de duração; vez isolada
  >2× o envelope sem movimento longo) e ritmo por rodada;
  **M2** caminhos repetidos (caminho exacto ≥2× pelo mesmo
  actor, com a assinatura normalizada — a primeira casa igual
  à origem sai da assinatura, para a seta e o toque compararem
  igual) e destino concentrado (≥60% com ≥3 movimentos);
  **M3** mapa de uso/zona morta no fim (≥35% das 70 casas nunca
  pisadas; quadrante nomeado em palavras simples); **M4** foco
  de dano sofrido (>60% de um só monstro) e foco cego da Ong
  automática (100% de ≥3 ataques no mesmo alvo havendo outro
  vivo mais perto ou igual em alguma dessas vezes — as
  distâncias são lidas no momento de cada `ataque-basico`);
  **M5** queda fora da janela (1.ª rodada ou além da 5.ª) e
  dano concentrado (>70% numa só rodada); **M6** acções
  desperdiçadas (a: ela fecha ≥2 vezes sem atacar com ≥4,5 m
  por gastar e alvo ao alcance — lido em `passarVez`, antes do
  reset da reserva; b: monstro fecha ≥2 vezes sem andar nem
  atacar; c: ≥3 recusas iguais); **V1** figura da vez <40 px em
  ≥50% das amostras da sua vez; **V2** >25% de amostras fora do
  ecrã ou figura da vez fora numa fronteira de turno; **V3**
  pares com sobreposição >50% do recto menor em ≥2 amostras
  seguidas; **Q1** série de fluidez (≥20% das amostras <30 FPS,
  lacuna >2 s via eventos `fluidez`, queda única >20 FPS sem
  recuperação em 3 amostras); **Q2** p95 dos tempos de frame
  do troço >33 ms com FPS médio da rodada ≥50 (o troço é o
  segmento novo de `getFrameTimes()` desde a rodada anterior;
  com séries curtas/injectadas usa-se a série toda); **Q3**
  peso da cena (um modelo >60% dos triângulos nas fronteiras
  de turno; total a subir >25% entre fronteiras sem figura
  nova); **Q4** carregamento (arranque→`ready` >3 s, marcas
  `performance.now()` da casca); **A1** deslize por troço com a
  regra de honestidade abaixo; **A2** estátua por construção
  (modelo sem nenhum clipe, medido via `models[].clips`) e
  tempo parado (>20 s normalizados sem agir nem se mexer);
  **A3** ataque sem gesto (estrutural, uma vez por batalha, no
  fim, com o total final: 100% dos ataques sem gesto — a casca
  resolve o golpe de forma instantânea + anel e a API da cena
  não tem gesto de ataque); **J1** vez vazia ≥2; **J2** espera
  de quem joga (mediana >12 s ou isolada >20 s, normalizadas);
  **J3** frustração (≥3 recusas seguidas do mesmo tipo, ou ≥5
  do mesmo tipo na batalha); **J4** automático (≥2 movimentos
  automáticos que não reduzem `distanciaEntre` ao alvo —
  medido partida→`moveend` — ou ≥2 vezes automáticas fechadas
  por «sem destino», contado no ramo próprio de
  `passoAutomatico`).
- **A1 — regra de honestidade aplicada à letra:** segmento =
  partida registada → `moveend`; células = caminho do evento.
  Se o modelo **não tem** clipe de andar (`models[].clips` sem
  nome de andar) → deslize por construção, o troço inteiro (é
  o estado actual do elenco: na corrida de prova do caso B1,
  deslize medido Ong 6, Capanga 5, Orc 7 casas). Se **tem**
  clipe, só se afirma deslize com amostras de
  `getStats().animations.walk` caídas **durante** o segmento,
  todas a 0; amostras só nas bordas (partida/chegada) **não**
  contam; **sem amostras dentro, não se afirma** — o troço
  conta em `analises.animacao.segmentosNaoMedidos`. Sem
  `stats` nenhum, os clipes são desconhecidos e o A1 cala
  (não inventa a medida).
- **LACUNAS DECLARADAS (versões honestas, sem medida
  inventada):** (1) **M1 na vez MANUAL dela: sem envelope** —
  o tempo de pensar de quem joga não tem esperado honesto;
  os turnos manuais dela guardam-se em `analises.temposTurno`
  com `envelopeMs: null` e o M1 ignora-os (a vez automática
  dela tem envelope: passos do controlador × 850 ms +
  duração do movimento). (2) **A2(c) idle por figura: não
  emitido** — `animations.idle/advancing` da cena são
  contagens agregadas sem identidade por figura (limite §10
  do desenho); o A2 diz o que sabe (clipes por modelo e tempo
  parado por figura) e cala o resto. (3) **Q4:** a marca de
  arranque é o `performance.now()` da avaliação do módulo do
  Crítico dentro da IIFE (fim da avaliação inicial da casca),
  não o instante zero da navegação — mede-se arranque da
  casca→`ready`, declarado assim. (4) **V2 por movimento:** a
  amostragem é a comum (fronteiras + relógio de 500 ms +
  `stats`/`moveend`, ≤2/s) — não há amostragem dedicada por
  movimento além desses pontos, como o desenho permite
  («amostragem, não cinema»). (5) O nome de andar nos clipes
  detecta-se por /walk|andar/i sobre `clips[]` — um clipe de
  andar com outro nome seria lido como «sem clipe de andar»
  (deslize por construção); com o elenco actual (sem clipes)
  a leitura é exacta.
- **Bandeira de teste do caso B9 (declarada):**
  `localStorage 'hudt1-crit-off'='1'`, lida só no arranque,
  desliga acumuladores e motores (exportação devolve
  `dicas: []` e `analises: {desligada: true}`). É invisível:
  nenhuma superfície a mostra e nenhuma preferência da página
  a escreve — existe só para a bateria medir o custo da
  camada. Método do B9: mesma semente e batalha automática
  completa ligada vs desligada, com a mesma série de FPS
  injectada (60) nas duas — duração dentro de 2% e FPS médio
  das amostras registadas comparado sobre essa série igual.
- **Correcções durante a construção (achados da própria
  bateria, antes de fechar):** (1) **A3 duplicado e com
  medida intermédia** — a primeira corrida deu 39/40 com o B7
  a apanhar duas anotações `ataque-sem-gesto` (a chave incluía
  o actor, que muda) e a medida 4 contra 6 eventos de ataque
  no fim: o A3 passou a anotação única de batalha (actor
  `null`, âncora na última figura que atacou), avaliada **só
  no fim**, com o total final. (2) **`innerHeight` em falta na
  vista falsa matava o motor visual a meio** — a referência
  sem guarda rebentava `supCritAvalV` antes do V2/V3 (no
  navegador real `innerHeight` existe sempre); a leitura do
  viewport passou a ser guardada (dimensão em falta não
  limita — degradação honesta) e o B11 foi reforçado para
  afirmar os padrões visuais nominalmente (na corrida seguinte
  o tecto da categoria visual desalojou o V1 pelo V3, de
  prioridade maior — comportamento do desenho; a prova do V1
  passou a sub-cenário isolado do B11, onde só ele dispara).
- **Bateria T1.7 (harness Node derivado do da T1.6 —
  `hidden_files/bateria-t17/bateria-t17.mjs`, com o despejo
  JSONL agora em `bateria-t17/registo-supervisor.jsonl`;
  saída em `hidden_files/bateria-t17/saida-bateria-t17.txt`):
  40/40 PASS** (`node --check jogo.js` OK; corrida total
  ≈7 min). **Os 27 casos herdados (T1.5+T1.6) continuam
  verdes** — incluindo N1 (identidade nas três velocidades já
  com o campo `path` nos eventos) e o caso 13 (completude do
  registo: 34 linhas, 7 acções da IA, timestamps em todos,
  zero alertas), **sem nenhuma falha nesta corrida** (nem o
  flaky conhecido do caso 13 se manifestou). Casos novos:
  **(B1) Deslize** — stats injectados com `walk` a 0 e modelos
  sem clipes: dicas A1 com âncora certa e medidas iguais às
  casas dos caminhos (Ong 6, Capanga 5, Orc 7).
  **(B2) Zona morta** — B2a: batalha normal dispara com medida
  79% recalculada do mapa de uso (15/70 usadas) e a zona
  nomeada certa («o canto de cima, à esquerda»); B2b: batalha
  encenada com 10 teletransportes por turno (46/70 casas
  pisadas) → M3 cala. **(B3) Repetição** — mesmo caminho 2× →
  exactamente 1 dica «mesmo caminho» (dedupe), medida 2;
  caminhos variados → M2 cala. **(B4) Queda** — fixture de
  dano (Lobo com bónus 200, colado) derruba na 1.ª rodada →
  M5 dispara com medida 1; fixture de dano fixo 21/golpe com
  os três colados → queda na 3.ª com dano {1:21, 2:63, 3:21}
  (nenhuma rodada >70%) → M5 cala nos dois padrões.
  **(B5) Fluidez** — FPS injectado a 18 → Q1 (medida 100% das
  amostras <30, texto nomeia os 18); série estável a 60 com
  frames de 16 ms → Q1/Q2 calam e o modelo com 700/1000
  triângulos dispara o Q3 com medida 70; FPS médio 60 com
  p95 de frames = 50 ms → Q2 dispara com medida 50.
  **(B6) Vez vazia + frustração** — 3 recusas seguidas «Sem
  alvo escolhido» → J3 (medida 3, razão nomeada no texto);
  2 vezes vazias → J1 (medida 2). **(B7) Batalha limpa
  completa** — 6 dicas presentes (3× figuras-coladas da vista
  falsa de rectos idênticos, zona-morta, dano-concentrado,
  ataque-sem-gesto), **todas recalculadas por fora** a partir
  do registo/análises (problemas = 0), tectos 12/≤3 por
  categoria respeitados e zero alertas do Supervisor.
  **(B8) Exportação** — JSON com `dicas` e `analises` e
  âncoras completas; o agregado soma a 2.ª batalha sem
  duplicar a 1.ª (batalhas 1→2; uso 38 = 38 e depois
  76 = 38+38; quedas somadas = 2); «Limpar histórico» zera o
  agregado e só ele (dicas 6=6, eventos 28=28). **(B9)
  Desempenho** — desligada 16.855 ms vs ligada 16.787 ms
  (diferença **0,40%**, limiar 2%; na corrida anterior à
  última correcção: 0,54% e 0,02% — sempre dentro) e FPS
  médio das amostras igual (60,0 vs 60,0). **(B10) Restauro
  não mistura** — segmento novo (uso 0 < 43), dicas antigas
  marcadas com o segmento 1. **(B11) Superfície limpa** —
  zero texto da camada nas frases do mundo durante toda a
  corrida; padrões visuais V2/V3 disparados pela vista falsa
  e V1 provado no sub-cenário isolado (Orc a 30 px, medida
  30); `#sup-dicas` em `#cfgpop` antes de `#stats`.
  **(V1/V2) Velocidade** — ver a regra de normalização acima
  (V2: limiares 4.040 ms a 1× e 1.347 ms a 3×, razão 3,00).
- **SHA finais:** `jogo.js` 149.799 B
  `2cc72e310e8d647341b78fde27fc0ccbc41a861ea2195a0f7c1752d8c25da225`;
  `jogo.css` 15.435 B
  `8f0229f263bdf715a6b77d11fc896d38b5e4f7c32ce4e8ca2baa8525892250e3`
  (mudou só na regra de contenção de `#sup-dicas`, gémea da de
  `#sup-alertas`); sagrados reconfirmados no fim: `cena.js`
  `bcc99436…d5d7d59`, `mundo.js` `433c35a9…a0121f`,
  `index.html` `67203d81…51e`, `imagens/lobo.jpg`
  `0187007b…938a`, `imagens/orc.webp` `7d0c20c1…5156` —
  todos iguais aos do início da tranche. **Não publicado**
  (publicação é fase posterior, após críticos; notebook/PC
  não contactados).

**Adendo do fecho (03/11/2026, executor de fecho — por cima do
estado que o coordenador antigo e o executor dele deixaram em
disco às 14:22; verificado item a item contra os dois
julgamentos antes de qualquer toque):** objecto do fecho =
`jogo.js` 157.275 B, sha256
`c7b899785173b1c7a10a5b84453012635b242883736e4bba51a405eb915ac3c4`;
`jogo.css` 16.086 B, sha256
`0f76ebb77e2235e4c5b62b6988605d93677035bf1e3c9829390ad39d5ac5003d`
(difere do objecto julgado: é o objecto julgado MAIS as
correcções abaixo, já aplicadas quando o fecho começou —
conferidas uma a uma na fonte, nenhuma aplicada duas vezes).

Correcções do julgamento de Experiência (todas na fonte):
R-EXP-1 (A1 «sem dar um passo»), R-EXP-2 (J2 mediana sem a
decomposição não medida), R-EXP-3a (Q4 só com o tempo medido),
R-EXP-3b (M5 «A batalha está mais dura do que devia.»),
R-EXP-4a (nota `<small>` do histórico entre batalhas no
rótulo), R-EXP-4b (estado vazio «Ainda não há dicas nesta
batalha…»), R-EXP-5 (`ambito` nas dicas de batalha inteira:
M3/Q1/Q3-crescimento/Q4/A3), R-EXP-6a (categoria com respiro
no CSS) e 6b (`scrollTop` da lista preservado na
re-renderização), R-EXP-7a (Q2 com o p95 em ms), 7b (Q3
crescimento com %), 7c (M1 mediana com o esperado calculado),
7d (V1 «pontinhos de ecrã (px)», V2 «momentos»).
Correcções do julgamento de Fidelidade: F1 (o ramo `restauro`
esvazia também as séries de amostras — enquadramento, FPS,
fronteiras e frames não cruzam o corte), F2 (M4 avalia SÓ no
fim — sem veredicto a meio da batalha), F3 (V2 agrupado por
movimento, não por amostras soltas), F4 (Q2 exige FPS médio
medido ≥ 50), e os reforços F10.4 (Q3 salta pares de fases com
n.º de modelos diferente) e F10.7 (contador
`analises.errosCamada` no registo exportado, sempre presente).
Bateria de aceitação das correcções: casos novos B10–B25
(B11/B13–B18/B20–B23 provam as correcções na fonte viva).

**Caso B21a — diagnóstico e reparação do APARELHO (a asserção
não mudou).** Na primeira corrida completa do fecho, 61/62:
o B21a (mediana do M1) falhava sem a dica existir. Sondas
medidas: os dois turnos lentos do lobo fechavam (6.842 ms e
6.805 ms; envelopes 2.020/2.370 ms — a mediana tinha de
disparar: 6.824 > 2.195×1,4), mas a batalha CONGELAVA na
rodada 2: o moveend atrasado de 20.000 ms teleportava o lobo
para o destino velho já na vez de outro actor, por cima da
figura que entretanto lá chegou — invariante do Supervisor
«Duas figuras na mesma casa» → alerta com `congelou: true` →
fim terminal por congelamento. Por desenho julgado da T1.5,
um fim por congelamento não corre a avaliação final do
crítico nem abre a fronteira da rodada seguinte: a mediana
nunca era avaliada. O defeito era do cenário do caso (um
estado que a pilha real impede por construção: animações em
série, destino fresco), não do motor nem das correcções — a
lógica da mediana conferiu certa à mão sobre os turnos
medidos. Reparação: o atraso do aparelho passou de 20.000 ms
para 5.300 ms — a guarda da IA (5 s) continua a fechar a vez
antes do moveend chegar (o fenómeno sob teste), mas o pouso
cai dentro da cauda da própria vez do lobo (a vez fecha aos
~6,8 s), em casa livre: sem congelamento, a batalha chega à
fronteira da rodada 3 e a mediana dispara (medido: dica com
medida 4.553 > limiar 3.024 e a frase do esperado da
R-EXP-7c). Caso B19 reescrito na mesma lógica honesta pela
passagem anterior: afirma o invariante (contadores abaixo do
limiar ⇒ a camada cala) em vez da contagem exacta que variava
entre corridas.

**Ramos activos, por provar em bateria (marcação F5 —
declarados, não escondidos):** (1) J4 `automatico-sem-destino`
com contagem ≥2; (2) J4 `automatico-sem-aproximar` com
contagem ≥2 (neste harness os contadores medem 0–1 por
corrida: o limiar 2 não é alcançável honestamente aqui —
prova fica para a cena real); (3) M2 `destino-concentrado`
no ramo positivo (a bateria prova os negativos: <3 movimentos
e disperso calam). Todos os outros ramos positivos têm
asserção verde na corrida final, incluindo A1 com clipe de
andar (B25a) e Q3 crescimento positivo (B23, 29% medidos).
**Declaração F6 (extrapolação do A1):** com amostras de
posição escassas, UMA amostra interior medida a deslizar
(zero casas andadas com a figura deslocada no ecrã) faz o
troço inteiro contar como deslize — é extrapolação declarada
do desenho, não medição contínua. **Registos F7:** os
limiares dos padrões agregados dividem pela mediana das
velocidades do grupo (não por uma velocidade nominal), e a
«razão 3,00» do V2 é aritmética sobre o mesmo envelope, não
uma segunda medição independente. **Registo F10.3:** no
Q1-queda, «não recupera» lê-se como: a mediana das 3 amostras
de FPS seguintes fica abaixo do nível anterior − 10. **F8**
(B9 com n≥3 e medição na cena real) fica como prova de
telefone do Mestre, aceite pelo crítico para esta tranche.

**Bateria final do fecho (sobre os ficheiros finais):
62/62 PASS, exit 0** — os 27 herdados das tranches anteriores
(identidade de resultados nas 3 velocidades incluída), os
casos da construção da T1.7 e os casos novos das correcções
B10–B25; sagrados intactos no fim (caso 7/N6) e
`node --check` OK. Saída guardada em
`bateria-t17/saida-bateria-t17-final.txt` (pasta da bateria).
Publicado a seguir pelo notebook (ver relatório
RELATORIO-T17-SUPERVISOR-CRITICO.md para o commit).

## Tranche B4 — Representantes KayKit na página (03/11/2026)

- **O que entrou:** a Ong e o Capanga 1 deixaram de ser
  marcadores e passaram a ser os GLB KayKit com esqueleto —
  `modelos/ong-rogue.glb` (516.788 B, SHA-256
  `ca8bd967ade6ea1f310a3fc4274164e9fbc53f72f36534592a19273f3d1ddb74`)
  e `modelos/capanga-knight.glb` (445.276 B, SHA-256
  `0e357966e12c53f98e12df4ad62eb1505d56069f1671b9323401a08134b78854`),
  CC0, construídos na Rodada 3 do Codex e validados por render
  lá e na sonda desta integração. Mudança cirúrgica: **só as
  duas linhas do `ELENCO`** neste `jogo.js` (modelo + `animacoes`
  com apenas `idle: 'Idle_A'` e `andar: 'Walking_A'` — o mínimo
  que a cena congelada aceita; **Punch/Hit NÃO declarados**: a
  cena R2 rejeita essas chaves e eles só entram com a
  convergência/`apresentarAtaque`). Posições, nomes, ids e
  alturas (1,75/1,8 m) não mudaram. `cena.js`, `mundo.js`,
  `index.html` e `vendor/` intactos ao byte (SHA conferidos
  antes e depois). O Orc continua `orc-t1.glb` **estático** (o
  rig dele está reprovado por render) e o Lobo continua
  `marcador-lobo`.
- **Estatuto (decisão delegada X2 da bancada, literal):** estas
  duas figuras são **provisórias, elenco TEST, não jogáveis** —
  entram como representantes visuais animados das personagens
  de teste; a **promoção a jogáveis fica pendente do olho do
  Mestre**, figura a figura, ao ver o render. Nada deste
  estatuto aparece na tela (imersão 100%): na página são só a
  Ong e o Capanga com corpo novo.
- **Licenças (R6 do julgamento do desenho):** copiados os
  textos CC0 da mesma pasta-fonte no clone do PC
  (`mapa3d-codex\mapa3d\modelos\`):
  `modelos/LICENSE-KayKit-Adventurers.txt` (1.554 B, SHA-256
  `d4adc31660d1db22eb60eba648e01db41577548f6fa1a3576cb4a6283dae0a58`)
  e `modelos/LICENSE-KayKit-Animations.txt` (1.548 B, SHA-256
  `373b159044d1a886ed15f57ca5a7673ba14e2623c460283452705f2056912ed9`).
  Custo total da tranche em disco: +962.064 B de modelos
  (+3.102 B de licenças).
- **Efeito medido no Supervisor-Crítico (Q3):** a parte do Orc
  no total de triângulos da cena caiu de **62,6%**
  (49.750/79.520) para **53,7%** (49.750/92.658 medidos) —
  **abaixo do limiar de 60%** do padrão Q3 «peso-da-cena»: a dica do Orc **deixa de
  poder nascer** por essa via. É mudança de comportamento
  registada de propósito (não é avaria). A dica «estátua» (A2)
  deixa de poder nascer para Ong e Capanga (têm clipes) e
  **continua correcta para o Orc e para o Lobo**.
- **Arranque (R2):** tempo até `view.ready` resolver, medido
  com o mesmo instrumento (relógio da página) antes/depois no
  PC com GPU real: **295 ms → 447 ms** — limiar de 3 s
  cumprido com folga; o custo novo é +152 ms por +962 KB de
  modelos com esqueleto. São **amostras únicas por estado
  (n=1)**; a leitura apoia-se na corroboração cruzada da VM
  sem GPU, onde o mesmo relógio mediu 3.648 ms → 5.557 ms
  (+52%, a mesma assinatura de custo que os +51,5% do PC) já
  com 3.648 ms ANTES da tranche, a 3,4 FPS em SwiftShader —
  artefacto do ambiente, não da página; fica registado para
  ninguém o ler como medida do alvo. **A medição de FPS da
  cena no celular do Mestre (dívida F1) continua em dívida** —
  esta tranche não a fecha: os FPS registados na bateria são
  de VM/PC, não do aparelho dele.
- **Caveats (R4):** (1) o contador `advancing` do `getStats`
  **não cai quando uma figura cai** (`stopAllAction()` não
  zera `mixer.time` e o ciclo deixa de actualizar caídos) —
  `advancing` **não serve como prova de paragem**; a queda
  prova-se por `idle` a cair e pelo rect projectado. (2) Com
  clipes reais, o A1 (deslize) da Ong e do Capanga passa ao
  ramo «com clipe»: só afirma deslize com amostras DURANTE o
  movimento, e os `stats` da cena saem a ≤1/s contra
  movimentos de ~180 ms/casa — espera-se que a maioria dos
  movimentos reais caia em «não medidos» (perda de cobertura
  conhecida e aceite no desenho, não defeito novo). Na
  bateria, o andar mediu-se com sondagem apertada (~40 ms
  pedidos) e `durationMs` alargado declarado (800 ms/casa,
  4,4× o passo normal da página).
- **Re-prova F1 (R1):** a bateria viva T1.7 correu **completa**
  sobre a página nova — **62/62 PASS** — com as fixtures
  chaveadas aos modelos antigos actualizadas para as duas
  chaves GLB novas (`MODELOS_EQUI`, mapa rígido do caso B7,
  `pesados` do B5b, fases do B23, `modelosWalk` do B25 e a
  asserção de `clipsPorModelo` do B25b); sem a actualização, os
  clipes da Ong e do Capanga liam-se `null` e a cobertura de
  deslize/estátua degradava em silêncio.
- **Bateria da tranche: 22/22 verificações PASS** na página
  real (driver CDP próprio, artefactos em
  `integracao-b4/bateria-b4/`): identidade dos sagrados e dos
  GLB; arranque limpo (0 erros, as 4 figuras nas casas
  actuais); modelos com 7.562/5.800 triângulos e os 4 clipes
  cada; `idle: 2` em repouso; andar real dos dois
  representantes até ao `moveend` (Ong: 141 amostras, `walk=1`
  em 140; Capanga: 148 amostras, `walk=1` em 147; posições
  finais certas); queda do Capanga (`idle` 2→1, rect 43×34 —
  mais largo que alto = deitado) e levantar; guardas de
  privacidade (campo `vida` e chave `ataque` em `animacoes`
  rejeitados, sem unidades fantasma, estado público só com as
  5 chaves de sempre); **batalha real** até à queda da Ong,
  exportação varrida (os nomes de clipe vivem só em
  `analises.animacao.clipsPorModelo`; nenhum nome de clipe nem
  «KayKit» fora das configurações), **Recomeçar** e **«Voltar
  ao último estado bom»** com a Ong animada caída — de pé
  outra vez (rect 37×38, mais alto que largo; `idle` de volta
  a 2); fumo da casca (seleccionar a Ong com clique no canvas
  e abrir as configurações); **0 erros de página** em toda a
  corrida. Capturas vistas com olhos (regra da casa): repouso
  em 844×390 e em 390×844, e andar dos dois representantes
  em 844×390 com a câmera «seguir» — limpos, sem mosaico, sem
  esticões, pés assentes, etiquetas certas; na vista fixa de cena inteira as figuras lêem-se
  pequenas (o enquadramento da página, que esta tranche não
  muda) e na câmera «seguir» lêem-se de perto, nas duas
  orientações.
- **Reversão (corrigida, R5):** reversão **funcional** de um
  gesto — repor **verbatim** as linhas originais 35–36 do
  `ELENCO` (as dos marcadores, guardadas na cópia pré-tranche)
  e apagar os dois GLB e as duas licenças de `modelos/`. Não é
  reversão ao byte do ficheiro `jogo.js` (a formatação das
  linhas novas difere), esta entrada das NOTAS fica (é
  registo), e depois de publicada a reversão exige nova
  publicação — um gesto local não despublica nada.

## Tranche T-A — Descongelamento da cena (X1): R2 → R3 (03/11/2026)

- **Autorização:** X1 — FUSÃO DECLARADA (bancada, `DECISOES-DELEGADAS-INTEGRACAO.md`),
  passo 2, sobre o desenho `DESENHO-CONVERGENCIA-FUNDACAO-REV1.md` §1.4–§1.5.
  O gelo de `cena.js`/`mundo.js` levantou-se **só dentro desta tranche** e
  volta a fechar no fim desta secção (recongelamento). Execução no PC
  (PCDANASA), padrão da cerimónia §1.5. Relatório completo:
  `reconstrucao-3d/RELATORIO-TA-DESCONGELAMENTO.md`.
- **Pré-voo (PC):** clone `mapa3d-codex` @ HEAD
  `81b31b3f44b6036c25a47d77ea9f979fa4c3f482` (branch `codex/mapa-3d`),
  árvore limpa excepto `MISSAO.md` não-tracked preservado (3.259 B,
  SHA-256 `9b218cf5db03ace66f1ea25c6190fd57b1431fb3231dfed099eca1124810cdee`);
  par R3 no clone = manifesto de entrada ao byte. Página viva conferida:
  `jogo.js` servido = `fcf5661d…` (B4).
- **Condição C1 (LEITURA-PENT2 §6) — PASSA, antes de qualquer troca:**
  trio temporal de Idle EM CENA re-corrido no PC com GPU real (ANGLE
  NVIDIA GeForce RTX 4060, Direct3D11; ~60 FPS — não SwiftShader),
  método R3 via `projectUnit`, com prova de câmara assentada (rect de
  controlo estável: 5 amostras idênticas ao milésimo, variação 0,0 px,
  em ~1,26 s por figura). Ong: `cycleError = 0,00 px`, `midDelta = 8,93 px`.
  Capanga: `cycleError = 0,00 px`, `midDelta = 5,98 px`. Critérios do
  leitor: `cycleError < 2 px` e `midDelta ≥ 2 px` — **os dois cumpridos
  nas duas figuras**. Provas: `~/workspace/convergencia-t1/provas-c1/`
  (6 capturas + `medicoes-c1.json`).
- **Teatro (PC, `C:\Users\txcga\_ta-teatro\casca`):** cópia íntegra da
  casca B4 conferida por hash ficheiro a ficheiro (15/15 iguais à VM);
  nela substituídos **só** `cena.js`/`mundo.js` pelos bytes R3 do clone.
  **Fumo no teatro — 10/10 PASS** (GPU real, 844×390): arranque até
  `ready` em 498–521 ms; elenco completo nas casas da casca (área 10×7);
  estado público só com as 5 chaves; Ong 7.562 tri / Capanga 5.800 tri /
  Orc 49.750 tri, **`totalTriangles` medido da cena fundida = 96.426**
  (a conta que vale para o FPS, REV1 §2.3 — não a soma herdada);
  cartão de vista do Capanga abre ao toque; Mover+seta anda a Ong
  (6,2)→(7,2); Seguir e 360 respondem (360 por arrasto: rect do Orc
  desloca 103 px); batalha em Modo Automático a 3× corre até «A Ong
  caiu — fim desta batalha» (R2, ~8 s); Supervisor com **0 alertas**
  (29 eventos registados; 9 dicas do Supervisor-Crítico não são alertas);
  **0 erros de página**. Provas: `~/workspace/convergencia-t1/provas-fumo/`.
  `apresentarAtaque` entrou **inerte** (a casca não o chama; Punch/Hit
  continuam por declarar até T-D). Nenhum toque em `jogo.js` — o diff de
  API tinha provado 0 necessários (24 linhas: 18 igual · 6 adaptador ·
  0 ruptura).
- **Manifesto ANTES (cerimónia §1.5.1 — SHA-256 completos, árvore inteira):**

  | Ficheiro | Bytes | SHA-256 |
  | --- | --- | --- |
  | `cena.js` (R2, sai) | 32.153 | `bcc99436c3f005b5ffe292bb2515a82b90fb28b2e02457e2cfb527967d5d7d59` |
  | `mundo.js` (R2, sai) | 8.023 | `433c35a98fcbe63ecd1ce80be373c95d2e4e53b9a014e5747f615e2fa4a0121f` |
  | `index.html` | 4.422 | `67203d81822beaab93aecc8263baebf6b3cb708b2d472de3c452ed33dca1c51e` |
  | `jogo.js` | 157.394 | `fcf5661dfd79dbce966183a70def046d42125e29a36ec14a5a84ff763ab82e26` |
  | `jogo.css` | 16.086 | `0f76ebb77e2235e4c5b62b6988605d93677035bf1e3c9829390ad39d5ac5003d` |
  | `imagens/lobo.jpg` | 21.777 | `0187007b2b50d559fa759666aa2c9c66688fb1a6ff8fa390b0e440379254938a` |
  | `imagens/orc.webp` | 112.638 | `7d0c20c1e1eddf6c05977c0eb0339c44372788799e4afb67e3f2a479c9525156` |
  | `modelos/ong-rogue.glb` | 516.788 | `ca8bd967ade6ea1f310a3fc4274164e9fbc53f72f36534592a19273f3d1ddb74` |
  | `modelos/capanga-knight.glb` | 445.276 | `0e357966e12c53f98e12df4ad62eb1505d56069f1671b9323401a08134b78854` |
  | `modelos/orc-t1.glb` (residente, C2: inalterado) | 2.329.948 | `fe73cf889b32f86152e16caff68dc4b0491bbfb61d852ffc6106305120a8c3bd` |
  | `modelos/LICENSE-KayKit-Adventurers.txt` | 1.554 | `d4adc31660d1db22eb60eba648e01db41577548f6fa1a3576cb4a6283dae0a58` |
  | `modelos/LICENSE-KayKit-Animations.txt` | 1.548 | `373b159044d1a886ed15f57ca5a7673ba14e2623c460283452705f2056912ed9` |
  | `vendor/three.min.js` | 603.451 | `7ae04663bb431808bc025280122162029ea3a354efc5fcca8bd8f95d1a1933e9` |
  | `vendor/GLTFLoader.js` | 96.550 | `5c15967ba830918a9caea6338712c994c354bccd4edc4569bde411c3ec06a3e6` |
  | `NOTAS-T1.md` (antes desta secção) | 109.984 | `338fbfe8855e52d40eb8c3fddbd68e95a7fced1e6a423044ed70e42e273a6b19` |

- **Manifesto DEPOIS (só a cena mudou — diff de manifestos = 2 linhas):**

  | Ficheiro | Bytes | SHA-256 |
  | --- | --- | --- |
  | `cena.js` (R3, entra) | 38.376 | `89d092864507f3b31d4c776f36fbc153b5b715a846b666e12f0ef6cba31d8ae2` |
  | `mundo.js` (R3, entra) | 8.827 | `245f535a41690cb427411ce926f7987c457a512cd19c04db02a6dfb481f3b321` |

  Todos os restantes 13 ficheiros: hashes idênticos aos do manifesto
  ANTES (conferido por diff de manifestos sobre a árvore inteira).
  `node --check` passa em `cena.js`, `mundo.js` e `jogo.js` depois da
  troca (VM e PC).
- **RECONGELAMENTO (§1.5.6):** os novos `cena.js`
  (`89d09286…d8ae2`) e `mundo.js` (`245f535a…b321`) voltam a ser
  **ficheiros sagrados** nestes hashes. Qualquer toque futuro exige
  nova tranche autorizada. Os bytes R2 que saíram ficam identificados
  pelos hashes antigos no manifesto ANTES (âncora de reversão do ramo
  de retirada, REV1 §2.3) e preservados em
  `~/workspace/entrega-codex-rodada2/`.
- **NÃO PUBLICADO.** A publicação só vem depois da re-prova T-B e dos
  2 críticos. A página viva continua a servir a cena R2 (conferido:
  `cena.js` servido = `bcc99436…` no fim desta tranche).


---

## TRANCHE VLAB — combate verdadeiro pelo motor pinado (preparada 04/11/2026, por publicar)

**Origem:** recado da frente VLAB (03/11/2026 23:36, ordem do Mestre: integrar JÁ) — frente fechada e provada (bateria 39/39; contrato v1.1 + emendas v1.2).

**Pin verificado nesta frente, antes de tocar:** `vlab-completo.js` SHA-256 `28cb67b7b61d9a4b0f9f960d3d8687809bfcba806749566f3cee77c839ba7855` (71.216 B) e `vlab.js` `ab71357c0693c1b357b3f2b3328eb4c5f48a8b88d9bd90a00c272cf1621c5b3e` — copiado byte a byte para esta pasta e reconferido depois da cópia. A bateria da frente correu aqui: **39/39 PASS**; a prova de encaixe sem módulos, **PASS**. Os globais `window.Vlab`/`window.Dmg` são capturados no topo do invólucro e **apagados** (padrão da tranche LEVEL UP): o motor nunca fica acessível na consola.

**Base (correcção registada):** esta cópia empilha sobre o estado FINAL julgado da tranche LEVEL UP (relatório dela: juiz cobriu o artefacto final com o pin v2.1) — incluindo o re-pino do `levelup.js` para a **v2.1** (`f0b61973…a247`), que uma primeira cópia desta pasta ainda trazia na v1; a divergência foi detectada por `sha256sum` contra a pasta da antecessora e corrigida antes das provas finais (ficheiro + linha de comentário no `jogo.js` + estes parágrafos das NOTAS alinhados ao texto final dela; o resto do `jogo.js` diverge da antecessora só pelas edições VLAB).

**O que muda nesta cópia:**
1. `index.html`: `<script src="vlab-completo.js"></script>` entre `levelup.js` e `jogo.js`.
2. `jogo.js`: bloco «combate VLAB» (adaptador) + resolução de TODOS os ataques pela chamada única `vlabResolverAtaqueCompleto` → `Vlab.resolverAtaque`. O resolvedor local provisório da T1.4 saiu (`rolarExpressao` apagada; `sofrerDano` apagado).
3. `jogo.css`: `.dano.t-agua` — as parcelas do DMG saem por TIPO de dano nos flutuantes (a dela é `agua`), como a especificação pede.

**Substituições nomeadas (sistema provisório → contrato):**
- (i) Limiar dos ataques DELA: Defesa comprimida `round(CA/3)+3` → **CA da ficha** do alvo (superar; crítico força o acerto).
- (ii) Teste do Chicote: derivação `1d6+bónusTeste` → **expressão da ficha `4d6+19`** (4d6+INT, encomenda §1.4); transformada mantém o dano `8d6+34`.
- (iii) Dano: rolagem local → **DMG** (parcelas por tipo; o Supervisor confere parcelas = total antes de aplicar).
- (iv) Chicote: gratuito → **8 PA** por resolução (paga-se ao Confirmar, acerte ou erre; `PA_INSUFICIENTE` bloqueia com frase).
- (v) Acerto dos monstros: comparação local `>=` → motor (superar, com Vantagem/Desvantagem, crítico e falha crítica). O PAR teste×limiar deles continua o TEST declarado da casca (`1d6+bónusTeste` × Defesa derivada `defesaDe`, via `defesaAplicavel` nomeada): nenhuma fonte traz o par das bestas, e a CA crua com 1d6+10 tornaria a batalha interminável, contra a doutrina §1.7 desta casca. Consequência nomeada (corrigida pós-Crítico 1, achado 4): o crítico/falha crítica deles NÃO sai dos dados do ataque — o motor usa a verificação separada de 3d6 (dois 6, ou dois 1, e o terceiro a acompanhar): **1/108 ≈ 0,93%** por ataque, para cada um dos dois extremos.
- (vi) Falha crítica: inexistente → **tabela final do Mestre consumida do motor** (cai 35 / arma cai 26 / amigo 17 / si próprio 16 / arma quebra 3 / corpo 3; sem cópia à mão na página). Dela: fluxo H10 — o clique pede `proposta` (nada aplicado), o Confirmar aplica com segunda chamada (`escolha` + `confirmacaoDeProposta`, mesma semente e verificação). Dos monstros: `sorte`, aplicada na hora, narrada só como ficção. «Acerta-amigo» nunca é declarado (`aliadosAoAlcance: []` — batalha a solo; o motor exclui e renormaliza, declarado). Arma caída dela: clicar Atacar apanha-a gastando o movimento da vez; arma quebrada: recusa com frase (dura até ser consertada — conserto fora desta batalha). Caída: levanta-se na vez seguinte gastando o movimento.
- (vii) Morte dela: nascer de `foraDeCombate` silencioso → **testes de morte M3** (só ela é designada): a batalha CONTINUA com ela aMorrer; golpes directos qualificados somam falhas pelo motor; o relógio é a viragem da ronda (1 teste/ronda); estabilizar ou morrer fecha a batalha com a causa nomeada. Contadores só no Supervisor.
- (viii) Movimento: Correr e Desvincular entram como declarações DENTRO do modo Mover (nunca botões da barra base), validados pelo motor (`validarCorrer`, `validarSaidaDeAdjacencia`); a saída de adjacência dela resolve os ataques de oportunidade no `moveend` (Desvincular protege TODOS os adjacentes à partida — palavra do Mestre); a base de deslocamento passa a ser efectiva (Regra 7: Fraca anda metade; corpo partido, metade) e o invariante do Supervisor aceita o tecto do Correr (18 m). **Correcções pós-críticos (ronda única):** (a) o alvo de um ataque de oportunidade vai SEM `defesaAplicavel`/reacção (regra B0 do motor — declará-la era erro nomeado e o golpe nunca resolvia; o limiar TEST vai no campo `ca`); a Reacção do monstro só se consome com a resolução feita e um erro de AoO produz frase, nunca silêncio; (b) só há saída de adjacência para quem ela abandonou de facto (distância final > 1) — orbitar ao lado do mesmo inimigo não provoca nem custa; (c) inimigos cuja zona ela atravessa e abandona A MEIO DO CAMINHO também provocam AoO, e o Desvincular não os cobre (contrato Parte C); (d) se um AoO a derruba na vez dela, a vez entrega-se (`passarVez`) para a rotação e o relógio de morte andarem; (e) o modo automático nunca confirma uma desgraça em «proposta» (fica para o Mestre, como a Transformação); (f) o DMG é reposto em `window` só durante cada chamada síncrona ao motor (`vlabComDmg`) — o bundle procura-o preguiçosamente por chamada, e apagá-lo a seco matava todos os acertos com `DMG_INDISPONIVEL` (achado A1 do Crítico 2).

**Ligadas mas dormentes (sem dados/fonte nesta casca — nomeadas, não inventadas):** Defender/Esquivar (canal `reacaoDefensiva` ligado e construtor pronto: `vlabValorDefender` = 6+CON+Armadura+Fortitude, limiar C1; `REACCOES_DECLARADAS = {}` porque nenhuma ficha da casca traz Armadura+Fortitude); **Contra-atacar: SEM adaptador** (o motor aceita `alvo.contraAtaque`; a página não o constrói — correcção de alegação pós-Crítico 1, achado 5); salvaguarda com Refletir e cura (adaptadores `vlabResolverSalvaguarda`/`vlabAplicarCura` como caminho único futuro; nenhuma técnica do elenco os usa hoje); Forçar passagem (sem expressões de Força das bestas nas fontes — o bloqueio de passagem actual mantém-se); a AoO ofensiva dela contra monstros que fogem (exige decisão dela a meio da vez da IA — desenho H10 pendente; na prática a IA só se aproxima). Estado VLAB **entra nos snapshots** do Supervisor (cópia profunda em `supEstadoCanonico`, reposta campo a campo em `supRestaurar`) — correcção pós-Crítico 3 (achado 5): a primeira versão desta tranche deixava o estado do motor fora do restauro (divergência nomeada então); fechada nesta ronda.

**Exposição no fonte (declarada pós-Crítico 2, achado A2 — condição de publicação):** esta tranche passa a SERVIR à vista da Party o ficheiro `vlab-completo.js` inteiro — nele lê-se, por «ver fonte», a tabela de desgraças com pesos, a tabela de k dos testes de morte, as bandas DME, as fórmulas de reacção e o modelo de recibo do motor (que a página nunca mostra preenchido); o `jogo.js` acrescenta o `nomeDaRegra` do par TEST e os ids das desgraças nas frases de ficção. É o mesmo regime da tranche LEVEL UP (fronteira D6): **resíduo TEST visível que exige palavra expressa do Mestre para publicar** — sem ela, esta tranche não se publica, mesmo com a fila aterrada. Em execução, nada disto aparece em ecrã, frase, ficha, flutuante ou consola (verificado pelos críticos e pela bateria).

**Privacidade:** Vida/Alma e os números técnicos vivem só dentro do invólucro e no registo do Supervisor (ferramenta do Mestre); frases, ficha e flutuantes nunca mostram Vida de monstro (os monstros nem entram no motor com Vida — caminho `null` por desenho), limiares, nem contadores de morte. A desgraça interna de um monstro regista-se no Supervisor só com o tipo, sem números. Varredura automática: casos VL3 da bateria viva + LU2 herdado.

**Prova:** bateria viva adaptada (`bateria-viva-vlab.mjs`: casos 1–21, N1–N6, LU1–LU3, VL1–VL3) + casos jogáveis do contrato (`casos-vlab.mjs` K1–K12: ataque com parcela por tipo, crítico Regra 6, Refletir, cura ×3, Desvincular com 3 adjacentes, tabela de desgraças, Defender por limiar, Forçar passagem, testes de morte 3×3 + extra de Fortitude, tecto de 1 de Vida, proposta H10, Correr, privacidade das saídas). Resultados no relatório da tranche.

**Estado da publicação:** **NÃO PUBLICADO.** A fila TD → Visual → LevelUp → VLAB não aterrou (provado por hashes da página viva: o vivo continua o estado B4) — esta cópia fica pronta a rebasear sobre o vivo mais recente quando as três anteriores aterrarem. A decisão «um só núcleo» (v2 GDScript × JS) NÃO se toma aqui: a coexistência fica registada como nomeada, sem bloquear esta integração.

---

## RE-BASE T1 SOBRE O VIVO TD2 (04/11/2026, etapa 2 da Frente 3)

A secção «TRANCHE VLAB» acima foi escrita na cópia original da tranche
(base LevelUp). No re-base para o vivo actual (td2, `jogo.js eb0cdeaa…`,
commit `7176cdf`), a composição é: vivo td2 + delta VLAB (merge a 3 vias,
base `679e13a0…`) + os hunks da camada de leitura LevelUp nomeados no
relatório do re-base (`LU_MOTOR`, bloco «progressão lida» com
FONTES_RANK/CONFLITOS_RANK_DECLARADOS/PROGRESSAO_LIDA, `levelup.js`
pinado `f0b61973…` e as linhas de script), porque `vlabMoribundo()` lê
`PROGRESSAO_LIDA.ong`. A tranche LevelUp como camada autónoma fica
depois como verificação/re-base sobre este vivo (tranche 2). Registo
completo: `../RELATORIO-REBASE-VLAB.md`.

---

## COMPLETAMENTO A01 — OS MONSTROS GANHAM VIDA; NASCE A VITÓRIA (04/11/2026)

O julgamento da bancada (JULGAMENTO-JUIZ-T1) não liberou a publicação sem
este completamento (condição P-V2-1 do mapa de integração, volta 2): na
cópia re-basada os monstros entravam SEM Vida, a queda deles era ignorada
e a batalha era inganhável («os monstros não têm vida» no fimDeBatalha).
Esta secção regista o que mudou; o texto da secção TRANCHE VLAB acima
fica como foi escrito então — onde diz que os monstros entram sem Vida,
está SUPERADO por esta secção.

**Vida do elenco (com fonte; classe: resíduo TEST declarado, exibição
zero — nunca aparece em frase, ficha, flutuante ou recibo público):**

- **Orc = 26** — corpus do motor de fichas `C1-orc-n01.json` (fixture
  TEST_CHARACTERS.md §1.3, «Vida natural 26»; estado «lido», cruzado ao
  dígito com CA 33 e dano 4d6+0 do COMBATE_TEST da casca).
- **Capanga 1 = 210** — corpus `C4-capanga-r199.json` (fixture §3, caso
  VLAB R199, «Vida máxima 210»; entra cheio; dano 2d6+25 e Prata 3
  cruzados ao dígito). Os 196 do caso-fonte eram a Vida *actual
  publicada* daquele caso, não a máxima.
- **Lobo da Caverna = 270** — a ficha original dizia **240** (corpus
  `C5-lobo-duas-fontes.json`, bestiário Prata 1 + R199 concordantes).
  A auditoria da ficha (AUDITORIA-FICHA-LOBO, 04/11/2026) provou que
  240 desvia da régua de criação de bestas (Regra 5: 30 + 6×(20+CON 20)
  = 270; o Espectro vizinho tem o mesmo −30). Por **ordem do Mestre**
  (04/11/2026 19:37), a ficha foi **recriada no Notion** com a régua
  aplicada — fecho às 19:44 com bancada LIBERA e readback verde
  (FICHA-LOBO-RECRIADA): **Vida Prata 1 = 270** (Alma 210 · CA 34 ·
  Prof +8 · RD 15 · dano-base 6d6 · Vel 15). É esse o valor ligado
  nesta tranche, com fonte «ficha recriada 04/11/2026, ordem do
  Mestre». A Investida Predadora ficou de fora da ficha por decisão
  unânime da bancada (só existia como rótulo na ficha de teste VLAB,
  sem mecânica em fonte; divergência aberta à palavra do Mestre, não
  extinta).

**O que o adaptador passou a fazer (`jogo.js`, delta A01 — 20 hunks
contra o backup pré-A01):**

- Os monstros entram no motor com `vidaActual/vidaTotal` (só para
  dentro do motor; a superfície pública continua filtrada por alvo —
  C-V2-3 respeitada: nenhum consumidor novo imprime `publico`).
- O dano sofrido de cada monstro acumula em `ESTADO_VLAB.danoSofrido`,
  entra nos snapshots do Supervisor (superfície do Mestre) e é reposto
  no restauro. O estado «fraco» de monstro passa a derivar da sua Vida
  (<10%), o que alimenta a Desvantagem de Fraco também neles.
- A **queda** de um monstro conta: ao chegar a 0 (ou `foraDeCombate`),
  a vista apresenta a morte (`apresentarMorte`, com queda para
  `setVivo(false)`), a rotação de vez salta os mortos e a captura de
  partidas para ataques de oportunidade filtra os mortos. O dano
  próprio da desgraça «acerta-se» de um monstro acumula no seu
  `danoSofrido` (o tecto de 1 de Vida do motor mantém-se — a desgraça
  nunca mata).
- **Terminal de VITÓRIA:** quando os três inimigos estão fora de
  combate, a batalha termina com causa `vitoria`
  (`morteAdjudicada: false` — a Ong NÃO tomba): frase «Os inimigos
  caíram todos — vitória da Ong nesta batalha», e cada queda anuncia
  «<b>Nome</b> caiu.» no histórico, sem números. O terminal de derrota
  mantém-se como estava (causa `morte`, testes de morte dela).

**Conferências A02 (dentro da mesma passagem; recibo
`recibos/bateria-a02-A01-270.txt`, 10/10):** anulação total 1×1,
parcial por Fraco, tectos +4/−4, atacante Caído/Fraco, flanco SOBRE
ela (monstro→ela, líquido +1), Defender inactivo (lacuna de dados
nomeada: `REACCOES_DECLARADAS` vazio — nenhuma ficha traz
Armadura+Fortitude; o produtor legítimo é a ficha, tranche 3) e o
limiar do Defender no motor (total = limiar erra; limiar+1 acerta).
**A02-8 registado como estado, não correcção:** o flanco DELA sobre
monstros NÃO está ligado (`vlabFlanqueandoSobre` só é chamado sob a
guarda monstro→ela) — fica nomeado para a frente própria.

**Bateria A01 (`bateria/bateria-a01.mjs`; recibo
`recibos/bateria-a01.txt`: 12/12 PASS):** vitória conduzida à mão
(semente **423008**: os três caem por ordem Orc → Capanga 1 → Lobo da
Caverna, ela viva, fim `vitoria` sem morte adjudicada, morto nunca
volta a ter a vez, recibos públicos e histórico sem Vida de monstro,
zero alertas) e derrota em modo automático (semente 12345: fim
`morte`, sem evento de vitória). Nota de método da vitória: com
Transformação ela é estruturalmente impossível (Monte Carlo ao nível
do motor: 0/20 000); sem transformar é uma lotaria fina (≈0,4–0,8%
com sobrevivência perfeita) — a semente vencedora foi encontrada por
busca em **2 501 batalhas reais conduzidas** (vagas de 300+600+960+
641), não fabricada; o condutor da bateria é o v4.2 (nunca transforma;
ordem matável→Orc→Capanga→Lobo por causa da parede de corpos que
bloqueia o caminho de ataque; planeamento por custo exacto de
oportunidade + simulação determinística da ronda). A matemática
desta arena de teste (10×7, elenco TEST) é a medida — não é uma
sentença sobre o equilíbrio do jogo: a arena oficial será ≥20×20 e o
produtor de Vida definitivo é a ficha (tranche 3), que substitui o
resíduo `VIDA_TEST` aqui declarado.

**Re-provas sobre o artefacto completado (recibos *-A01-270):**
casos VLAB 13/13 · H-3 recibo-por-alvo 5/5 · H-2 leitura 17/17 ·
bateria viva 36/36 (inclui VL6 nos dois sentidos) · sonda de
privacidade PASS · sonda de recibo PASS · sagrados e bundles
byte-iguais aos pins (`cena.js 89d09286…` · `mundo.js 245f535a…` ·
`levelup.js f0b61973…` · `vlab-completo.js 28cb67b7…`; `jogo.js`
final `14f0c974…`).
