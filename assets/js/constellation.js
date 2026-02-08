/**
 * Constellation background effect — dots and connecting lines.
 * Hero and projects sections only; uses :root theme colors; subtle opacity.
 */
(function () {
	'use strict';

	var CONFIG = {
		baseOpacity: 0.28,
		hoverOpacity: 0.65,
		lineBaseOpacity: 0.22,
		lineHoverOpacity: 0.5,
		maxLineDistance: 150,
		mouseRadius: 140,
		dotRadius: 1.6,
		dotCountDesktop: 95,
		dotCountMobile: 50,
		driftSpeed: 0.08,
		mobileWidth: 768
	};

	function getThemeColors() {
		var root = document.documentElement;
		var style = window.getComputedStyle(root);
		return {
			accent: style.getPropertyValue('--color-accent').trim() || '#2577f9',
			text: style.getPropertyValue('--color-text').trim() || '#E2E8F0',
			textMuted: style.getPropertyValue('--color-text-muted').trim() || '#94a3b8'
		};
	}

	function hexToRgba(hex, alpha) {
		hex = hex.replace('#', '');
		var r = parseInt(hex.substr(0, 2), 16);
		var g = parseInt(hex.substr(2, 2), 16);
		var b = parseInt(hex.substr(4, 2), 16);
		return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
	}

	function createParticles(count, width, height) {
		var particles = [];
		for (var i = 0; i < count; i++) {
			particles.push({
				x: Math.random() * width,
				y: Math.random() * height,
				vx: (Math.random() - 0.5) * CONFIG.driftSpeed,
				vy: (Math.random() - 0.5) * CONFIG.driftSpeed
			});
		}
		return particles;
	}

	function initConstellation(canvasId) {
		var canvas = document.getElementById(canvasId);
		if (!canvas) return;

		var ctx = canvas.getContext('2d');
		var container = canvas.parentElement;
		var section = container.closest('section');
		var particles = [];
		var mouse = { x: -1000, y: -1000 };
		var mouseTarget = { x: -1000, y: -1000 };
		var colors = getThemeColors();
		var dotColor = colors.textMuted || colors.text;
		var lineColor = colors.textMuted || colors.text;
		var accentColor = colors.accent;
		var animationId = null;

		function countDots() {
			return window.innerWidth <= CONFIG.mobileWidth ? CONFIG.dotCountMobile : CONFIG.dotCountDesktop;
		}

		function setSize() {
			var rect = section.getBoundingClientRect();
			var dpr = window.devicePixelRatio || 1;
			var w = rect.width;
			var h = rect.height;
			canvas.width = w * dpr;
			canvas.height = h * dpr;
			canvas.style.width = w + 'px';
			canvas.style.height = h + 'px';
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			particles = createParticles(countDots(), w, h);
		}

		function getLocalMouse(e) {
			var rect = section.getBoundingClientRect();
			return {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top
			};
		}

		function distance(a, b) {
			return Math.hypot(b.x - a.x, b.y - a.y);
		}

		function draw() {
			var rect = section.getBoundingClientRect();
			var w = rect.width;
			var h = rect.height;

			// Smooth mouse follow
			mouse.x += (mouseTarget.x - mouse.x) * 0.12;
			mouse.y += (mouseTarget.y - mouse.y) * 0.12;

			ctx.clearRect(0, 0, w, h);

			// Optional drift
			particles.forEach(function (p) {
				p.x += p.vx;
				p.y += p.vy;
				if (p.x < 0 || p.x > w) p.vx *= -1;
				if (p.y < 0 || p.y > h) p.vy *= -1;
				p.x = Math.max(0, Math.min(w, p.x));
				p.y = Math.max(0, Math.min(h, p.y));
			});

			var mx = mouse.x;
			var my = mouse.y;

			// Draw lines (distance-based opacity; brighter when near mouse)
			for (var i = 0; i < particles.length; i++) {
				for (var j = i + 1; j < particles.length; j++) {
					var a = particles[i];
					var b = particles[j];
					var d = distance(a, b);
					if (d > CONFIG.maxLineDistance) continue;

					var distRatio = 1 - d / CONFIG.maxLineDistance;
					var lineOpacity = distRatio * CONFIG.lineBaseOpacity;

					var nearA = distance({ x: mx, y: my }, a) < CONFIG.mouseRadius;
					var nearB = distance({ x: mx, y: my }, b) < CONFIG.mouseRadius;
					if (nearA || nearB) {
						lineOpacity = Math.max(lineOpacity, distRatio * CONFIG.lineHoverOpacity);
					}

					ctx.beginPath();
					ctx.moveTo(a.x, a.y);
					ctx.lineTo(b.x, b.y);
					ctx.strokeStyle = hexToRgba(lineColor, lineOpacity);
					ctx.lineWidth = 1;
					ctx.stroke();
				}
			}

			// Draw dots (glow when near mouse)
			particles.forEach(function (p) {
				var d = distance({ x: mx, y: my }, p);
				var near = d < CONFIG.mouseRadius;
				var t = near ? 1 - d / CONFIG.mouseRadius : 0;
				var opacity = CONFIG.baseOpacity + t * (CONFIG.hoverOpacity - CONFIG.baseOpacity);
				var color = near ? accentColor : dotColor;
				var radius = near ? CONFIG.dotRadius + t * 1.4 : CONFIG.dotRadius;

				ctx.beginPath();
				ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
				ctx.fillStyle = hexToRgba(color, opacity);
				ctx.fill();
			});

			animationId = requestAnimationFrame(draw);
		}

		function onResize() {
			setSize();
		}

		function onMouseMove(e) {
			var pos = getLocalMouse(e);
			mouseTarget.x = pos.x;
			mouseTarget.y = pos.y;
		}

		function onMouseLeave() {
			mouseTarget.x = -1000;
			mouseTarget.y = -1000;
		}

		section.addEventListener('mouseenter', function (e) {
			var pos = getLocalMouse(e);
			mouseTarget.x = pos.x;
			mouseTarget.y = pos.y;
		});
		section.addEventListener('mousemove', onMouseMove);
		section.addEventListener('mouseleave', onMouseLeave);

		window.addEventListener('resize', onResize);
		setSize();
		draw();
	}

	function init() {
		initConstellation('constellation-hero');
		initConstellation('constellation-projects');
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
