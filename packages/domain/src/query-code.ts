import type { QueryLanguage } from "./query";

export interface QueryCodeInput {
  projectId: string;
  modelVersion: string;
  text: string;
  language: QueryLanguage;
}

export function generatePythonQuery(input: QueryCodeInput): string {
  return [
    "import elmorf",
    "",
    "result = elmorf.get(",
    `    project=${pythonString(input.projectId)},`,
    `    model=${pythonString(input.modelVersion)},`,
    `    query=${pythonString(input.text)},`,
    ")",
  ].join("\n");
}

export function generateHttpQuery(input: QueryCodeInput): string {
  const body = JSON.stringify(
    { text: input.text, language: input.language },
    null,
    2,
  );
  return [
    `POST /projects/${encodeURIComponent(input.projectId)}/queries HTTP/1.1`,
    "Content-Type: application/json",
    "",
    body,
  ].join("\n");
}

function pythonString(value: string): string {
  return `'${value.replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`;
}
