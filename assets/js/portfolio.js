(function () {
	'use strict';

	// Premium project cards: inject background layer and mouse-parallax 3D tilt
	var projects = document.querySelectorAll('.project');
	var maxTilt = 6; // degrees (5–8 range)
	var parallax = { bg: 0.25, media: 1, body: 0.5 };

	function injectProjectBg() {
		projects.forEach(function (card) {
			if (card.querySelector('.project__bg')) return;
			var bg = document.createElement('div');
			bg.className = 'project__bg';
			bg.setAttribute('aria-hidden', 'true');
			card.insertBefore(bg, card.firstChild);
		});
	}

	function setTilt(card, xNorm, yNorm) {
		var rx = -yNorm * maxTilt;
		var ry = xNorm * maxTilt;
		card.style.setProperty('--rx-bg', rx * parallax.bg + 'deg');
		card.style.setProperty('--ry-bg', ry * parallax.bg + 'deg');
		card.style.setProperty('--rx-media', rx * parallax.media + 'deg');
		card.style.setProperty('--ry-media', ry * parallax.media + 'deg');
		card.style.setProperty('--rx-body', rx * parallax.body + 'deg');
		card.style.setProperty('--ry-body', ry * parallax.body + 'deg');
	}

	function handleMove(e, card) {
		var rect = card.getBoundingClientRect();
		var x = (e.clientX - rect.left) / rect.width - 0.5;
		var y = (e.clientY - rect.top) / rect.height - 0.5;
		x = Math.max(-0.5, Math.min(0.5, x)) * 2;
		y = Math.max(-0.5, Math.min(0.5, y)) * 2;
		setTilt(card, x, y);
	}

	function handleLeave(card) {
		setTilt(card, 0, 0);
	}

	function prefersReducedMotion() {
		return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	injectProjectBg();
	if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
		// No mouse parallax on small screens (CSS already disables 3D)
	} else if (!prefersReducedMotion()) {
		projects.forEach(function (card) {
			var boundMove = function (e) { handleMove(e, card); };
			card.addEventListener('mouseenter', function () {
				card.addEventListener('mousemove', boundMove);
			});
			card.addEventListener('mouseleave', function () {
				card.removeEventListener('mousemove', boundMove);
				handleLeave(card);
			});
		});
	}

	// Mobile menu toggle
	var menuToggle = document.querySelector('.menu-toggle');
	var mobileNav = document.querySelector('.mobile-nav');
	var mobileLinks = document.querySelectorAll('.mobile-nav__link');

	if (menuToggle && mobileNav) {
		menuToggle.addEventListener('click', function () {
			var expanded = menuToggle.getAttribute('aria-expanded') === 'true';
			menuToggle.setAttribute('aria-expanded', !expanded);
			mobileNav.classList.toggle('is-open');
			mobileNav.setAttribute('aria-hidden', expanded);
			document.body.style.overflow = expanded ? '' : 'hidden';
		});

		function closeMenu() {
			menuToggle.setAttribute('aria-expanded', 'false');
			mobileNav.classList.remove('is-open');
			mobileNav.setAttribute('aria-hidden', 'true');
			document.body.style.overflow = '';
		}

		mobileLinks.forEach(function (link) {
			link.addEventListener('click', closeMenu);
		});
	}

	// Smooth scroll for anchor links (enhance native scroll-behavior)
	document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
		anchor.addEventListener('click', function (e) {
			var id = this.getAttribute('href');
			if (id === '#') return;
			var target = document.querySelector(id);
			if (target) {
				e.preventDefault();
				target.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		});
	});

	// Optional: subtle reveal on scroll
	var revealEls = document.querySelectorAll('.project, .about__grid, .section-head');
	var observer = null;

	if ('IntersectionObserver' in window) {
		observer = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible');
					}
				});
			},
			{ threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
		);
		revealEls.forEach(function (el) {
			el.classList.add('reveal');
			observer.observe(el);
		});
	}

})();
