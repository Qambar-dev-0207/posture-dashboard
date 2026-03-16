import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export default function Posture3D({ deviations = {} }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [loadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    // Transparent background to let the glass card effect show through
    scene.background = null; 
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.7, 2.5);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Cyber Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(8, 12, 8);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Neon Blue Rim Light (Cyber effect)
    const blueLight = new THREE.PointLight(0x38bdf8, 2, 10);
    blueLight.position.set(-2, 2, 2);
    scene.add(blueLight);

    // Neon Purple Fill Light
    const purpleLight = new THREE.PointLight(0x818cf8, 1.5, 10);
    purpleLight.position.set(2, 1, 2);
    scene.add(purpleLight);

    // Create enhanced human figure
    const createHumanFigure = () => {
      const group = new THREE.Group();

      // Helper function to create bone-like geometry
      const createBone = (width, height, depth, color, position, rotation) => {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshPhongMaterial({ 
          color: color,
          shininess: 100,
          specular: 0x111111,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        
        if (position) mesh.position.copy(position);
        if (rotation) {
          if (rotation.x !== undefined) mesh.rotation.x = THREE.MathUtils.degToRad(rotation.x);
          if (rotation.y !== undefined) mesh.rotation.y = THREE.MathUtils.degToRad(rotation.y);
          if (rotation.z !== undefined) mesh.rotation.z = THREE.MathUtils.degToRad(rotation.z);
        }
        
        group.add(mesh);
        return mesh;
      };

      // Cyber-style metallic material for joints
      const jointMaterial = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.2,
        metalness: 0.8
      });

      // Head
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 })
      );
      head.position.y = 1.55;
      head.position.z = -0.05;
      head.rotation.z = THREE.MathUtils.degToRad(deviations.neck || 0);
      head.castShadow = true;
      head.receiveShadow = true;
      group.add(head);

      // Neck
      createBone(0.08, 0.25, 0.08, 0xcbd5e1, 
        new THREE.Vector3(0, 1.32, -0.02),
        { z: deviations.neck || 0 }
      );

      // Upper spine (back) - Blue indicators
      const spine = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.45, 0.1),
        new THREE.MeshPhongMaterial({ color: 0x0ea5e9, emissive: 0x0ea5e9, emissiveIntensity: 0.2 })
      );
      spine.position.set(0, 1.05, 0);
      spine.rotation.z = THREE.MathUtils.degToRad((deviations.back || 0) * 0.5);
      spine.castShadow = true;
      spine.receiveShadow = true;
      group.add(spine);

      // Lower spine (waist) - Purple indicators
      const waist = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.35, 0.12),
        new THREE.MeshPhongMaterial({ color: 0x8b5cf6, emissive: 0x8b5cf6, emissiveIntensity: 0.2 })
      );
      waist.position.set(0, 0.55, 0.05);
      waist.rotation.z = THREE.MathUtils.degToRad((deviations.waist || 0) * 0.3);
      waist.castShadow = true;
      waist.receiveShadow = true;
      group.add(waist);

      // Pelvis
      const pelvis = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.15, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.5 })
      );
      pelvis.position.y = 0.2;
      pelvis.castShadow = true;
      pelvis.receiveShadow = true;
      group.add(pelvis);

      // Shoulders - Green indicators
      const shoulderGeo = new THREE.SphereGeometry(0.08, 32, 32);
      const shoulderMat = new THREE.MeshPhongMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.2 });

      const leftShoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
      leftShoulder.position.set(-0.25, 1.25, 0);
      leftShoulder.rotation.z = THREE.MathUtils.degToRad(deviations.left_shoulder || 0);
      leftShoulder.castShadow = true;
      group.add(leftShoulder);

      const rightShoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
      rightShoulder.position.set(0.25, 1.25, 0);
      rightShoulder.rotation.z = THREE.MathUtils.degToRad(-(deviations.right_shoulder || 0));
      rightShoulder.castShadow = true;
      group.add(rightShoulder);

      // Arms
      const armGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.5, 16);
      const armMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0 });

      const leftArm = new THREE.Mesh(armGeo, armMat);
      leftArm.position.set(-0.35, 0.8, 0);
      leftArm.rotation.z = THREE.MathUtils.degToRad(35);
      leftArm.castShadow = true;
      group.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, armMat);
      rightArm.position.set(0.35, 0.8, 0);
      rightArm.rotation.z = THREE.MathUtils.degToRad(-35);
      rightArm.castShadow = true;
      group.add(rightArm);

      return group;
    };

    const human = createHumanFigure();
    scene.add(human);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(10, 20, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -0.1;
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    setLoadingComplete(true);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Gentle rotation
      human.rotation.y += 0.003;
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [deviations]);

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <i className="bi bi-person-bounding-box text-primary-400"></i>
          <span className="text-white">Live Digital Twin</span>
        </h3>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Live</span>
        </span>
      </div>
      
      <div 
        ref={containerRef}
        className="flex-1 relative min-h-[400px] bg-gradient-radial from-primary-900/10 to-transparent"
      >
        {!loadingComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="inline-block animate-spin text-4xl mb-4 text-primary-500">
                 <i className="bi bi-cpu"></i>
              </div>
              <p className="text-primary-400 font-mono text-sm tracking-widest animate-pulse">RENDERING MODEL...</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-white/5 bg-white/5">
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_#0ea5e9]" />
            <span className="text-slate-400">Back: <span className="text-white">{(deviations.back || 0).toFixed(1)}°</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-secondary-500 shadow-[0_0_8px_#6366f1]" />
            <span className="text-slate-400">Waist: <span className="text-white">{(deviations.waist || 0).toFixed(1)}°</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_#10b981]" />
            <span className="text-slate-400">Shoulders: <span className="text-white">{((deviations.left_shoulder || 0 + deviations.right_shoulder || 0) / 2).toFixed(1)}°</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-200" />
            <span className="text-slate-400">Neck: <span className="text-white">{(deviations.neck || 0).toFixed(1)}°</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
