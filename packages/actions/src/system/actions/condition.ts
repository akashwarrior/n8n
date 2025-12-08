import type { ActionConfigField } from "../../types";

type ConditionResult = { success: boolean; value: boolean };

export type ConditionInput = {
  condition: string;
};

export async function condition({
  condition,
}: ConditionInput): Promise<ConditionResult> {
  if (!condition) {
    return { success: false, value: false };
  }

  try {
    const value = Boolean(eval(condition)); //
    return { success: true, value };
  } catch (error) {
    return { success: false, value: false };
  }
}

export const conditionConfig: ActionConfigField[] = [
  {
    name: "condition",
    label: "Condition Expression",
    type: "text",
    required: true,
    placeholder: "e.g., 5 > 3, status === 200, {{PreviousNode.value}} > 100",
    description:
      "Enter a JavaScript expression that evaluates to true or false. You can use @ to reference previous node outputs.",
  },
] as const;
