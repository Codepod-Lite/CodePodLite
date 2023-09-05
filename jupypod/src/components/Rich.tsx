import { memo, useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";

import {
  BoldExtension,
  CalloutExtension,
  ItalicExtension,
  MarkdownExtension,
  PlaceholderExtension,
} from "remirror/extensions";
import { Remirror, useRemirror, ThemeProvider, EditorComponent } from "@remirror/react";
import "remirror/styles/all.css";

import Box from "@mui/material/Box";
import { styled } from "@mui/material";

const MyStyledWrapper = styled("div")(
  () => `
  .remirror-editor-wrapper {
    padding: 0;
  }

  /* leave some space for the block handle */
  .remirror-editor-wrapper .ProseMirror {
    padding-left: 24px;
  }
`
);

const MyEditor = ({ placeholder = "Start typing...", id }: { placeholder?: string; id: string }) => {
  const { manager, state } = useRemirror({
    extensions: () => [
      new PlaceholderExtension({ placeholder }),
      new BoldExtension(),
      new ItalicExtension(),
      new CalloutExtension({ defaultType: "warn" }),
      new MarkdownExtension(),
    ],

    // Set the initial content.
    content: "",

    // Place the cursor at the start of the document. This can also be set to
    // `end`, `all` or a numbered position.
    selection: "start",

    // Set the string handler which means the content provided will be
    // automatically handled as html.
    // `markdown` is also available when the `MarkdownExtension`
    // is added to the editor.
    stringHandler: "markdown",
  });
  return (
    <Box
      className="remirror-theme"
      sx={{
        cursor: "auto",
        // Display different markers for different levels in nested ordered lists.
        ol: {
          listStylType: "decimal",
        },
        "ol li ol": {
          listStyleType: "lower-alpha",
        },
        "ol li ol li ol": {
          listStyleType: "lower-roman",
        },
      }}
      overflow="auto"
    >
      <ThemeProvider>
        <MyStyledWrapper>
          <Remirror manager={manager} initialContent={state} editable={true}>
            <EditorComponent />
          </Remirror>
        </MyStyledWrapper>
      </ThemeProvider>
    </Box>
  );
};

/**
 * The React Flow node.
 */

interface Props {
  data: any;
  id: string;
  isConnectable: boolean;
  selected: boolean;
  // note that xPos and yPos are the absolute position of the node
  xPos: number;
  yPos: number;
}

export const RichNode = memo<Props>(function ({ data, id, isConnectable, selected, xPos, yPos }) {
  const [borderColor, setBorderColor] = useState("#d6dee6");
  return (
    <Box
      onFocus = {() => {setBorderColor("#003c8f")}}
      onBlur = {() => setBorderColor("#d6dee6")}
      sx={{
        border: "solid 1px #d6dee6",
        borderWidth: "2px",
        borderRadius: "4px",
        width: "200px",
        height: "120px",
        backgroundColor: "white",
        borderColor: {borderColor},
      }}
    >
      <MyEditor id={id} />
    </Box>
  );
});

export default memo(RichNode);
