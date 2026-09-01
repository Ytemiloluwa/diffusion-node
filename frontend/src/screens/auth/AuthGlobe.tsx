'use client';

import { geoEquirectangular, geoPath } from 'd3-geo';
import type { FeatureCollection, Geometry } from 'geojson';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { feature } from 'topojson-client';
import countries50m from 'world-atlas/countries-50m.json';
import { cn } from '@/lib/cn';
import type { GeometryCollection, Topology } from 'topojson-specification';

type AuthGlobeProps = {
  className?: string;
};

type AtlasProperties = {
  name?: string;
};

const TEXTURE_WIDTH = 2048;
const TEXTURE_HEIGHT = 1024;
const GLOBE_RADIUS = 1.55;

const topology = countries50m as unknown as Topology<{
  countries: GeometryCollection<AtlasProperties>;
}>;

const atlasFeatures = feature(
  topology,
  topology.objects.countries,
) as FeatureCollection<Geometry, AtlasProperties>;

const getCssColor = (element: HTMLElement, customProperty: string, fallback: string) => {
  const value = getComputedStyle(element).getPropertyValue(customProperty).trim();

  return value || fallback;
};

const drawMapTexture = (container: HTMLElement) => {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;

  const context = canvas.getContext('2d');

  if (!context) {
    return null;
  }

  const brand = getCssColor(container, '--dn-brand', '#14b8a6');
  const focus = getCssColor(container, '--dn-focus', '#22d3ee');
  const ink = getCssColor(container, '--dn-ink', '#e8f4f7');
  const surface = getCssColor(container, '--dn-surface', '#0b1a26');

  const oceanGradient = context.createLinearGradient(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
  oceanGradient.addColorStop(0, '#031826');
  oceanGradient.addColorStop(0.5, '#06131d');
  oceanGradient.addColorStop(1, surface);
  context.fillStyle = oceanGradient;
  context.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

  context.lineWidth = 1;
  context.strokeStyle = 'rgba(103, 232, 249, 0.18)';

  for (let longitude = 0; longitude <= TEXTURE_WIDTH; longitude += TEXTURE_WIDTH / 12) {
    context.beginPath();
    context.moveTo(longitude, 0);
    context.lineTo(longitude, TEXTURE_HEIGHT);
    context.stroke();
  }

  for (let latitude = TEXTURE_HEIGHT / 8; latitude < TEXTURE_HEIGHT; latitude += TEXTURE_HEIGHT / 8) {
    context.beginPath();
    context.moveTo(0, latitude);
    context.lineTo(TEXTURE_WIDTH, latitude);
    context.stroke();
  }

  const projection = geoEquirectangular().fitSize([TEXTURE_WIDTH, TEXTURE_HEIGHT], atlasFeatures);
  const pathGenerator = geoPath(projection, context);

  context.beginPath();
  pathGenerator(atlasFeatures);
  context.fillStyle = brand;
  context.globalAlpha = 0.35;
  context.fill();

  context.globalAlpha = 1;
  context.beginPath();
  pathGenerator(atlasFeatures);
  context.strokeStyle = focus;
  context.lineWidth = 1.35;
  context.stroke();

  context.beginPath();
  pathGenerator(atlasFeatures);
  context.strokeStyle = ink;
  context.globalAlpha = 0.16;
  context.lineWidth = 0.65;
  context.stroke();
  context.globalAlpha = 1;

  return canvas;
};

const createLatitudeRing = (radius: number, y: number, color: THREE.ColorRepresentation) => {
  const points: THREE.Vector3[] = [];
  const ringRadius = Math.sqrt(radius * radius - y * y);

  for (let index = 0; index <= 144; index += 1) {
    const angle = (index / 144) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * ringRadius, y, Math.sin(angle) * ringRadius));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.14,
  });

  return new THREE.Line(geometry, material);
};

export function AuthGlobe({ className }: AuthGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.05, 5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.domElement.setAttribute('data-auth-globe-canvas', 'true');
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.width = '100%';
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.append(renderer.domElement);

    const textureCanvas = drawMapTexture(container);
    const texture = textureCanvas ? new THREE.CanvasTexture(textureCanvas) : null;

    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    }

    const globeGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 96, 96);
    const globeMaterial = new THREE.MeshBasicMaterial({
      color: texture ? 0xffffff : 0x14b8a6,
      map: texture ?? undefined,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globe.rotation.set(-0.08, -0.45, 0.08);
    scene.add(globe);

    const atmosphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.02, 96, 96);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      opacity: 0.08,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    const ringGroup = new THREE.Group();
    [-0.86, -0.43, 0, 0.43, 0.86].forEach((yPosition) => {
      ringGroup.add(createLatitudeRing(GLOBE_RADIUS * 1.012, yPosition, 0x67e8f9));
    });
    ringGroup.rotation.set(-0.08, -0.45, 0.08);
    scene.add(ringGroup);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrameId = 0;

    const resizeRenderer = () => {
      const width = Math.max(container.clientWidth, 176);
      const height = Math.max(container.clientHeight, 176);

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resizeRenderer);
    resizeObserver.observe(container);
    resizeRenderer();

    const renderFrame = () => {
      if (!prefersReducedMotion) {
        globe.rotation.y += 0.0028;
        atmosphere.rotation.y += 0.0018;
        ringGroup.rotation.y += 0.0028;
      }

      renderer.render(scene, camera);
      animationFrameId = window.requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      globeGeometry.dispose();
      globeMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      ringGroup.children.forEach((child) => {
        const line = child as THREE.Line;
        line.geometry.dispose();

        if (Array.isArray(line.material)) {
          line.material.forEach((material) => material.dispose());
        } else {
          line.material.dispose();
        }
      });
      texture?.dispose();
      scene.remove(globe, atmosphere, ringGroup);
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative shrink-0 overflow-hidden',
        className,
      )}
      ref={containerRef}
      style={{ height: 'clamp(14rem, 21vw, 19rem)', width: 'clamp(14rem, 21vw, 19rem)' }}
    />
  );
}
