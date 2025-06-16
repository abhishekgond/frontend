// components/Language.jsx
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { autocompletion } from "@codemirror/autocomplete";

export const availableLanguages = [
  "javascript",
  "html",
  "css",
  "python",
  "java",
  "c++",
];

export const modeMap = {
  javascript: "javascript",
  html: "htmlmixed",
  css: "css",
  python: "python",
  java: "text/x-java",
  "c++": "text/x-c++src",
};
