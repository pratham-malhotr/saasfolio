import {
  AdditiveBlending, BufferGeometry, Color, DoubleSide, Float32BufferAttribute, Group,
  LineBasicMaterial, LineSegments, Mesh, PlaneGeometry, Points, ShaderMaterial,
} from "three";

export function buildFolioScenery(compact: boolean) {
  const world = new Group();
  const orbit = new Group();
  orbit.rotation.set(.44, -.11, -.28);
  world.add(orbit);

  const positions: number[] = [];
  const progress: number[] = [];
  const sides: number[] = [];
  const steps = compact ? 48 : 82;
  for (let ring = 0; ring < 4; ring++) {
    const radius = 1.47 + .37 * ring;
    const start = ring * 1.73;
    const sweep = Math.PI * (ring === 0 ? 1.65 : 1.28);
    for (let point = 0; point < steps - 1; point++) {
      for (const [end, side] of [[0, -1], [0, 1], [1, 1], [0, -1], [1, 1], [1, -1]]) {
        const t = (point + end) / (steps - 1);
        const angle = start + t * sweep;
        const r = radius + side * (ring > 1 ? .012 : .009);
        positions.push(Math.cos(angle) * r, Math.sin(angle) * r * .53, Math.sin(angle) * .52 - .25);
        progress.push(t + ring * .21);
        sides.push(side);
      }
    }
  }
  const tracks = new BufferGeometry()
    .setAttribute("position", new Float32BufferAttribute(positions, 3))
    .setAttribute("aProgress", new Float32BufferAttribute(progress, 1))
    .setAttribute("aSide", new Float32BufferAttribute(sides, 1));
  const trail = new ShaderMaterial({
    uniforms: { accent: { value: new Color() }, phase: { value: 0 }, pulse: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aProgress;
      attribute float aSide;
      varying float vProgress;
      varying float vSide;
      void main() {
        vProgress = aProgress;
        vSide = aSide;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 accent;
      uniform float phase;
      uniform float pulse;
      varying float vProgress;
      varying float vSide;
      void main() {
        float packet = exp(-abs(fract(vProgress - phase - .5) - .5) * 25.0);
        float edge = 1.0 - smoothstep(.2, 1.0, abs(vSide));
        gl_FragColor = vec4(mix(accent, vec3(.9, .97, 1.0), packet * .46), (.25 + pulse * packet * .66) * edge);
        #include <colorspace_fragment>
      }
    `,
    transparent: true, blending: AdditiveBlending, depthWrite: false, side: DoubleSide,
  });
  orbit.add(new Mesh(tracks, trail));

  const dots = [], sizes = [], seeds = [];
  for (let index = 0; index < (compact ? 95 : 220); index++) {
    const angle = index * 2.39996;
    const radius = 1.05 + ((index * 79) % 197) / 66;
    dots.push(Math.cos(angle) * radius, Math.sin(angle) * radius * .71, Math.sin(index * 19.4) * 1.03 - 1.06);
    sizes.push(1.2 + (index % 13 === 0 ? 2.2 : (index % 4) * .44));
    seeds.push(index * .84);
  }
  const dustGeometry = new BufferGeometry().setAttribute("position", new Float32BufferAttribute(dots, 3))
    .setAttribute("aSize", new Float32BufferAttribute(sizes, 1)).setAttribute("aSeed", new Float32BufferAttribute(seeds, 1));
  const dustMaterial = new ShaderMaterial({
    uniforms: { accent: { value: new Color() }, phase: { value: 0 }, pixelRatio: { value: 1 } },
    vertexShader: /* glsl */ `
      uniform float phase;
      uniform float pixelRatio;
      attribute float aSize;
      attribute float aSeed;
      varying float vLight;
      void main() {
        vLight = .2 + .8 * pow(.5 + .5 * sin(phase * 4.0 + aSeed), 4.0);
        vec4 positionInView = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * pixelRatio / max(1.0, -positionInView.z * .14);
        gl_Position = projectionMatrix * positionInView;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 accent;
      varying float vLight;
      void main() {
        float halo = 1.0 - smoothstep(.12, .5, distance(gl_PointCoord, vec2(.5)));
        gl_FragColor = vec4(mix(accent, vec3(.9, .96, 1.0), .4), vLight * halo * .72);
        #include <colorspace_fragment>
      }
    `,
    transparent: true, blending: AdditiveBlending, depthWrite: false,
  });
  const dust = new Points(dustGeometry, dustMaterial);
  world.add(dust);

  const floorLines: number[] = [];
  for (let index = -8; index <= 8; index++) {
    const step = index * .32;
    floorLines.push(-2.8, 0, step, 2.8, 0, step, step, 0, -2.8, step, 0, 2.8);
  }
  const floor = new LineSegments(new BufferGeometry().setAttribute("position", new Float32BufferAttribute(floorLines, 3)),
    new LineBasicMaterial({ color: "#597e88", opacity: .24, transparent: true, depthWrite: false }));
  floor.position.set(0, -1.46, -.54);
  world.add(floor);

  const floorGlow = new ShaderMaterial({
    uniforms: { accent: { value: new Color() } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 accent;
      varying vec2 vUv;
      void main() {
        float glow = pow(max(0.0, 1.0 - 2.0 * distance(vUv, vec2(.5))), 3.0);
        gl_FragColor = vec4(accent, glow * .23);
        #include <colorspace_fragment>
      }
    `,
    transparent: true, blending: AdditiveBlending, depthWrite: false,
  });
  const glow = new Mesh(new PlaneGeometry(4.8, 4.8), floorGlow);
  glow.rotation.x = -Math.PI / 2;
  glow.position.set(0, -1.43, -.33);
  world.add(glow);

  return {
    world,
    update(color: Color, phase: number, sweep: number, pixelRatio: number, angle: number) {
      trail.uniforms.accent.value.copy(color);
      trail.uniforms.phase.value = phase;
      trail.uniforms.pulse.value = sweep;
      dustMaterial.uniforms.accent.value.copy(color);
      dustMaterial.uniforms.phase.value = phase;
      dustMaterial.uniforms.pixelRatio.value = pixelRatio;
      floorGlow.uniforms.accent.value.copy(color);
      orbit.rotation.z = -.28 + angle * .22;
      dust.rotation.z = angle * .16;
    },
  };
}
