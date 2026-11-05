import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const CyberHudCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Check width and height
    const width = mount.clientWidth || 360;
    const height = mount.clientHeight || 360;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Geometric Group
    const group = new THREE.Group();
    scene.add(group);

    // 1. Primary Polyhedral Wireframe (Icosahedron)
    const icosahedronGeometry = new THREE.IcosahedronGeometry(2.3, 0);
    const wireframeGeometry = new THREE.WireframeGeometry(icosahedronGeometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xFCEE0A,
      transparent: true,
      opacity: 0.85,
      linewidth: 1.5
    });
    const icosahedronLines = new THREE.LineSegments(wireframeGeometry, lineMaterial);
    group.add(icosahedronLines);

    // 2. Inner Octahedron
    const octahedronGeometry = new THREE.OctahedronGeometry(1.4, 0);
    const octaWireframe = new THREE.WireframeGeometry(octahedronGeometry);
    const innerMaterial = new THREE.LineBasicMaterial({
      color: 0xDFFF00,
      transparent: true,
      opacity: 0.4
    });
    const octaLines = new THREE.LineSegments(octaWireframe, innerMaterial);
    group.add(octaLines);

    // 3. Vertex Nodes (Glowing yellow point particles)
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xFCEE0A,
      size: 0.14,
      transparent: true,
      opacity: 0.95
    });
    const verticesPoints = new THREE.Points(icosahedronGeometry, pointsMaterial);
    group.add(verticesPoints);

    // 4. Subtle Outer Target Reticle Rings
    const ringGeometry = new THREE.RingGeometry(3.1, 3.12, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x444A56,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const outerRing = new THREE.Mesh(ringGeometry, ringMaterial);
    scene.add(outerRing);

    // Mouse Tracking for tilt
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      targetRotationY = x * 0.9;
      targetRotationX = y * 0.9;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Base rotation
      group.rotation.y += 0.007;
      group.rotation.x += 0.003;

      // Mouse responsive smoothing
      group.rotation.y += (targetRotationY - group.rotation.y) * 0.03;
      group.rotation.x += (targetRotationX - group.rotation.x) * 0.03;

      // Ring counter-rotation
      outerRing.rotation.z = -elapsedTime * 0.05;

      // Subtle breathing pulse on points
      const pulse = Math.sin(elapsedTime * 3) * 0.15 + 0.85;
      pointsMaterial.opacity = pulse;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const handleResize = () => {
      if (!mount) return;
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight;
      if (newWidth === 0 || newHeight === 0) return;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      icosahedronGeometry.dispose();
      octahedronGeometry.dispose();
      ringGeometry.dispose();
      lineMaterial.dispose();
      innerMaterial.dispose();
      pointsMaterial.dispose();
      ringMaterial.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial from-[#FCEE0A]/5 via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />
      
      {/* Three.js viewport */}
      <div ref={mountRef} className="w-full h-full min-h-[320px] max-h-[460px] cursor-grab active:cursor-grabbing" />
      
      {/* HUD overlay coordinates & telemetry labels */}
      <div className="absolute top-4 left-4 font-mono text-[11px] text-[#A0A4AC] tracking-wider pointer-events-none flex flex-col gap-0.5">
        <span className="text-[#FCEE0A] font-semibold">GEOMETRY_PROJECTION // 3D</span>
        <span>ISO: 30° / 60°</span>
        <span>CONSTRAINTS: ACTIVE</span>
      </div>

      <div className="absolute bottom-4 right-4 font-mono text-[11px] text-[#A0A4AC] tracking-wider pointer-events-none text-right flex flex-col gap-0.5">
        <span>X: 145.82mm</span>
        <span>Y: 72.10mm</span>
        <span className="text-[#FCEE0A]">FPS: 60.0 // WEBGL</span>
      </div>
    </div>
  );
};
