(function () {
	'use strict';

	var THEME_STORAGE_KEY = 'portfolio-theme';

	function getTheme() {
		try {
			return localStorage.getItem(THEME_STORAGE_KEY) || 'default';
		} catch (e) {
			return 'default';
		}
	}

	function setTheme(value) {
		try {
			if (value === 'default') {
				localStorage.removeItem(THEME_STORAGE_KEY);
			} else {
				localStorage.setItem(THEME_STORAGE_KEY, value);
			}
		} catch (e) {}
	}

	function applyTheme(theme) {
		var html = document.documentElement;
		if (theme === 'default') {
			html.removeAttribute('data-theme');
		} else {
			html.setAttribute('data-theme', theme);
		}
		document.querySelectorAll('.theme-btn').forEach(function (btn) {
			btn.classList.toggle('is-active', btn.getAttribute('data-theme') === theme);
		});
	}

	// Apply saved theme on load
	applyTheme(getTheme());

	// Theme button clicks
	document.querySelectorAll('.theme-btn').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var theme = this.getAttribute('data-theme');
			applyTheme(theme);
			setTheme(theme);
		});
	});

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
