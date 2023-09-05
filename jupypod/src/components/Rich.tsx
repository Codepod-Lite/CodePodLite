import { memo } from "react";
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
import { ResizableBox } from "react-resizable";

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
    <ResizableBox width={200} height={150}>
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} editable={true}>
          <EditorComponent />
        </Remirror>
      </ThemeProvider>
    </ResizableBox>
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
  return (
    <>
      <Box>
        <MyEditor id={id} />
      </Box>
    </>
  );
});

export default memo(RichNode);
