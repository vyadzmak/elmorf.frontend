import { describe, expect, it } from "vitest";
import { generateHttpQuery, generatePythonQuery } from "./query-code";

const input = {
  projectId: "prj_vendor_contracts",
  modelVersion: "v7",
  text: "Which invoices are still open?",
  language: "natural" as const,
};

describe("query code", () => {
  it("renders a stable Python call", () => {
    expect(generatePythonQuery(input)).toBe(
      [
        "import elmorf",
        "",
        "result = elmorf.get(",
        "    project='prj_vendor_contracts',",
        "    model='v7',",
        "    query='Which invoices are still open?',",
        ")",
      ].join("\n"),
    );
  });

  it("renders the HTTP request the app actually sends", () => {
    expect(generateHttpQuery(input)).toBe(
      [
        "POST /projects/prj_vendor_contracts/queries HTTP/1.1",
        "Content-Type: application/json",
        "",
        "{",
        '  "text": "Which invoices are still open?",',
        '  "language": "natural"',
        "}",
      ].join("\n"),
    );
  });

  it("escapes quotes in the Python string", () => {
    const python = generatePythonQuery({ ...input, text: "Ada's invoice" });
    expect(python).toContain("query='Ada\\'s invoice'");
  });
});