'use strict';

const ThemeManager = (() => {
  const STORAGE_KEY = 'orion-theme';
  const DEFAULT_THEME = 'mission-control';
  const themeButtons = document.querySelectorAll('.theme-btn');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
    applyTheme(saved);

    themeButtons.forEach(btn => {
      btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
    });
  }

  return { init };
})();

const Navigation = (() => {
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.nav__link');
  const sections = document.querySelectorAll('section[id]');

  function init() {
    navToggle.addEventListener('click', toggleMenu);

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    window.addEventListener('scroll', highlightActiveLink, { passive: true });
  }

  function toggleMenu() {
    const isOpen = nav.classList.toggle('open');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  }

  function highlightActiveLink() {
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }

  return { init };
})();

const ScrollReveal = (() => {
  function init() {
    const elements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(el => observer.observe(el));
  }

  return { init };
})();

const Slideshow = (() => {
  const slides = document.querySelectorAll('.slide');
  const indicators = document.querySelectorAll('.indicator');
  const prevBtn = document.getElementById('slide-prev');
  const nextBtn = document.getElementById('slide-next');
  let current = 0;
  let interval;
  const AUTO_DELAY = 5000;

  function goTo(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
    indicators.forEach((ind, i) => {
      ind.classList.toggle('active', i === current);
      ind.setAttribute('aria-selected', String(i === current));
    });
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  function startAutoPlay() {
    stopAutoPlay();
    interval = setInterval(next, AUTO_DELAY);
  }

  function stopAutoPlay() {
    clearInterval(interval);
  }

  function init() {
    if (!slides.length) return;

    prevBtn.addEventListener('click', () => { prev(); startAutoPlay(); });
    nextBtn.addEventListener('click', () => { next(); startAutoPlay(); });

    indicators.forEach(ind => {
      ind.addEventListener('click', () => {
        goTo(parseInt(ind.dataset.slide, 10));
        startAutoPlay();
      });
    });

    const slideshow = document.querySelector('.slideshow');
    slideshow.addEventListener('mouseenter', stopAutoPlay);
    slideshow.addEventListener('mouseleave', startAutoPlay);

    startAutoPlay();
  }

  return { init };
})();

const MissionForm = (() => {
  const form = document.getElementById('mission-form');
  const successMsg = document.getElementById('form-success');

  const fields = {
    'mission-name': {
      el: document.getElementById('mission-name'),
      error: document.getElementById('error-mission-name'),
      validate: (val) => {
        if (!val.trim()) return 'Informe o nome da missão.';
        if (val.trim().length < 3) return 'Nome deve ter ao menos 3 caracteres.';
        return '';
      }
    },
    mass: {
      el: document.getElementById('mass'),
      error: document.getElementById('error-mass'),
      validate: (val) => {
        if (val === '' || val === null) return 'Informe a massa do CubeSat.';
        const num = parseFloat(val);
        if (isNaN(num) || num <= 0) return 'Massa deve ser um valor positivo.';
        return '';
      }
    },
    power: {
      el: document.getElementById('power'),
      error: document.getElementById('error-power'),
      validate: (val) => {
        if (val === '' || val === null) return 'Informe o consumo energético.';
        const num = parseFloat(val);
        if (isNaN(num) || num <= 0) return 'Consumo deve ser um valor positivo.';
        return '';
      }
    },
    orbit: {
      el: document.getElementById('orbit'),
      error: document.getElementById('error-orbit'),
      validate: (val) => {
        if (!val) return 'Selecione a órbita desejada.';
        return '';
      }
    },
    email: {
      el: document.getElementById('email'),
      error: document.getElementById('error-email'),
      validate: (val) => {
        if (!val.trim()) return 'Informe o email de contato.';
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(val.trim())) return 'Email inválido. Verifique o formato.';
        return '';
      }
    }
  };

  function showError(field, message) {
    field.el.classList.add('error');
    field.error.textContent = message;
    field.error.classList.add('visible');
  }

  function clearError(field) {
    field.el.classList.remove('error');
    field.error.textContent = '';
    field.error.classList.remove('visible');
  }

  function validateField(key) {
    const field = fields[key];
    const message = field.validate(field.el.value);
    if (message) {
      showError(field, message);
      return false;
    }
    clearError(field);
    return true;
  }

  function validateAll() {
    let valid = true;
    Object.keys(fields).forEach(key => {
      if (!validateField(key)) valid = false;
    });
    return valid;
  }

  function init() {
    Object.keys(fields).forEach(key => {
      fields[key].el.addEventListener('blur', () => validateField(key));
      fields[key].el.addEventListener('input', () => {
        if (fields[key].el.classList.contains('error')) validateField(key);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      successMsg.hidden = true;

      if (validateAll()) {
        successMsg.hidden = false;
        form.reset();
        Object.keys(fields).forEach(key => clearError(fields[key]));
      }
    });
  }

  return { init };
})();

const SpaceQuiz = (() => {
  const baseQuestions = [
    {
      question: 'O que é um CubeSat?',
      options: [
        'Satélite miniaturizado padronizado em formato cúbico',
        'Tipo de foguete reutilizável da SpaceX',
        'Estação espacial modular da NASA',
        'Telescópio orbital de grande porte'
      ],
      explanation: 'CubeSat é um padrão de nanossatélite cúbico, tipicamente 10 cm por unidade.'
    },
    {
      question: 'O que faz um satélite em órbita?',
      options: [
        'Orbita a Terra executando missões científicas ou comerciais',
        'Decola da superfície terrestre com propulsão própria',
        'Substitui aviões em voos comerciais de curta distância',
        'Funciona apenas dentro da atmosfera terrestre'
      ],
      explanation: 'Satélites orbitam a Terra realizando comunicação, observação, navegação e pesquisa.'
    },
    {
      question: 'O que é telemetria?',
      options: [
        'Transmissão automática de dados de sensores à distância',
        'Processo de fabricação de foguetes reutilizáveis',
        'Técnica de pintura antirreflexo para naves espaciais',
        'Método de treinamento de astronautas em gravidade zero'
      ],
      explanation: 'Telemetria é a coleta e transmissão remota de dados de instrumentos e sensores.'
    },
    {
      question: 'O que significa LEO?',
      options: [
        'Low Earth Orbit — órbita baixa terrestre',
        'Lunar Exploration Operation — operação lunar',
        'Launch Engine Output — saída do motor de lançamento',
        'Long Exposure Observatory — observatório de longa exposição'
      ],
      explanation: 'LEO (Low Earth Orbit) fica entre 160 km e 2000 km de altitude.'
    },
    {
      question: 'Qual empresa desenvolveu o foguete Falcon 9?',
      options: ['SpaceX', 'Blue Origin', 'Rocket Lab', 'Boeing'],
      explanation: 'A SpaceX desenvolveu o Falcon 9, foguete reutilizável revolucionário do setor.'
    },
    {
      question: 'O que é um payload em missões espaciais?',
      options: [
        'Carga útil transportada pelo veículo de lançamento',
        'Combustível extra armazenado nos tanques do foguete',
        'Equipe de astronautas em missões tripuladas',
        'Painel solar de backup do satélite'
      ],
      explanation: 'Payload é a carga útil da missão: instrumentos, satélites ou experimentos transportados.'
    },
    {
      question: 'Qual é a função de um sistema ADCS?',
      options: [
        'Controle de atitude e determinação de orientação do satélite',
        'Amplificação do sinal de comunicação com a Terra',
        'Armazenamento de energia solar em baterias de íons',
        'Detecção de micrometeoroides na órbita do satélite'
      ],
      explanation: 'ADCS (Attitude Determination and Control System) controla a orientação do satélite.'
    },
    {
      question: 'O que é reentry em contexto espacial?',
      options: [
        'Retorno de uma nave à atmosfera terrestre',
        'Segunda tentativa de lançamento após aborto',
        'Entrada de um satélite em órbita geoestacionária',
        'Protocolo de comunicação entre estações de terra'
      ],
      explanation: 'Reentry é o retorno controlado de uma espaçonave à atmosfera terrestre.'
    },
    {
      question: 'Qual planeta a NASA visitou com a missão Perseverance?',
      options: ['Marte', 'Vênus', 'Júpiter', 'Mercúrio'],
      explanation: 'Perseverance pousou em Marte em 2021 para buscar evidências de vida passada.'
    },
    {
      question: 'O que é delta-v em astronautica?',
      options: [
        'Mudança de velocidade necessária para manobras orbitais',
        'Diferença de temperatura entre lado solar e sombra',
        'Variação de altitude durante reentrada atmosférica',
        'Desvio angular máximo permitido na antena do satélite'
      ],
      explanation: 'Delta-v mede a capacidade de manobra: quanto de velocidade o veículo pode alterar.'
    }
  ];