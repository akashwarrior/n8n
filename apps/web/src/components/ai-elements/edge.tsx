import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import { Trash2Icon } from "lucide-react";
import { Button } from "../ui/button";
import { edgesAtom } from "@/store/workflow-store";
import { useSetAtom } from "jotai";

export const Edge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const setEdges = useSetAtom(edgesAtom);
  const deleteEdge = () =>
    setEdges((edges) => edges.filter((edge) => edge.id !== id));

  return (
    <>
      <BaseEdge id={id} path={edgePath} />

      <EdgeLabelRenderer>
        {selected && (
          <div
            className="absolute pointer-events-auto origin-center"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
          >
            <Button
              size="icon-sm"
              variant="secondary"
              onClick={deleteEdge}
              className="bg-background"
            >
              <Trash2Icon />
            </Button>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};
