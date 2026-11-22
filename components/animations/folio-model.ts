import {
  BoxGeometry, BufferGeometry, Color, EdgesGeometry, ExtrudeGeometry, Float32BufferAttribute, Group,
  InstancedMesh, LineBasicMaterial, LineSegments, Matrix4, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, Path, Shape,
} from "three";
import type { FolioVariant } from "./folio-content";

export function roundRect(width: number, height: number, radius: number) {
  const x = width / 2, y = height / 2;
  const shape = new Shape();
  shape.moveTo(-x + radius, -y);
  shape.lineTo(x - radius, -y);
  shape.quadraticCurveTo(x, -y, x, -y + radius);
  shape.lineTo(x, y - radius);
  shape.quadraticCurveTo(x, y, x - radius, y);
  shape.lineTo(-x + radius, y);
  shape.quadraticCurveTo(-x, y, -x, y - radius);
  shape.lineTo(-x, -y + radius);
  shape.quadraticCurveTo(-x, -y, -x + radius, -y);
  return shape;
}

const bevel = (depth: number, compact: boolean) => ({
  depth, bevelEnabled: true, bevelSize: .042, bevelThickness: .038, bevelSegments: compact ? 1 : 3,
  curveSegments: compact ? 5 : 12,
});

type Point = readonly [number, number, number];
function paths(strokes: Point[][], material: LineBasicMaterial) {
  const segments = strokes.flatMap(stroke => stroke.slice(1).flatMap((point, index) => [...stroke[index], ...point]));
  return new LineSegments(new BufferGeometry().setAttribute("position", new Float32BufferAttribute(segments, 3)), material);
}

function folioMark(compact: boolean) {
  // The raised stroke follows the shape of the SaaSFolio monogram.
  const path = new Shape();
  path.moveTo(.51, .47);
  path.lineTo(-.20, .47);
  path.quadraticCurveTo(-.52, .47, -.52, .17);
  path.quadraticCurveTo(-.52, -.12, -.2, -.12);
  path.lineTo(.19, -.12);
  path.quadraticCurveTo(.47, -.12, .47, -.35);
  path.quadraticCurveTo(.47, -.56, .19, -.56);
  path.lineTo(-.52, -.56);
  path.lineTo(-.52, -.40);
  path.lineTo(.19, -.40);
  path.quadraticCurveTo(.30, -.40, .30, -.35);
  path.quadraticCurveTo(.30, -.28, .19, -.28);
  path.lineTo(-.20, -.28);
  path.quadraticCurveTo(-.70, -.28, -.70, .17);
  path.quadraticCurveTo(-.70, .64, -.20, .64);
  path.lineTo(.51, .64);
  path.closePath();
  return new ExtrudeGeometry(path, { ...bevel(.044, compact), bevelSize: .023, bevelThickness: .024 });
}

export function buildFolioModel(variant: FolioVariant, compact: boolean) {
  const rack = variant === "hosting";
  const compare = variant === "compare";
  const width = rack ? 2.68 : compare ? 1.6 : 1.96;
  const height = rack ? 1.62 : compare ? 2.00 : 2.36;
  const depth = rack ? .18 : .135;
  const outline = roundRect(width, height, rack ? .17 : .23);
  const body = new ExtrudeGeometry(outline, bevel(depth, compact));
  body.translate(0, 0, -depth / 2);
  const edges = new EdgesGeometry(body, 46);

  const face = roundRect(width - .14, height - .14, .17);
  const frame = new Shape(face.getPoints(12));
  const opening = roundRect(width - .19, height - .19, .14).getPoints(12).reverse();
  frame.holes.push(new Path(opening));
  const inset = new ExtrudeGeometry(frame, { depth: .009, bevelEnabled: false, curveSegments: 4 });
  inset.translate(0, 0, depth / 2 + .047);
  const root = new Group();
  const count = rack ? 4 : compare ? 4 : 5;
  const indicator = new MeshBasicMaterial({ color: "#d0ffe9" });
  const graphic = new LineBasicMaterial({ color: "#dceaff", opacity: .56, transparent: true });
  const quiet = new LineBasicMaterial({ color: "#93a9be", opacity: .38, transparent: true });
  const edge = new LineBasicMaterial({ color: "#a7bdd0", opacity: .42, transparent: true });
  const accent = new MeshPhysicalMaterial({ color: "#a8ff49", metalness: .15, roughness: .32, clearcoat: .9, emissiveIntensity: .26 });
  const port = rack ? new BoxGeometry(.19, .039, .045) : null;
  const portMaterial = rack ? new MeshPhysicalMaterial({ color: "#07111b", metalness: .26, roughness: .55 }) : null;
  const mark = variant === "directory" ? folioMark(compact) : undefined;
  const tick = new BoxGeometry(.066, .04, .019);

  const layers = Array.from({ length: count }, (_, index) => {
    const group = new Group();
    const surface = new MeshPhysicalMaterial({
      color: "#263c39", metalness: .42, roughness: .29, clearcoat: 1, clearcoatRoughness: .2,
    });
    group.add(new Mesh(body, surface), new LineSegments(edges, edge), new Mesh(inset, accent));
    const z = depth / 2 + .055;

    const tickMesh = new Mesh(tick, indicator);
    tickMesh.position.set(width / 2 - .27, height / 2 - .27, z);
    group.add(tickMesh);

    if (rack && port && portMaterial) {
      const ports = new InstancedMesh(port, portMaterial, 5);
      const placement = new Matrix4();
      for (let socket = 0; socket < 5; socket++) {
        ports.setMatrixAt(socket, placement.makeTranslation(-.98 + socket * .28, -height / 2 - .034, 0));
      }
      const led = new Mesh(tick, accent);
      led.position.set(.91, -height / 2 - .042, 0);
      led.rotation.x = Math.PI / 2;
      group.add(ports, led, paths([
        [[-.99, -.52, z], [-.99, .52, z], [-.53, .52, z]],
        [[.96, .52, z], [.96, -.52, z], [.53, -.52, z]],
        [[-.60, -.19, z], [.60, -.19, z]], [[-.60, .04, z], [.36, .04, z]], [[-.60, .27, z], [.11, .27, z]],
      ], quiet));
    } else if (mark && index === count - 1) {
      const badge = new Mesh(mark, accent);
      badge.position.set(.055, .12, z + .015);
      badge.scale.setScalar(.82);
      group.add(badge, paths([
        [[-.70, .57, z], [-.70, .92, z], [-.32, .92, z]], [[.70, .57, z], [.70, .92, z], [.32, .92, z]],
        [[-.70, -.53, z], [-.70, -.91, z], [-.32, -.91, z]], [[.70, -.53, z], [.70, -.91, z], [.32, -.91, z]],
        [[-.28, -.77, z], [.28, -.77, z]],
      ], quiet));
    } else {
      const dots: Point[][] = Array.from({ length: 3 }, (_, i) => [[-.54, .61 - i * .16, z], [i === 1 ? .12 : .43, .61 - i * .16, z]]);
      group.add(paths(dots, graphic), paths([
        [[-.53, -.62, z], [-.53, -.10, z]], [[-.53, -.62, z], [.50, -.62, z]],
        [[-.43, -.53, z], [-.20, -.39, z], [-.06, -.44, z], [.19, -.23 + (index % 2) * .1, z], [.42, -.15, z]],
      ], quiet));
    }
    root.add(group);
    return { group, surface };
  });

  const neutral = new Color(rack ? "#203246" : "#223034");
  const secondary = new Color(compare ? "#c6ff3d" : rack ? "#779fee" : "#7296a0");
  function tint(color: Color) {
    accent.color.copy(color);
    accent.emissive.copy(color);
    layers.forEach(({ surface }, index) => {
      const spotlight = rack ? index === count - 1 : compare ? index % 2 === 1 : index === count - 1;
      surface.color.copy(neutral).lerp(compare && index >= 2 ? secondary : color, spotlight ? .30 : .065 + index * .018);
    });
  }

  return { root, layers, tint };
}
