import React, { useEffect, useRef } from 'react';

export default function WeatherBackground({ weatherCode = 0, isDay = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Weather type categorization
    const isRain = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode);
    const isThunder = [95, 96, 99].includes(weatherCode);
    const isSnow = [71, 73, 75].includes(weatherCode);
    const isClear = [0, 1].includes(weatherCode);

    // Particles array
    const particles = [];
    const count = isRain ? 90 : isSnow ? 60 : 35;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: isRain ? 12 + Math.random() * 15 : 2 + Math.random() * 3,
        speedY: isRain ? 9 + Math.random() * 8 : isSnow ? 1 + Math.random() * 2 : 0.3 + Math.random() * 0.7,
        speedX: isRain ? -1 - Math.random() * 1.5 : (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        radius: Math.random() * 2 + 1
      });
    }

    let lightningTimer = 0;
    let lightningFlash = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Thunderstorm lightning flash
      if (isThunder) {
        lightningTimer++;
        if (lightningTimer > 180 && Math.random() < 0.03) {
          lightningFlash = 0.3 + Math.random() * 0.3;
          lightningTimer = 0;
        }
        if (lightningFlash > 0) {
          ctx.fillStyle = `rgba(216, 180, 254, ${lightningFlash})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          lightningFlash -= 0.04;
        }
      }

      // Draw particles
      particles.forEach((p) => {
        if (isRain) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + p.length);
          ctx.strokeStyle = `rgba(125, 211, 252, ${p.opacity})`;
          ctx.lineWidth = 1.2;
          ctx.lineCap = 'round';
          ctx.stroke();
        } else if (isSnow) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 1.5})`;
          ctx.fill();
        } else if (isClear && isDay) {
          // Warm glowing solar particles
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(251, 191, 36, ${p.opacity * 0.6})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(251, 191, 36, 0.4)';
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Ambient night stars / mist
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(186, 230, 253, ${p.opacity * 0.5})`;
          ctx.fill();
        }

        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [weatherCode, isDay]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dynamic atmospheric radial gradient backdrops */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-600/15 blur-[120px]" />
      <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-blue-600/10 blur-[140px]" />
      <div className="absolute -bottom-40 left-1/4 w-[28rem] h-[28rem] rounded-full bg-indigo-600/15 blur-[130px]" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
    </div>
  );
}
