import { resend } from "./resend";
import { system } from "./system";
import { triggers } from "./triggers";
import type { Provider } from "./types";

export const PROVIDERS: Provider[] = [triggers, resend, system];
