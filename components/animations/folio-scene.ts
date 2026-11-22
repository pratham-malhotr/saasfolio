import {
  ACESFilmicToneMapping, AmbientLight, BufferGeometry, CanvasTexture, Color, DirectionalLight,
  EquirectangularReflectionMapping, InstancedMesh, Material, PerspectiveCamera, PMREMGenerator, Scene,
  SRGBColorSpace, Vector3, WebGLRenderer,
} from "three";
import type { FolioVariant } from "./folio-content";
import { buildFolioModel } from "./folio-model";
import { buildFolioScenery } from "./folio-scenery";

const complete = (value: number) => Math.min(1, Math.max(0, value));
const easeOut = (value: number) => 1 - Math.pow(1 - complete(value), 3);

type LayerPose = [x: number, y: number, z: number, rx: number, ry: number, rz: number, scale: number];

function layerPose(variant: FolioVariant, view: number, index: number, count: number): LayerPose {
  const offset = index - (count - 1) / 2;
  if (variant === "hosting") {
    if (view === 1) return [offset * .038, .1, offset * .22, 0, 0, 0, 1.03 - index * .045];
    if (view === 2) return [offset * .52, offset % 1 * .25, offset * .36, offset * .045, offset * .17, -offset * .08, .68];
    return [0, .02, offset * .41, 0, 0, 0, 1];
  }
  if (variant === "compare") {
    const side = index < 2 ? -1 : 1;
    const front = index % 2 === 1;
    if (view === 1) return [side * 1.04, side * .25 - (front ? 0 : .16), front ? .45 : -.08, .18, side * -.25, side * -.085, front ? 1 : .88];
    if (view === 2) return [offset * .78, -.085 + (front ? .14 : -.13), front ? .24 : -.28, -.25, -offset * .21, offset * -.08, .84];
    return [side * (front ? .89 : 1.05), front ? .06 : -.05, front ? .34 : -.05, side * .06, side * -.38, side * -.15, .94];
  }
  if (view === 1) {
    const side = index < 2 ? -1 : 1;
    return [side * (.92 + (index % 2) * .18), (index % 2) * .18 - .16, offset * .24, -.15, -side * .20, side * -.30, .80];
  }
  if (view === 2) return [offset * .32, -Math.abs(offset) * .14, offset * .24, -.24, -offset * .115, offset * -.16, .85];
  return [offset * .21, offset * .115, offset * .235, offset * .036, offset * -.066, offset * -.18, .98];
}

function lightStudio(renderer: WebGLRenderer) {
  const canvas = document.createElement("canvas");
  canvas.width = 192;
  canvas.height = 96;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.fillStyle = "#334353";
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (const [x, y, width, height, color] of [[46, 25, 43, 12, "#fbfff6"], [122, 34, 29, 38, "#adcaed"], [3, 62, 31, 6, "#b1dbab"]] as const) {
    const glow = context.createRadialGradient(x, y, 1, x, y, Math.max(width, height));
    glow.addColorStop(0, color);
    glow.addColorStop(1, "#73849a00");
    context.fillStyle = glow;
    context.fillRect(x - width, y - height, width * 2, height * 2);
    context.fillStyle = color;
    context.fillRect(x - width / 2, y - height / 2, width, height);
  }
  const panorama = new CanvasTexture(canvas);
  panorama.mapping = EquirectangularReflectionMapping;
  panorama.colorSpace = SRGBColorSpace;
  const generator = new PMREMGenerator(renderer);
  try {
    return generator.fromEquirectangular(panorama);
  } finally {
    panorama.dispose();
    generator.dispose();
  }
}

export function createFolioScene(
  canvas: HTMLCanvasElement,
  variant: FolioVariant,
  compact: boolean,
  initialView: number,
  accents: string[],
  { onPaint, onFailure }: { onPaint: () => void; onFailure: () => void },
) {
  const context = canvas.getContext("webgl2", {
    alpha: true, antialias: true, powerPreference: "low-power", failIfMajorPerformanceCaveat: true,
  });
  if (!context) return;

  const renderer = new WebGLRenderer({ canvas, context, alpha: true });
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.17;
  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, .1, 30);
  const model = buildFolioModel(variant, compact);
  const scenery = buildFolioScenery(compact);
  const key = new DirectionalLight("#e9fff0", 2.05);
  key.position.set(-3, 4, 4);
  const rim = new DirectionalLight("#8bbaff", 2.3);
  rim.position.set(3, -.9, 1.5);
  scene.add(model.root, scenery.world, key, rim, new AmbientLight("#bccfe8", 1.16));
  const environment = lightStudio(renderer);
  if (environment) {
    scene.environment = environment.texture;
    scene.environmentIntensity = .94;
  }

  const poses = accents.map((_, view) => model.layers.map((_, index) => layerPose(variant, view, index, model.layers.length)));
  const colors = accents.map(value => new Color(value));
  const color = colors[initialView].clone();
  const target = new Vector3();
  model.layers.forEach(({ group }, index) => {
    const [x, y, z, rx, ry, rz, scale] = poses[initialView][index];
    group.position.set(x * .25, y * .25, z * .75);
    group.rotation.set(rx * .25, ry * .25, rz * .25);
    group.scale.setScalar(scale);
  });

  let view = initialView;
  let frame = 0;
  let visible = false;
  let painted = false;
  let lastTime = 0;
  let elapsed = 0;
  let activity = 2100;
  let ratio = 1;
  let hoverX = 0, hoverY = 0, targetHoverX = 0, targetHoverY = 0;
  let yaw = 0, pitch = 0, targetYaw = 0, targetPitch = 0;
  let spin = 0, spinFrom = 0;
  let spinStart: number | undefined;
  const spinLength = 1250;
  const rack = variant === "hosting";
  const comparison = variant === "compare";

  function render(delta: number) {
    const blend = 1 - Math.exp(-delta / 132);
    color.lerp(colors[view], blend);
    model.tint(color);
    model.layers.forEach(({ group }, index) => {
      const [x, y, z, rx, ry, rz, scale] = poses[view][index];
      group.position.lerp(target.set(x, y, z), blend);
      group.rotation.x += (rx - group.rotation.x) * blend;
      group.rotation.y += (ry - group.rotation.y) * blend;
      group.rotation.z += (rz - group.rotation.z) * blend;
      group.scale.setScalar(group.scale.x + (scale - group.scale.x) * blend);
    });
    hoverX += (targetHoverX - hoverX) * blend;
    hoverY += (targetHoverY - hoverY) * blend;
    yaw += (targetYaw - yaw) * blend;
    pitch += (targetPitch - pitch) * blend;
    if (spinStart !== undefined) spin = spinFrom + Math.PI * 2 * easeOut((elapsed - spinStart) / spinLength);
    const open = easeOut(elapsed / 1650);
    model.root.rotation.set((rack ? -.95 : comparison ? .10 : .28) + hoverY * .21 + pitch,
      (rack ? -.23 : comparison ? -.13 : -.38) + hoverX * .42 + yaw + spin - (1 - open) * .34,
      (rack ? -.17 : comparison ? .032 : -.30) + hoverX * .04);
    model.root.position.y = .02 - (1 - open) * .21;
    model.root.scale.setScalar(.89 + open * .11);
    // The track animation stops with the model, so an idle canvas needs no frames.
    scenery.update(color, elapsed * .00068, .62 + complete(activity / 1000) * .38, ratio, Math.sin(yaw + spin) + hoverX);
    renderer.render(scene, camera);
    if (!painted) {
      painted = true;
      onPaint();
    }
  }

  function tick(now: number) {
    frame = 0;
    const delta = lastTime ? now - lastTime : 17;
    if (compact && lastTime && delta < 31) {
      frame = requestAnimationFrame(tick);
      return;
    }
    lastTime = now;
    elapsed += delta;
    activity = Math.max(0, activity - delta);
    try {
      render(delta);
    } catch {
      onFailure();
      return;
    }
    if (activity > 0) frame = requestAnimationFrame(tick);
    else lastTime = 0;
  }

  function wake(duration = 0) {
    activity = Math.max(activity, duration);
    if (visible && !frame) frame = requestAnimationFrame(tick);
  }

  return {
    resize(width: number, height: number) {
      if (width < 2 || height < 2) return;
      ratio = Math.min(window.devicePixelRatio, compact ? 1.28 : 1.7, Math.sqrt((compact ? 310_000 : 910_000) / (width * height)));
      renderer.setPixelRatio(ratio);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.set(0, .26, Math.max(6.65, 8.9 / camera.aspect));
      camera.lookAt(0, -.025, 0);
      camera.updateProjectionMatrix();
      wake();
    },
    setVisible(next: boolean) {
      if (visible === next) return;
      visible = next;
      if (visible) wake();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
      }
    },
    select(index: number) {
      view = index;
      wake(1300);
    },
    point(x: number, y: number) {
      targetHoverX = x;
      targetHoverY = y;
      wake(550);
    },
    orbit(dx: number, dy: number) {
      targetYaw += dx * .013;
      targetPitch = Math.max(-.72, Math.min(.72, targetPitch + dy * .011));
      wake(720);
    },
    rotate() {
      spinFrom = spin % (Math.PI * 2);
      spinStart = elapsed;
      wake(spinLength + 60);
    },
    reset() {
      targetYaw = 0;
      targetPitch = 0;
      targetHoverX = 0;
      targetHoverY = 0;
      // Fold any unfinished spin into the orientation before easing home.
      yaw = ((yaw + spin + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
      spin = 0;
      spinStart = undefined;
      wake(1100);
    },
    dispose() {
      cancelAnimationFrame(frame);
      const resources = new Set<BufferGeometry | Material>();
      scene.traverse(object => {
        if (object instanceof InstancedMesh) object.dispose();
        if ("geometry" in object && object.geometry instanceof BufferGeometry) resources.add(object.geometry);
        if ("material" in object && object.material instanceof Material) resources.add(object.material);
      });
      resources.forEach(resource => resource.dispose());
      environment?.dispose();
      renderer.dispose();
      if (!context.isContextLost()) renderer.forceContextLoss();
    },
  };
}
