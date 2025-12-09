"use client";

import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import { useParams } from "next/navigation";
import { useAtom } from "jotai";
import { ArrowUp, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { WorkflowSchema, type AIWorkflow } from "@/lib/ai-schemas";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import {
  edgesAtom,
  isGeneratingAtom,
  nodesAtom,
  WorkflowNode,
  WorkflowEdge,
} from "@/store/workflow-store";

export function AIPrompt() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const [isGenerating, setIsGenerating] = useAtom(isGeneratingAtom);
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [edges, setEdges] = useAtom(edgesAtom);
  const { fitView } = useReactFlow();

  const { submit, isLoading } = useObject({
    api: "/api/ai/generate",
    schema: WorkflowSchema,
    onFinish: async ({ object, error }) => {
      if (error) {
        console.error("AI validation error:", error);
        toast.error("AI returned invalid data. Please try again.");
        setIsGenerating(false);
        return;
      }

      if (!object || !object.nodes || !object.edges) {
        toast.error("Failed to generate workflow");
        setIsGenerating(false);
        return;
      }

      // At this point, object is fully validated by the schema
      const workflow = object as AIWorkflow;
      console.log("[AI] Generated workflow:", workflow);

      // Apply the validated workflow
      const newNodes = workflow.nodes as unknown as WorkflowNode[];
      const newEdges = workflow.edges as unknown as WorkflowEdge[];

      setNodes(newNodes);
      setEdges(newEdges);

      // Fit view to show all nodes
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 300 });
      }, 100);

      // Save the workflow
      try {
        await api.workflow.update({
          id: workflowId,
          name: workflow.name,
          nodes: newNodes,
          edges: newEdges,
        });
        toast.success("Workflow generated!");
      } catch (saveError) {
        console.error("Failed to save:", saveError);
        toast.error("Failed to save workflow");
      }

      setPrompt("");
      inputRef.current?.blur();
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error("AI error:", error);
      toast.error("Failed to generate workflow. Please try again.");
      setIsGenerating(false);
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key?.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim() || isGenerating || isLoading) {
      return;
    }

    setIsGenerating(true);

    submit({
      prompt,
      existingWorkflow: { nodes, edges },
    });
  };

  const isProcessing = isGenerating || isLoading;

  return (
    <div
      className={cn(
        "absolute bottom-4 left-1/2 z-10 -translate-x-1/2 border rounded-xl overflow-hidden",
        "transition-all duration-300 max-w-full focus-within:w-xl hover:scale-105 focus-within:scale-100!",
        prompt.trim() ? "hover:scale-[1.02] w-xl" : "w-80",
      )}
    >
      <form
        aria-busy={isProcessing}
        className="relative flex items-center justify-center gap-2 rounded-lg bg-background pr-1.5 shadow-lg cursor-text overflow-hidden min-h-fit! group"
        onSubmit={handleGenerate}
      >
        <textarea
          className="flex-1 py-3 pl-3 text-sm outline-none placeholder:text-muted-foreground resize-none max-h-[200px] leading-[22px] placeholder:truncate field-sizing-content disabled:opacity-50"
          disabled={isProcessing}
          onBlur={(e) => (e.currentTarget.placeholder = "Ask AI...")}
          onChange={(e) => setPrompt(e.target.value)}
          onFocus={(e) =>
            (e.currentTarget.placeholder = "Describe your workflow...")
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleGenerate(e);
            } else if (e.key === "Escape") {
              e.preventDefault();
              setPrompt("");
              inputRef.current?.blur();
            }
          }}
          placeholder="Ask AI..."
          ref={inputRef}
          rows={1}
          value={prompt}
        />
        <div className="relative self-end h-fit overflow-hidden mb-1.5 flex items-center justify-center gap-1.5">
          <kbd
            className={cn(
              "inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground",
              "group-focus-within:opacity-0 group-focus-within:absolute transition-all duration-100 group-focus-within:-z-50",
              prompt.trim() ? "absolute -z-50" : "relative",
            )}
          >
            <span className="text-xs">⌘</span>K
          </kbd>
          <Button
            className="transition-all rounded-full rotate-0 group-focus-within:rotate-90"
            disabled={!prompt.trim() || isProcessing}
            size="icon-sm"
            type="submit"
          >
            {isProcessing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowUp className="size-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
