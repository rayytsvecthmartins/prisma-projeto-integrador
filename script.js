'use strict';

// SOL + ÁGUA — interações do laboratório virtual.
// Todo o comportamento fica neste arquivo para manter HTML, CSS e JavaScript separados.

document.addEventListener('DOMContentLoaded', () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const formatDecimal = (value, digits = 1) => value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

  // Menu compacto para telas menores.
  const menuToggle = $('#menu-toggle');
  const mainNav = $('#main-nav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      const label = $('.sr-only', menuToggle);
      if (label) label.textContent = isOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação';
      const icon = $('.menu-icon', menuToggle);
      if (icon) icon.textContent = isOpen ? '×' : '☰';
    });
    $$('a', mainNav).forEach(link => link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      const label = $('.sr-only', menuToggle);
      if (label) label.textContent = 'Abrir menu de navegação';
      const icon = $('.menu-icon', menuToggle);
      if (icon) icon.textContent = '☰';
    }));
  }

  // Preferências de acessibilidade: controlam o próprio site, não o widget externo.
  let fontSize = 16;
  const root = document.documentElement;
  const dyslexiaToggle = $('#dyslexia-toggle');
  const contrastToggle = $('#contrast-toggle');
  const motionToggle = $('#motion-toggle');
  $('#font-plus')?.addEventListener('click', () => {
    fontSize = Math.min(21, fontSize + 1);
    root.style.setProperty('--base-size', `${fontSize}px`);
  });
  $('#font-minus')?.addEventListener('click', () => {
    fontSize = Math.max(13, fontSize - 1);
    root.style.setProperty('--base-size', `${fontSize}px`);
  });
  dyslexiaToggle?.addEventListener('click', () => {
    const enabled = document.body.classList.toggle('dyslexia-mode');
    dyslexiaToggle.setAttribute('aria-pressed', String(enabled));
    dyslexiaToggle.setAttribute('aria-label', enabled ? 'Desativar tipografia de leitura' : 'Ativar tipografia de leitura');
  });
  contrastToggle?.addEventListener('click', () => {
    const enabled = document.body.classList.toggle('high-contrast');
    contrastToggle.setAttribute('aria-pressed', String(enabled));
    contrastToggle.setAttribute('aria-label', enabled ? 'Desativar alto contraste' : 'Ativar alto contraste');
  });
  motionToggle?.addEventListener('click', () => {
    const enabled = document.body.classList.toggle('reduce-motion');
    motionToggle.setAttribute('aria-pressed', String(enabled));
    motionToggle.setAttribute('aria-label', enabled ? 'Ativar animações' : 'Reduzir movimentos e animações');
  });

  // Faixas do espectro: conteúdo dinâmico acessível por teclado.
  const spectrumData = {
    uv: {
      name: 'Ultravioleta', scale: '≈ 10–400 nm', icon: '✹',
      description: 'Tem comprimento de onda menor e energia por fóton maior que a luz visível. Parte da radiação UV solar é filtrada pela atmosfera; a exposição excessiva pode causar danos à pele e aos olhos.'
    },
    visible: {
      name: 'Luz visível', scale: '≈ 400–700 nm', icon: '✦',
      description: 'É a faixa que nossos olhos detectam. A superfície e os materiais absorvem e refletem diferentes partes dessa luz; a parcela absorvida pode contribuir para o aquecimento.'
    },
    ir: {
      name: 'Infravermelho', scale: '≈ 700 nm–1 mm', icon: '〰',
      description: 'Objetos com temperatura acima do zero absoluto emitem radiação térmica. A água aquecida da piscina emite infravermelho, mas também perde energia por evaporação, convecção e condução.'
    },
    micro: {
      name: 'Micro-ondas', scale: '≈ 1 mm–1 m', icon: '⌁',
      description: 'São usadas em comunicações e em fornos de micro-ondas. A interação com certos materiais pode transferir energia; não são o principal tipo de radiação solar aproveitado pelo coletor térmico.'
    }
  };
  const spectrumButtons = $$('.spectrum-segment');
  spectrumButtons.forEach(button => button.addEventListener('click', () => {
    const item = spectrumData[button.dataset.spectrum];
    if (!item) return;
    spectrumButtons.forEach(other => {
      const selected = other === button;
      other.classList.toggle('is-selected', selected);
      other.setAttribute('aria-pressed', String(selected));
    });
    $('#spectrum-name').textContent = item.name;
    $('#spectrum-scale').textContent = item.scale;
    $('#spectrum-icon').textContent = item.icon;
    $('#spectrum-description').textContent = item.description;
  }));

  // Simulador térmico. Os coeficientes são didáticos, não medições da piscina do CEP.
  const startTemp = $('#start-temp');
  const nightHours = $('#night-hours');
  const coverToggle = $('#cover-toggle');
  const chartCovered = $('#chart-covered');
  const chartOpen = $('#chart-open');
  const chartGrid = $('#chart-grid');
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const svgElement = (name, attrs) => {
    const element = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
  };

  function makeThermalPoints(temp, hours, rate) {
    const points = [];
    for (let i = 0; i <= 8; i += 1) {
      const elapsed = hours * (i / 8);
      const current = Math.max(0, temp - rate * elapsed);
      const x = 42 + (458 * i / 8);
      const y = 145 - ((current - 16) / 18) * 110;
      points.push({ x, y, temp: current });
    }
    return points;
  }

  function updateThermal() {
    const temp = Number(startTemp.value);
    const hours = Number(nightHours.value);
    const coverOn = coverToggle.checked;
    const coverRate = 0.10;
    const openRate = 0.30;
    const coveredDrop = coverRate * hours;
    const openDrop = openRate * hours;
    $('#start-temp-out').textContent = `${temp} °C`;
    $('#night-hours-out').textContent = `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    $('#covered-temp').textContent = `${formatDecimal(Math.max(0, temp - coveredDrop))} °C`;
    $('#uncovered-temp').textContent = `${formatDecimal(Math.max(0, temp - openDrop))} °C`;
    $('#covered-loss').textContent = `−${formatDecimal(coveredDrop)} °C estimado`;
    $('#uncovered-loss').textContent = `−${formatDecimal(openDrop)} °C estimado`;
    $('#visual-cover').classList.toggle('is-on', coverOn);
    $('#visual-cover').setAttribute('aria-label', coverOn ? 'Ilustração da capa térmica' : 'Ilustração da piscina sem capa térmica');
    // O cenário principal visualizado acompanha a seleção, mas os dois resultados ficam comparáveis.
    const covered = makeThermalPoints(temp, hours, coverRate);
    const open = makeThermalPoints(temp, hours, openRate);
    chartCovered.setAttribute('points', covered.map(p => `${p.x},${p.y}`).join(' '));
    chartOpen.setAttribute('points', open.map(p => `${p.x},${p.y}`).join(' '));
    $('#chart-end-label').textContent = `${hours} h`;
    $('#thermal-chart').setAttribute('aria-label', `Gráfico estimado da temperatura da piscina durante ${hours} horas: começa em ${temp} graus Celsius, termina em ${formatDecimal(Math.max(0, temp - coveredDrop))} graus com capa e ${formatDecimal(Math.max(0, temp - openDrop))} graus sem capa.`);
    chartGrid.replaceChildren();
    [20, 24, 28, 32].forEach(t => {
      const y = 145 - ((t - 16) / 18) * 110;
      chartGrid.append(svgElement('line', { x1: 42, y1: y, x2: 500, y2: y, class: 'chart-grid' }));
      const label = svgElement('text', { x: 35, y: y + 3, 'text-anchor': 'end', class: 'chart-label' });
      label.textContent = `${t}°`;
      chartGrid.append(label);
    });
  }
  [startTemp, nightHours, coverToggle].forEach(control => control?.addEventListener('input', updateThermal));
  $('#run-thermal')?.addEventListener('click', updateThermal);
  updateThermal();

  // Simulador de energia por fóton + analogia de produção fotovoltaica.
  const wavelength = $('#wavelength');
  const intensity = $('#light-intensity');
  const photoVisual = $('.photo-visual');
  const WORK_FUNCTION_EV = 2.3;
  function updatePhotoelectric() {
    const lambda = Number(wavelength.value);
    const light = Number(intensity.value);
    const energy = 1240 / lambda;
    const enoughEnergy = energy >= WORK_FUNCTION_EV;
    const emits = enoughEnergy && light > 0;
    $('#wavelength-out').textContent = `${lambda} nm`;
    $('#light-intensity-out').textContent = `${light}%`;
    $('#photon-energy').textContent = `${formatDecimal(energy, 2)} eV`;
    $('#energy-meter-fill').style.width = `${Math.min(100, (energy / 5) * 100)}%`;
    photoVisual.classList.toggle('emission-on', emits);
    photoVisual.classList.toggle('no-light', light === 0);
    photoVisual.style.setProperty('--photon-opacity', (light / 100).toFixed(2));
    $('.photo-result').classList.toggle('result-off', !emits);
    $('#photo-status-icon').textContent = emits ? '↗' : '×';
    if (light === 0) {
      $('#photo-status').textContent = 'Sem luz incidente';
      $('#photo-explanation').textContent = 'Sem fótons incidindo, não há emissão neste modelo, mesmo que a energia de um fóton isolado pudesse superar a função trabalho.';
    } else if (enoughEnergy) {
      $('#photo-status').textContent = 'Energia suficiente no modelo';
      $('#photo-explanation').textContent = `A energia de cada fóton (${formatDecimal(energy, 2)} eV) supera a função trabalho ilustrativa de 2,3 eV. Aumentar a intensidade aumenta o número de fótons incidentes, não a energia individual de cada fóton.`;
    } else {
      $('#photo-status').textContent = 'Energia insuficiente por fóton';
      $('#photo-explanation').textContent = `Cada fóton tem cerca de ${formatDecimal(energy, 2)} eV, abaixo da função trabalho ilustrativa de 2,3 eV. No efeito fotoelétrico idealizado, aumentar apenas a intensidade não compensa a energia insuficiente de cada fóton.`;
    }
  }
  [wavelength, intensity].forEach(control => control?.addEventListener('input', updatePhotoelectric));
  updatePhotoelectric();

  // Painel de automação: sensor -> decisão programada -> atuador.
  const poolTemp = $('#pool-temp');
  const sunlight = $('#sunlight');
  const waterLevel = $('#water-level');
  const decisionLog = $('#decision-log');

  function setStatePill(element, text, className) {
    element.textContent = text;
    element.className = `state-pill ${className}`;
  }
  function addLog(lines) {
    decisionLog.replaceChildren();
    lines.forEach(([time, message]) => {
      const li = document.createElement('li');
      const stamp = document.createElement('time');
      stamp.textContent = time;
      li.append(stamp, document.createTextNode(message));
      decisionLog.append(li);
    });
  }
  function updateSensors() {
    const temp = Number(poolTemp.value);
    const light = Number(sunlight.value);
    const level = Number(waterLevel.value);
    $('#pool-temp-out').textContent = `${temp} °C`;
    $('#sunlight-out').textContent = `${light}%`;
    $('#water-level-out').textContent = `${level}%`;
    $('#sensor-temp-value').innerHTML = `${temp}<span>°C</span>`;
    $('#sensor-light-value').innerHTML = `${light}<span>%</span>`;
    $('#sensor-water-value').innerHTML = `${level}<span>%</span>`;
    $('#sensor-temp-bar').style.width = `${((temp - 18) / 17) * 100}%`;
    $('#sensor-light-bar').style.width = `${light}%`;
    $('#sensor-water-bar').style.width = `${level}%`;

    const lowWater = level < 30;
    const needsHeat = temp < 28;
    const enoughSun = light >= 35;
    const pumpOn = !lowWater;
    const heaterOn = !lowWater && needsHeat && enoughSun;
    $('#sensor-temp-state').textContent = needsHeat ? 'Abaixo da meta de 28 °C' : 'Meta de temperatura atingida';
    $('#sensor-light-state').textContent = enoughSun ? 'Radiação disponível no modelo' : 'Pouca luz para aquecimento solar';
    $('#sensor-water-state').textContent = lowWater ? 'NÍVEL BAIXO — segurança' : 'Faixa segura no modelo';
    $('#sensor-water-state').style.color = lowWater ? '#ffd84d' : '';
    $('#system-status').innerHTML = lowWater ? '<i></i> PROTEÇÃO ATIVA' : '<i></i> SISTEMA ATIVO';
    $('#pump-state').textContent = pumpOn ? 'LIGADA' : 'DESLIGADA';
    $('#pump-state').className = `state-pill ${pumpOn ? 'state-on' : 'state-warning'}`;
    setStatePill($('#heater-state'), heaterOn ? 'LIGADO' : 'DESLIGADO', heaterOn ? 'state-on' : 'state-off');
    if (lowWater) {
      setStatePill($('#alert-state'), 'NÍVEL BAIXO', 'state-warning');
      addLog([
        ['AGORA', `Sensor de nível marcou ${level}%.`],
        ['REGRA 01', 'Nível abaixo de 30%: bomba e aquecimento desligados por segurança.'],
        ['ALERTA', 'Solicitar verificação do nível antes de retomar o sistema.']
      ]);
    } else if (heaterOn) {
      setStatePill($('#alert-state'), 'NORMAL', 'state-on');
      addLog([
        ['AGORA', `Temperatura ${temp} °C; luminosidade ${light}%.`],
        ['REGRA 02', 'Água abaixo da meta e luz disponível: aquecimento solicitado.'],
        ['ATUADOR', 'Bomba ligada; circulação e aquecimento simulados.']
      ]);
    } else if (needsHeat && !enoughSun) {
      setStatePill($('#alert-state'), 'NORMAL', 'state-on');
      addLog([
        ['AGORA', `Temperatura ${temp} °C; luminosidade ${light}%.`],
        ['REGRA 03', 'Água abaixo da meta, mas a luz é insuficiente para aquecimento solar.'],
        ['ATUADOR', 'Bomba de circulação ligada; aquecimento solar aguardando condição adequada.']
      ]);
    } else {
      setStatePill($('#alert-state'), 'NORMAL', 'state-on');
      addLog([
        ['AGORA', `Temperatura ${temp} °C; nível ${level}%.`],
        ['REGRA 04', 'Temperatura na meta: aquecimento desativado.'],
        ['ATUADOR', 'Bomba ligada no modelo; monitoramento continua ativo.']
      ]);
    }
  }
  [poolTemp, sunlight, waterLevel].forEach(control => control?.addEventListener('input', updateSensors));
  $('#reset-sensors')?.addEventListener('click', () => {
    poolTemp.value = '27'; sunlight.value = '68'; waterLevel.value = '82'; updateSensors();
  });
  updateSensors();

  // Quiz com feedback, progresso e reinício.
  const quizQuestions = [
    {
      question: 'Qual tipo de energia o coletor solar térmico aproveita principalmente?',
      options: ['Energia térmica transferida para a água', 'Som produzido pela luz', 'Energia química criada do nada'],
      correct: 0,
      explanation: 'Isso! O coletor absorve radiação e transfere energia térmica para um fluido que aquece a água.'
    },
    {
      question: 'Por que uma capa térmica pode ajudar a piscina a esfriar mais devagar?',
      options: ['Porque impede qualquer emissão de energia para sempre', 'Porque reduz principalmente a evaporação e pode diminuir perdas de calor', 'Porque aumenta a temperatura do ar automaticamente'],
      correct: 1,
      explanation: 'Correto. A capa reduz muito a evaporação, que é uma das formas importantes de perda de energia, embora não elimine todas as perdas.'
    },
    {
      question: 'No efeito fotoelétrico idealizado, o que determina a energia de cada fóton?',
      options: ['A cor do painel sozinho', 'A área da piscina', 'A frequência da radiação (ou seu comprimento de onda)'],
      correct: 2,
      explanation: 'Isso mesmo. A energia de cada fóton aumenta com a frequência e diminui quando o comprimento de onda aumenta.'
    },
    {
      question: 'Qual é a função de um sensor em um sistema de automação?',
      options: ['Medir uma grandeza do ambiente e fornecer dados', 'Decidir sozinho sem nenhum controlador', 'Gerar energia elétrica em qualquer condição'],
      correct: 0,
      explanation: 'Perfeito. O sensor mede, o controlador interpreta os dados e o atuador executa uma ação.'
    },
    {
      question: 'Qual medida ilustra uma automação mais segura para a piscina?',
      options: ['Manter a bomba ligada mesmo com nível muito baixo', 'Desativar atuadores e emitir alerta quando o nível está abaixo do limite', 'Ignorar as leituras dos sensores'],
      correct: 1,
      explanation: 'Exato. Regras de segurança podem desligar equipamentos diante de condições fora da faixa adequada e solicitar verificação.'
    }
  ];
  let quizIndex = 0;
  let quizScore = 0;
  let answered = false;
  const optionLetters = ['A', 'B', 'C'];
  const quizOptions = $('#quiz-options');
  const quizNext = $('#quiz-next');

  function showQuestion() {
    const question = quizQuestions[quizIndex];
    answered = false;
    $('#quiz-counter').textContent = `PERGUNTA ${quizIndex + 1} DE ${quizQuestions.length}`;
    $('#quiz-score-label').textContent = `PONTOS: ${quizScore}`;
    $('#quiz-progress-bar').style.width = `${(quizIndex / quizQuestions.length) * 100}%`;
    $('#quiz-question').textContent = question.question;
    $('#quiz-feedback').hidden = true;
    $('#quiz-feedback').textContent = '';
    quizOptions.replaceChildren();
    question.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quiz-option';
      button.dataset.option = String(index);
      const letter = document.createElement('span');
      letter.textContent = optionLetters[index];
      const text = document.createElement('strong');
      text.textContent = option;
      button.append(letter, text);
      button.addEventListener('click', () => answerQuestion(index));
      quizOptions.append(button);
    });
    quizNext.disabled = true;
    quizNext.textContent = quizIndex === quizQuestions.length - 1 ? 'Ver resultado →' : 'Próxima pergunta →';
  }

  function answerQuestion(choice) {
    if (answered) return;
    answered = true;
    const question = quizQuestions[quizIndex];
    const correct = choice === question.correct;
    if (correct) quizScore += 1;
    $$('.quiz-option', quizOptions).forEach((button, index) => {
      button.disabled = true;
      if (index === question.correct) button.classList.add('correct');
      if (index === choice && !correct) button.classList.add('incorrect');
    });
    $('#quiz-score-label').textContent = `PONTOS: ${quizScore}`;
    $('#quiz-feedback').hidden = false;
    $('#quiz-feedback').textContent = `${correct ? 'Resposta correta! ' : 'Ainda não! '} ${question.explanation}`;
    $('#quiz-progress-bar').style.width = `${((quizIndex + 1) / quizQuestions.length) * 100}%`;
    quizNext.disabled = false;
  }

  function showQuizResult() {
    $('#quiz-counter').textContent = 'RESULTADO FINAL';
    $('#quiz-score-label').textContent = `PONTOS: ${quizScore}/${quizQuestions.length}`;
    $('#quiz-progress-bar').style.width = '100%';
    $('#quiz-question').textContent = quizScore === quizQuestions.length ? 'Mandou muito bem: você conectou os conceitos!' : quizScore >= 3 ? 'Boa! Você já entendeu as conexões principais.' : 'A ciência também se aprende tentando de novo.';
    quizOptions.replaceChildren();
    const summary = document.createElement('p');
    summary.className = 'quiz-option-summary';
    summary.textContent = `Você acertou ${quizScore} de ${quizQuestions.length} perguntas. Revise os simuladores de calor, luz e sensores e tente novamente.`;
    quizOptions.append(summary);
    $('#quiz-feedback').hidden = true;
    quizNext.disabled = false;
    quizNext.textContent = 'Refazer o quiz ↻';
    answered = true;
  }

  quizNext?.addEventListener('click', () => {
    if (quizIndex === quizQuestions.length - 1 && answered) {
      // Na última pergunta já respondida, abrir tela de resultado; na tela de resultado, reiniciar.
      if ($('#quiz-counter').textContent === 'RESULTADO FINAL') {
        quizIndex = 0; quizScore = 0; showQuestion();
      } else {
        showQuizResult();
      }
      return;
    }
    if (!answered) return;
    quizIndex += 1;
    showQuestion();
  });
  $('#quiz-restart')?.addEventListener('click', () => { quizIndex = 0; quizScore = 0; showQuestion(); });
  const librasVideo = $('#libras-solar-video');
  const librasVideoFallback = $('#libras-video-fallback');
  librasVideo?.addEventListener('error', () => {
    if (librasVideoFallback) librasVideoFallback.hidden = false;
  });
  librasVideo?.addEventListener('playing', () => {
    if (librasVideoFallback) librasVideoFallback.hidden = true;
  });

  showQuestion();
});
