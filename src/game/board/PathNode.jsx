import ClassNames from "classnames";

export default function PathNode({ node, fadeout = true }) {
  if (node?.length > 0) {
    let nodeClass = "";

    node.forEach((dir, index) => {
      if (index === 0) nodeClass = "game-path-";
      nodeClass = nodeClass.concat(dir);
    });

    return (
      <span
        className={ClassNames(
          "game-path",
          nodeClass,
          fadeout ? "game-path-anim-fadeout" : null
        )}
      />
    );
  }

  return null;
}
