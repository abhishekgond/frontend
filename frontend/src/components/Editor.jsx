// export default Editor;
import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";

// Base CSS & Themes
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/theme/monokai.css";

// Language Modes
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/css/css";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/clike/clike"; // For Java, C++
import "codemirror/mode/python/python";

// Editing Addons
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/matchtags";
import "codemirror/addon/comment/comment";
import "codemirror/addon/selection/active-line";

// Hint / Autocomplete Addons
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/javascript-hint";
import "codemirror/addon/hint/css-hint";
import "codemirror/addon/hint/html-hint";
import "codemirror/addon/hint/xml-hint";
import "codemirror/addon/hint/anyword-hint";

// Search Addons
import "codemirror/addon/search/search";
import "codemirror/addon/search/searchcursor";

// Tooltip
import "codemirror/addon/selection/mark-selection";

const Editor = ({
  defaultCode = "",
  theme = "dracula",
  language = "javascript",
  socket,
  roomId,
}) => {
  const textAreaRef = useRef(null);
  const editorRef = useRef(null);
  const debounceRef = useRef(null);
  const isRemoteChange = useRef(false);

  const modeMap = {
    javascript: "javascript",
    html: "htmlmixed",
    css: "css",
    python: "python",
    cpp: "text/x-c++src",
    java: "text/x-java",
  };

  const customHint = (cm) => {
    const cursor = cm.getCursor();
    const token = cm.getTokenAt(cursor);
    const start = token.start;
    const end = cursor.ch;
    const currentWord = token.string;

    const customWords = {
      python: [
        "def",
        "return",
        "print",
        "for",
        "while",
        "if",
        "elif",
        "else",
        "import",
        "from",
        "class",
        "self",
        "try",
        "except",
        "finally",
        "with",
      ],
      cpp: [
        "#include",
        "int",
        "float",
        "double",
        "std",
        "cout",
        "cin",
        "return",
        "if",
        "else",
        "while",
        "for",
        "class",
        "public",
        "private",
        "void",
      ],
      java: [
        "public",
        "private",
        "class",
        "static",
        "void",
        "main",
        "String",
        "int",
        "float",
        "System.out.println",
        "return",
        "new",
        "if",
        "else",
        "while",
      ],
    };

    const langHints = customWords[language] || [];
    const list = langHints.filter((word) => word.startsWith(currentWord));

    return {
      list,
      from: CodeMirror.Pos(cursor.line, start),
      to: CodeMirror.Pos(cursor.line, end),
    };
  };

  useEffect(() => {
    if (socket && roomId) {
      socket.emit("join-room", { roomId });
      return () => socket.off("join-room");
    }
  }, [socket, roomId]);

  useEffect(() => {
    if (!textAreaRef.current) return;

    const editor = CodeMirror.fromTextArea(textAreaRef.current, {
      mode: modeMap[language] || "javascript",
      theme,
      lineNumbers: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      autoCloseTags: true,
      matchTags: { bothTags: true },
      tabSize: 2,
      indentWithTabs: false,
      styleActiveLine: true,
      lineWrapping: true,
      extraKeys: {
        "Ctrl-F": (cm) => cm.execCommand("find"),
        "Ctrl-/": (cm) => cm.execCommand("toggleComment"),
        "Ctrl-Space": "autocomplete",
      },
    });

    const persisted = localStorage.getItem(`code-${roomId}`);
    if (persisted) editor.setValue(persisted);
    else editor.setValue(defaultCode);

    editor.getWrapperElement().style.height = "100%";
    editorRef.current = editor;

    editor.on("inputRead", (cm, change) => {
      if (!cm.state.completionActive && change.text[0].match(/\w/)) {
        CodeMirror.commands.autocomplete(cm, customHint, {
          completeSingle: false,
        });
      }
    });

    editor.on("change", (cm) => {
      if (isRemoteChange.current) return;
      const newCode = cm.getValue();
      localStorage.setItem(`code-${roomId}`, newCode);
      if (socket && roomId) {
        socket.emit("code-change", { roomId, code: newCode });
      }
    });

    if (socket) {
      socket.on("code-change", ({ code }) => {
        if (code !== editor.getValue()) {
          isRemoteChange.current = true;
          const prevScroll = editor.getScrollInfo().top;
          editor.setValue(code);
          editor.scrollTo(null, prevScroll);
          isRemoteChange.current = false;
        }
      });

      socket.on("code-sync", ({ code }) => {
        if (code !== editor.getValue()) {
          isRemoteChange.current = true;
          editor.setValue(code);
          isRemoteChange.current = false;
        }
      });
    }

    return () => {
      editor.toTextArea();
      socket?.off("code-change");
      socket?.off("code-sync");
    };
  }, [theme, language, defaultCode, socket, roomId]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <textarea ref={textAreaRef} defaultValue={defaultCode} />
    </div>
  );
};

export default Editor;
