import { ViewPlugin, Decoration, EditorView } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';

const PERSIAN_CHAR_REGEX = /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

const persianIsolateMark = Decoration.mark({
  tagName: 'span',
  class: 'cm-persian-isolate'
});

export const persianBidiPlugin = ViewPlugin.fromClass(
  class {
    decorations;

    constructor(view) {
      this.decorations = this.computeDecorations(view);
    }

    update(update) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.computeDecorations(update.view);
      }
    }

    computeDecorations(view) {
      const builder = new RangeSetBuilder();
      for (const { from, to } of view.visibleRanges) {
        const docText = view.state.doc.sliceString(from, to);
        const lines = docText.split('\n');
        let lineStart = 0;

        for (const line of lines) {
          if (PERSIAN_CHAR_REGEX.test(line)) {
            // Check if line contains a comment
            const commentMatch = /^(\s*#\s*)(.*)$/.exec(line);
            if (commentMatch && PERSIAN_CHAR_REGEX.test(commentMatch[2])) {
              const commentPrefixLen = commentMatch[1].length;
              const startPos = from + lineStart + commentPrefixLen;
              const endPos = from + lineStart + line.length;
              if (startPos >= from && endPos <= to && startPos < endPos) {
                builder.add(startPos, endPos, persianIsolateMark);
              }
            } else {
              // String literals: match "...", '...', f"...", f'...'
              const strRegex = /(".*?"|'.*?'|f".*?"|f'.*?')/g;
              let match;
              while ((match = strRegex.exec(line)) !== null) {
                const matchedText = match[0];
                if (PERSIAN_CHAR_REGEX.test(matchedText)) {
                  const quoteStart = matchedText.startsWith('f') ? 2 : 1;
                  const quoteEnd = matchedText.length - 1;
                  if (quoteEnd > quoteStart) {
                    const startPos = from + lineStart + match.index + quoteStart;
                    const endPos = from + lineStart + match.index + quoteEnd;
                    if (startPos >= from && endPos <= to && startPos < endPos) {
                      builder.add(startPos, endPos, persianIsolateMark);
                    }
                  }
                }
              }
            }
          }
          lineStart += line.length + 1;
        }
      }
      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations
  }
);

export const editorThemeExtension = EditorView.theme({
  "&": {
    direction: "ltr !important",
    textAlign: "left !important",
    fontFamily: "'Cascadia Code', Consolas, 'Courier New', 'Vazirmatn', monospace !important",
    letterSpacing: "normal !important",
  },
  ".cm-scroller": {
    direction: "ltr !important",
    textAlign: "left !important",
    overflowX: "auto !important",
  },
  ".cm-content": {
    direction: "ltr !important",
    textAlign: "left !important",
    unicodeBidi: "isolate !important",
    fontFamily: "'Cascadia Code', Consolas, 'Courier New', 'Vazirmatn', monospace !important",
    letterSpacing: "normal !important",
  },
  ".cm-line": {
    direction: "ltr !important",
    textAlign: "left !important",
    unicodeBidi: "isolate !important",
    fontFamily: "'Cascadia Code', Consolas, 'Courier New', 'Vazirmatn', monospace !important",
    lineHeight: "1.8 !important",
    letterSpacing: "normal !important",
  },
  ".cm-persian-isolate": {
    fontFamily: "'Vazirmatn', sans-serif !important",
    direction: "rtl !important",
    unicodeBidi: "isolate !important",
    letterSpacing: "normal !important",
    fontVariantLigatures: "normal !important",
    display: "inline-block !important",
    verticalAlign: "bottom !important",
  },
  ".cm-gutters": {
    direction: "ltr !important",
    textAlign: "right !important",
    unicodeBidi: "isolate !important",
    backgroundColor: "#0b0f19 !important",
    color: "#64748b !important",
    borderRight: "1px solid #1e293b !important",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#1e293b !important",
    color: "#cbd5e1 !important",
  }
});
