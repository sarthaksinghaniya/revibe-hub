import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Eye, Maximize2, Sparkles, Layers, Sliders } from 'lucide-react';
import { Upcycle3DModelConfig } from '@/lib/threeDModels';

interface ThreeDModelViewerProps {
  model: Upcycle3DModelConfig;
  currentStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

export const ThreeDModelViewer = ({
  model,
  currentStep = 5,
  onStepChange,
  className = '',
}: ThreeDModelViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [stepSlider, setStepSlider] = useState(currentStep);

  // Drag interaction state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setStepSlider(currentStep);
  }, [currentStep]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    // Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2, 5.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer with high-DPI and transparency
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x10b981, 1.4); // Emerald key light
    dirLight.position.set(4, 6, 4);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.8); // Cyan fill
    fillLight.position.set(-4, -2, -3);
    scene.add(fillLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.2, 10);
    pointLight.position.set(0, 3, 2);
    scene.add(pointLight);

    // Grid Floor
    const grid = new THREE.GridHelper(6, 12, 0x10b981, 0x27272a);
    grid.position.y = -1.6;
    scene.add(grid);

    // Root Group for the 3D model
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    buildModelGeometry(model, group, wireframe, stepSlider);

    // Render loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (groupRef.current) {
        if (autoRotate && !isDraggingRef.current) {
          groupRef.current.rotation.y += 0.008;
        }

        // Apply inertia drag damping
        if (!isDraggingRef.current) {
          groupRef.current.rotation.y += rotationVelocityRef.current.x;
          groupRef.current.rotation.x += rotationVelocityRef.current.y;
          rotationVelocityRef.current.x *= 0.92;
          rotationVelocityRef.current.y *= 0.92;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Observer
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    ro.observe(container);

    // Cleanup
    return () => {
      ro.disconnect();
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [model.id]);

  // Rebuild model when step or wireframe changes
  useEffect(() => {
    if (groupRef.current) {
      buildModelGeometry(model, groupRef.current, wireframe, stepSlider);
    }
  }, [model, wireframe, stepSlider]);

  // Mouse / Touch Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    rotationVelocityRef.current = { x: 0, y: 0 };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !groupRef.current) return;
    const deltaX = (e.clientX - prevMousePosRef.current.x) * 0.008;
    const deltaY = (e.clientY - prevMousePosRef.current.y) * 0.008;

    groupRef.current.rotation.y += deltaX;
    groupRef.current.rotation.x = Math.max(-0.9, Math.min(0.9, groupRef.current.rotation.x + deltaY));

    rotationVelocityRef.current = { x: deltaX * 0.5, y: deltaY * 0.5 };
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={`relative flex flex-col rounded-2xl overflow-hidden bg-gradient-to-b from-card to-card/60 border border-emerald-500/20 ${className}`}>
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-72 sm:h-80 cursor-grab active:cursor-grabbing touch-none select-none relative"
      />

      {/* Floating HUD Badges */}
      <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
        <span className="px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-md border border-emerald-500/40 text-[10px] font-data text-emerald-400 font-bold flex items-center gap-1.5">
          <Sparkles size={11} /> 3D Interactive Model
        </span>
        <span className="px-2 py-1 rounded-full bg-background/80 backdrop-blur-md border border-border text-[10px] font-data text-muted-foreground">
          Step {stepSlider} / 5
        </span>
      </div>

      {/* Floating View Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded-xl backdrop-blur-md border text-xs transition-colors ${
            autoRotate
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
              : 'bg-background/80 border-border text-muted-foreground hover:text-foreground'
          }`}
          title="Toggle Auto-Rotation"
        >
          <RotateCw size={14} className={autoRotate ? 'animate-spin [animation-duration:8s]' : ''} />
        </button>

        <button
          onClick={() => setWireframe(!wireframe)}
          className={`p-2 rounded-xl backdrop-blur-md border text-xs transition-colors ${
            wireframe
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
              : 'bg-background/80 border-border text-muted-foreground hover:text-foreground'
          }`}
          title="Toggle Wireframe Blueprint"
        >
          <Layers size={14} />
        </button>
      </div>

      {/* Assembly Progression Step Slider */}
      <div className="p-3 bg-card/90 border-t border-border/80 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-display">
          <span className="text-foreground font-bold flex items-center gap-1.5">
            <Sliders size={13} className="text-emerald-400" />
            Assembly Exploded Blueprint
          </span>
          <span className="text-emerald-400 font-data text-[11px]">
            {model.steps[stepSlider - 1]?.title || 'Finished Product'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-data text-muted-foreground">Raw</span>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={stepSlider}
            onChange={(e) => {
              const val = Number(e.target.value);
              setStepSlider(val);
              if (onStepChange) onStepChange(val);
            }}
            className="flex-1 h-1.5 bg-surface-alt rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span className="text-[10px] font-data text-emerald-400 font-bold">Built</span>
        </div>

        <p className="text-[11px] text-muted-foreground line-clamp-1">
          {model.steps[stepSlider - 1]?.description}
        </p>
      </div>
    </div>
  );
};

// Procedural Geometry Construction for Each Material
function buildModelGeometry(
  model: Upcycle3DModelConfig,
  rootGroup: THREE.Group,
  wireframe: boolean,
  step: number
) {
  // Clear previous children
  while (rootGroup.children.length > 0) {
    const obj = rootGroup.children[0];
    rootGroup.remove(obj);
  }

  const matId = model.id;

  if (matId.includes('plastic')) {
    // PET Bottle Planter
    const bottleColor = 0x10b981;
    const waterColor = 0x38bdf8;
    const soilColor = 0x5b3a29;
    const plantColor = 0x22c55e;

    // Exploded offset based on step (step 1 = raw uncut, step 2-4 = exploded, step 5 = tight assembly)
    const explodeY = step === 1 ? 0 : step < 5 ? (5 - step) * 0.35 : 0;

    // 1. Bottom reservoir (Cylinder)
    const baseGeo = new THREE.CylinderGeometry(0.85, 0.85, 1.4, 24, 1, true);
    const baseMat = new THREE.MeshStandardMaterial({
      color: bottleColor,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
      metalness: 0.1,
      wireframe,
      side: THREE.DoubleSide,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.7;
    rootGroup.add(baseMesh);

    // Water level inside base
    if (step >= 4) {
      const waterGeo = new THREE.CylinderGeometry(0.82, 0.82, 0.6, 24);
      const waterMat = new THREE.MeshStandardMaterial({
        color: waterColor,
        transparent: true,
        opacity: 0.6,
        roughness: 0.05,
      });
      const waterMesh = new THREE.Mesh(waterGeo, waterMat);
      waterMesh.position.y = -1.0;
      rootGroup.add(waterMesh);
    }

    // 2. Inverted top funnel
    const funnelGeo = new THREE.ConeGeometry(0.85, 1.2, 24, 1, true);
    const funnelMat = new THREE.MeshStandardMaterial({
      color: bottleColor,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
      wireframe,
      side: THREE.DoubleSide,
    });
    const funnelMesh = new THREE.Mesh(funnelGeo, funnelMat);
    funnelMesh.rotation.x = Math.PI; // Inverted
    funnelMesh.position.y = 0.2 + explodeY;
    rootGroup.add(funnelMesh);

    // Cut guideline ring (illuminated)
    if (step <= 2) {
      const ringGeo = new THREE.TorusGeometry(0.87, 0.03, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0;
      rootGroup.add(ringMesh);
    }

    // 3. Soil inside funnel
    if (step >= 3) {
      const soilGeo = new THREE.ConeGeometry(0.78, 0.8, 20);
      const soilMat = new THREE.MeshStandardMaterial({ color: soilColor, roughness: 0.9, wireframe });
      const soilMesh = new THREE.Mesh(soilGeo, soilMat);
      soilMesh.rotation.x = Math.PI;
      soilMesh.position.y = 0.35 + explodeY;
      rootGroup.add(soilMesh);
    }

    // 4. Foliage / Herb Plant
    if (step >= 4) {
      const plantGroup = new THREE.Group();
      plantGroup.position.y = 0.7 + explodeY;

      // Stem
      const stemGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.9, 8);
      const stemMat = new THREE.MeshStandardMaterial({ color: plantColor, wireframe });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      plantGroup.add(stemMesh);

      // Leaves
      const leafGeo = new THREE.SphereGeometry(0.28, 8, 8);
      leafGeo.scale(1.4, 0.3, 0.7);
      const leafMat = new THREE.MeshStandardMaterial({ color: plantColor, roughness: 0.4, wireframe });

      for (let i = 0; i < 4; i++) {
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        const angle = (i * Math.PI) / 2;
        leaf.position.set(Math.cos(angle) * 0.35, 0.25 + i * 0.1, Math.sin(angle) * 0.35);
        leaf.rotation.y = angle;
        leaf.rotation.z = 0.35;
        plantGroup.add(leaf);
      }
      rootGroup.add(plantGroup);
    }
  } else if (matId.includes('cardboard')) {
    // Cardboard Organizer
    const cardColor = 0xb47b4d;
    const explode = step < 4 ? (4 - step) * 0.3 : 0;

    // Base Tray
    const baseGeo = new THREE.BoxGeometry(2.4, 0.2, 1.6);
    const cardMat = new THREE.MeshStandardMaterial({ color: cardColor, roughness: 0.8, wireframe });
    const baseMesh = new THREE.Mesh(baseGeo, cardMat);
    baseMesh.position.y = -0.8;
    rootGroup.add(baseMesh);

    // Tier 1 Tall Back
    const backGeo = new THREE.BoxGeometry(2.4, 1.4, 0.1);
    const backMesh = new THREE.Mesh(backGeo, cardMat);
    backMesh.position.set(0, -0.1 + explode, -0.75 - explode);
    rootGroup.add(backMesh);

    // Tier 2 Middle divider
    const midGeo = new THREE.BoxGeometry(2.4, 0.9, 0.1);
    const midMesh = new THREE.Mesh(midGeo, cardMat);
    midMesh.position.set(0, -0.35, -0.1);
    rootGroup.add(midMesh);

    // Side Walls
    const sideGeo = new THREE.BoxGeometry(0.1, 1.4, 1.6);
    const leftSide = new THREE.Mesh(sideGeo, cardMat);
    leftSide.position.set(-1.2 - explode, -0.1, 0);
    rootGroup.add(leftSide);

    const rightSide = new THREE.Mesh(sideGeo, cardMat);
    rightSide.position.set(1.2 + explode, -0.1, 0);
    rootGroup.add(rightSide);

    // Colorful Stationery Pencils in Step 5
    if (step >= 5) {
      const penGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8);
      const colors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b];
      colors.forEach((col, idx) => {
        const penMat = new THREE.MeshStandardMaterial({ color: col });
        const pen = new THREE.Mesh(penGeo, penMat);
        pen.position.set(-0.6 + idx * 0.2, 0.2, -0.4);
        pen.rotation.z = (idx - 1.5) * 0.08;
        rootGroup.add(pen);
      });
    }
  } else if (matId.includes('metal')) {
    // Metal Lantern
    const metalColor = 0xd1d5db;
    const canGeo = new THREE.CylinderGeometry(0.75, 0.75, 1.8, 32, 1, true);
    const canMat = new THREE.MeshStandardMaterial({
      color: metalColor,
      metalness: 0.85,
      roughness: 0.2,
      wireframe,
      side: THREE.DoubleSide,
    });
    const canMesh = new THREE.Mesh(canGeo, canMat);
    rootGroup.add(canMesh);

    // Punch hole dots visualization
    if (step >= 3) {
      const dotGeo = new THREE.SphereGeometry(0.035, 6, 6);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // Glowing warm apertures

      for (let y = -0.6; y <= 0.6; y += 0.25) {
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
          const dot = new THREE.Mesh(dotGeo, dotMat);
          dot.position.set(Math.cos(angle) * 0.76, y, Math.sin(angle) * 0.76);
          rootGroup.add(dot);
        }
      }

      // Internal glowing LED Candle
      const candleGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.35, 16);
      const candleMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.8 });
      const candle = new THREE.Mesh(candleGeo, candleMat);
      candle.position.y = -0.7;
      rootGroup.add(candle);
    }
  } else {
    // Default / Glass Terrarium
    const jarGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.6, 24, 1, true);
    const jarMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
      wireframe,
      side: THREE.DoubleSide,
    });
    const jarMesh = new THREE.Mesh(jarGeo, jarMat);
    rootGroup.add(jarMesh);

    // Base pebbles & succulent
    const basePebbles = new THREE.CylinderGeometry(0.75, 0.75, 0.3, 20);
    const pebbleMat = new THREE.MeshStandardMaterial({ color: 0x71717a, roughness: 0.9, wireframe });
    const pebbleMesh = new THREE.Mesh(basePebbles, pebbleMat);
    pebbleMesh.position.y = -0.65;
    rootGroup.add(pebbleMesh);

    if (step >= 4) {
      const plantCore = new THREE.DodecahedronGeometry(0.35);
      const plantMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4, wireframe });
      const plantMesh = new THREE.Mesh(plantCore, plantMat);
      plantMesh.position.y = -0.2;
      rootGroup.add(plantMesh);
    }
  }
}
