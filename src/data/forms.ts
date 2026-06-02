import type { VerbFormId } from "../domain/types";

export interface FormDefinition {
  id: VerbFormId;
  label: string;
  description: string;
}

export const FORM_DEFINITIONS: FormDefinition[] = [
  {
    id: "dictionary",
    label: "辭書形",
    description: "字典中的基本形式",
  },
  {
    id: "masu",
    label: "ます形",
    description: "禮貌地敘述動作",
  },
  {
    id: "nai",
    label: "ない形",
    description: "表示否定",
  },
  {
    id: "te",
    label: "て形",
    description: "連接句子、請求或進行式",
  },
  {
    id: "ta",
    label: "た形",
    description: "表示過去或完成",
  },
  {
    id: "ba",
    label: "ば形",
    description: "表示條件",
  },
  {
    id: "tara",
    label: "たら形",
    description: "表示條件或事情完成後",
  },
  {
    id: "volitional",
    label: "意向形",
    description: "表示提議或意志",
  },
  {
    id: "imperative",
    label: "命令形",
    description: "直接命令，語氣較強",
  },
  {
    id: "prohibitive",
    label: "禁止形",
    description: "表示禁止做某事",
  },
  {
    id: "potential",
    label: "可能形",
    description: "表示能夠做某事",
  },
  {
    id: "passive",
    label: "被動形",
    description: "表示被動或受影響",
  },
  {
    id: "causative",
    label: "使役形",
    description: "表示使某人做某事",
  },
  {
    id: "causativePassive",
    label: "使役被動形",
    description: "表示被迫做某事",
  },
];
