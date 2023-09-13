import { memo, useState, useRef } from "react";
import { Handle, NodeProps, Position } from "reactflow";

import {
  BoldExtension,
  ItalicExtension,
  MarkdownExtension,
  PlaceholderExtension,
  TableExtension,
  TextHighlightExtension,
  SupExtension,
  SubExtension,
  BidiExtension,
  DropCursorExtension,
  GapCursorExtension,
  ShortcutsExtension,
  TrailingNodeExtension,
  HardBreakExtension,
  ImageExtension,
  HorizontalRuleExtension,
  BlockquoteExtension,
  CodeBlockExtension,
  HeadingExtension,
  IframeExtension,
  BulletListExtension,
  OrderedListExtension,
  TaskListExtension,
  CodeExtension,
  StrikeExtension,
  UnderlineExtension,
} from "remirror/extensions";
import { Remirror, useRemirror, ThemeProvider, EditorComponent, ReactComponentExtension } from "@remirror/react";
import "remirror/styles/all.css";

import Box from "@mui/material/Box";
import { styled } from "@mui/material";
import InputBase from "@mui/material/InputBase";
import { ResizableBox } from "react-resizable";

import "./components.css";

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
      new ReactComponentExtension(),
      new TableExtension(),
      new TextHighlightExtension(),
      new SupExtension(),
      new SubExtension(),
      new MarkdownExtension(),
      // Plain
      new BidiExtension(),
      new DropCursorExtension(),
      new GapCursorExtension(),
      new ShortcutsExtension(),
      new TrailingNodeExtension(),
      // Nodes
      new HardBreakExtension(),
      new ImageExtension({ enableResizing: true }),
      new HorizontalRuleExtension(),
      new BlockquoteExtension(),
      new CodeBlockExtension(),
      new HeadingExtension(),
      new IframeExtension(),
      new BulletListExtension(),
      new OrderedListExtension(),
      new TaskListExtension(),
      // Marks
      new BoldExtension(),
      new CodeExtension(),
      new StrikeExtension(),
      new ItalicExtension(),
      // new LinkExtension({
      //   autoLink: true,
      //   autoLinkAllowedTLDs: ["dev", ...TOP_50_TLDS],
      // }),
      new UnderlineExtension(),
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
      className="remirror-theme nopan"
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
  const inputRef = useRef<HTMLInputElement>(null);
  const Wrap = (child) => (
    <Box
      sx={{
        "& .react-resizable-handle": {
          opacity: 1,
        },
      }}
    >
      <ResizableBox
        // onResizeStop={onResizeStop}
        height={100}
        width={250}
        axis={"x"}
        minConstraints={[200, 200]}
      >
        <Box
          sx={{
            "& .react-resizable-handle": {
              opacity: 1,
            },
          }}
        >
          {child}
        </Box>
      </ResizableBox>
    </Box>
  );
  return (
    <>
      <Box
        // onMouseEnter={() => {
        //   setShowToolbar(true);
        // }}
        // onMouseLeave={() => {
        //   setShowToolbar(false);
        //   // hide drag handle
        //   const elems = document.getElementsByClassName("global-drag-handle");
        //   Array.from(elems).forEach((elem) => {
        //     (elem as HTMLElement).style.display = "none";
        //   });
        // }}
        sx={{
          cursor: "auto",
          fontSize: 16,
        }}
      >
        {" "}
        {Wrap(
          <Box
            sx={{
              border: "solid 1px #d6dee6",
              borderWidth: "2px",
              borderRadius: "4px",
              width: "100%",
              height: "100%",
              backgroundColor: "white",
              borderColor: selected ? "#5e92f3" : "#d6dee6",
            }}
          >
            <Box
            // sx={{
            //   opacity: showToolbar ? 1 : 0,
            // }}
            >
              {/* <Handles pod={pod} xPos={xPos} yPos={yPos} /> */}
            </Box>

            <Box>
              {/* {devMode && (
              <Box
                sx={{
                  position: "absolute",
                  top: "-48px",
                  bottom: "0px",
                  userSelect: "text",
                  cursor: "auto",
                }}
                className="nodrag"
              >
                {id} at ({Math.round(xPos)}, {Math.round(yPos)}, w:{" "}
                {pod.width}, h: {pod.height})
              </Box>
            )} */}
              <Box
                sx={{
                  position: "absolute",
                  top: "-24px",
                  width: "50%",
                }}
              >
                <InputBase
                  inputRef={inputRef}
                  className="nodrag"
                  defaultValue={data.name || ""}
                  // disabled={isGuest}
                  // onBlur={(e) => {
                  //   const name = e.target.value;
                  //   if (name === data.name) return;
                  //   const node = nodesMap.get(id);
                  //   if (node) {
                  //     nodesMap.set(id, {
                  //       ...node,
                  //       data: { ...node.data, name },
                  //     });
                  //   }
                  // }}
                  inputProps={{
                    style: {
                      padding: "0px",
                      textOverflow: "ellipsis",
                    },
                  }}
                ></InputBase>
              </Box>
              <Box
                sx={{
                  // opacity: showToolbar ? 1 : 0,
                  display: "flex",
                  marginLeft: "10px",
                  borderRadius: "4px",
                  position: "absolute",
                  border: "solid 1px #d6dee6",
                  right: "25px",
                  top: "-15px",
                  background: "white",
                  zIndex: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* <MyFloatingToolbar id={id} /> */}
              </Box>
            </Box>
            <Box>
              <MyEditor id={id} />
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
});

export default memo(RichNode);
