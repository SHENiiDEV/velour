<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 · Unfound — VELOUR</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=cormorant-garamond:300,400,500|jost:300,400,500" rel="stylesheet" />
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background-color: #100a0c;
            color: #ece3d6;
            font-family: 'Jost', sans-serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 24px;
            overflow: hidden;
            position: relative;
        }
        canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        }
        .glow {
            position: absolute;
            width: 450px;
            height: 450px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(78, 18, 36, 0.35) 0%, transparent 70%);
            filter: blur(60px);
            z-index: 0;
        }
        .content {
            position: relative;
            z-index: 2;
            max-width: 600px;
        }
        .badge {
            display: inline-block;
            border: 1px solid rgba(198, 161, 91, 0.3);
            background: rgba(198, 161, 91, 0.08);
            color: #e6cb88;
            padding: 6px 16px;
            border-radius: 9999px;
            font-size: 11px;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-weight: 300;
            margin-bottom: 24px;
        }
        h1 {
            font-family: 'Cormorant Garamond', serif;
            font-size: clamp(64px, 12vw, 110px);
            font-weight: 300;
            line-height: 0.95;
            color: #ece3d6;
            letter-spacing: -1px;
        }
        .lead {
            font-family: 'Cormorant Garamond', serif;
            font-size: clamp(22px, 4vw, 30px);
            font-weight: 300;
            color: rgba(236, 227, 214, 0.85);
            margin: 20px 0 12px;
            line-height: 1.3;
        }
        .sub {
            font-size: 14px;
            color: #9e8e88;
            font-weight: 300;
            line-height: 1.6;
            margin-bottom: 35px;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #c6a15b, #e6cb88);
            color: #100a0c;
            padding: 16px 36px;
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            text-decoration: none;
            border-radius: 2px;
            box-shadow: 0 4px 20px rgba(198, 161, 91, 0.2);
            transition: all 0.3s ease;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(198, 161, 91, 0.35);
        }
    </style>
</head>
<body>
    <div class="glow"></div>
    <canvas id="thermal"></canvas>

    <div class="content">
        <div class="badge">Code 404 · Unfound</div>
        <h1>Unfound.</h1>
        <p class="lead">What you reached for exists only in the shadows of imagination.</p>
        <p class="sub">The object has slipped away or never existed in this dimension. Move your cursor to warm the velvet canvas.</p>
        <a href="/" class="btn">Return to Sanctuary →</a>
    </div>

    <script>
        const canvas = document.getElementById('thermal');
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        window.onresize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };

        const particles = [];
        const colors = ['rgba(198, 161, 91, ', 'rgba(194, 77, 89, ', 'rgba(142, 28, 56, '];

        window.addEventListener('mousemove', (e) => {
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push({ x: e.clientX, y: e.clientY, radius: Math.random() * 40 + 25, alpha: 0.35, color, decay: 0.008 });
        });

        function animate() {
            ctx.clearRect(0, 0, width, height);
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.alpha -= p.decay;
                p.radius += 0.3;
                if (p.alpha <= 0) { particles.splice(i, 1); continue; }
                const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
                g.addColorStop(0, p.color + p.alpha + ')');
                g.addColorStop(0.5, p.color + (p.alpha * 0.4) + ')');
                g.addColorStop(1, p.color + '0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            requestAnimationFrame(animate);
        }
        animate();
    </script>
</body>
</html>
