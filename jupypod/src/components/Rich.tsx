import { memo, useCallback, useRef, useEffect, useState, ReactNode } from "react";
import { Handle, NodeProps, Position, useReactFlow, Node } from "reactflow";
import { useBoundStore } from "../lib/store/index.tsx";
import { ConfirmDeleteButton } from "./utils.tsx";

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
import {
  Remirror,
  useRemirror,
  ThemeProvider,
  EditorComponent,
  ReactComponentExtension,
  useCommands,
  ToggleBoldButton,
  ToggleItalicButton,
  ToggleUnderlineButton,
  ToggleCodeButton,
  ToggleStrikeButton,
  FloatingToolbar,
  CommandButton,
  CommandButtonProps,
  OnChangeJSON
} from "@remirror/react";
import "remirror/styles/all.css";
import { RemirrorJSON } from 'remirror';

import Box from "@mui/material/Box";
import { styled } from "@mui/material";
import InputBase from "@mui/material/InputBase";
import Tooltip from "@mui/material/Tooltip";
import FormatColorResetIcon from "@mui/icons-material/FormatColorReset";
import { ResizableBox } from "react-resizable";
import { JSX } from "react/jsx-runtime";

import {
  MathInlineExtension,
  MathBlockExtension,
} from "../extensions/mathExtension";

import "./components.css";

const EditorToolbar = () => {
  return (
    <>
      <FloatingToolbar
        // By default, MUI's Popper creates a Portal, which is a ROOT html
        // elements that prevents paning on reactflow canvas. Therefore, we
        // disable the portal behavior.
        disablePortal
        sx={{
          button: {
            padding: 0,
            border: "none",
            borderRadius: "5px",
            marginLeft: "5px",
          },
          border: "2px solid grey",
          borderRadius: "2px",
          alignItems: "center",
          backgroundColor: "black",
        }}
      >
        <ToggleBoldButton />
        <ToggleItalicButton />
        <ToggleUnderlineButton />
        <ToggleStrikeButton />
        <ToggleCodeButton />
        <SetHighlightButton color="lightpink" />
        <SetHighlightButton color="yellow" />
        <SetHighlightButton color="lightgreen" />
        <SetHighlightButton color="lightcyan" />
        <SetHighlightButton />

        {/* <TextAlignmentButtonGroup /> */}
        {/* <IndentationButtonGroup /> */}
        {/* <BaselineButtonGroup /> */}
      </FloatingToolbar>
    </>
  );
};

export interface SetHighlightButtonProps
  extends Omit<CommandButtonProps, "commandName" | "active" | "enabled" | "attrs" | "onSelect" | "icon"> {}

export const SetHighlightButton: React.FC<SetHighlightButtonProps | { color: string }> = ({
  color = null,
  ...props
}) => {
  const { setTextHighlight, removeTextHighlight } = useCommands();

  const handleSelect = useCallback(() => {
    if (color === null) {
      removeTextHighlight();
    } else {
      setTextHighlight(color);
    }
    // TODO toggle the bar
  }, [color, removeTextHighlight, setTextHighlight]);

  const enabled = true;

  return (
    <CommandButton
      {...props}
      commandName="setHighlight"
      label={color ? "Highlight" : "Clear Highlight"}
      enabled={enabled}
      onSelect={handleSelect}
      icon={
        color ? (
          <Box
            sx={{
              backgroundColor: color,
              paddingX: "4px",
              borderRadius: "4px",
              lineHeight: 1.2,
            }}
          >
            A
          </Box>
        ) : (
          <FormatColorResetIcon />
        )
      }
    />
  );
};

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

function HotKeyControl({ id }) {
  const focusedEditor = useBoundStore((state) => state.focusedEditor);

  const commands = useCommands();
  useEffect(() => {
    if (focusedEditor === id) {
      commands.focus();
    } else {
      commands.blur();
    }
  }, [focusedEditor]);
  return <></>;
}

const MyEditor = ({ placeholder = "Start typing...", id, data }: { placeholder?: string; id: string, data: any }) => {
  const focusedEditor = useBoundStore((state) => state.focusedEditor);
  const setFocusedEditor = useBoundStore((state) => state.setFocusedEditor);
  const nodes = useBoundStore((state) => state.nodes);
  const saveCanvas = useBoundStore((state) => state.saveCanvas);
  // when editor changes, find the node with matching id and update its content to match
  const handleEditorChange = useCallback((json: RemirrorJSON) => {
    const matchedNode = nodes.find((node: Node) => node.id === id);
    matchedNode.data.state = json;
    saveCanvas();
  }, []);

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
      // Math Parse
      new MathInlineExtension(),
      new MathBlockExtension(),
    ],
    // Set the initial content.
    content: Object.keys(data.state).length !== 0 ? data.state: "",

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
      onFocus={() => {
        setFocusedEditor(id);
        // if (resetSelection()) updateView();
      }}
      onBlur={() => {
        setFocusedEditor(undefined);
      }}
      sx={{
        userSelect: "text",
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
          <Box
            sx={{
              // set height and width to cover the whole editor.
              position: "absolute",
              top: 0,
              left: 0,
              width: "101%",
              height: "132%",
              zIndex: focusedEditor === id ? -1 : 10,
            }}
          >
            {/* Overlay */}
          </Box>
          <Remirror
            editable={true}
            manager={manager}
            // Must set initialContent, otherwise the Reactflow will fire two
            // dimension change events at the beginning. This should be caused
            // by initialContent being empty, then the actual content. Setting
            // it to the actual content at the beginning will prevent this.
            initialContent={state}
            // Should not set state and onChange (the controlled Remirror editor
            // [1]), otherwise Chinsee (or CJK) input methods will not be
            // supported [2].
            // - [1] https://remirror.io/docs/controlled-editor
            // - [2] demo that Chinese input method is not working:
            //   https://remirror.vercel.app/?path=/story/editors-controlled--editable
          >
            <HotKeyControl id={id} />
            <EditorComponent />
            <OnChangeJSON onChange={handleEditorChange} />
            <EditorToolbar />
          </Remirror>
        </MyStyledWrapper>
      </ThemeProvider>
    </Box>
  );
};

function MyFloatingToolbar({ id }: { id: string }) {
  const reactFlowInstance = useReactFlow();
  const saveCanvas = useBoundStore((state) => state.saveCanvas);

  return (
    <>
      <Tooltip title="Delete">
        <ConfirmDeleteButton
          size="small"
          handleConfirm={() => {
            reactFlowInstance.deleteElements({ nodes: [{ id }] });
            saveCanvas();
          }}
        />
      </Tooltip>
    </>
  );
}

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

export const RichNode = memo<Props>(function ({
  data,
  id,
  isConnectable,
  selected,
  xPos,
  yPos,
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusedEditor = useBoundStore((state) => state.focusedEditor);
  const setFocusedEditor = useBoundStore((state) => state.setFocusedEditor);
  const Wrap = (
    child:
      | string
      | number
      | boolean
      | JSX.Element
      | Iterable<ReactNode>
      | null
      | undefined
  ) => (
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
        minConstraints={[100, 200]}
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
        onClick={() => {
          setFocusedEditor(id);
        }}
        className={focusedEditor === id ? "nodrag" : "custom-drag-handle"}
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
              borderColor: focusedEditor !== id ? "#d6dee6" : "#5e92f3",
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
                  // zindex should be greater than pods
                  // opacity: showToolbar ? 1 : 0,
                  display: "flex",
                  marginLeft: "10px",
                  borderRadius: "4px",
                  position: "absolute",
                  border: "solid 1px #d6dee6",
                  right: "-2px",
                  top: "2px",
                  background: "white",
                  zIndex: 12,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MyFloatingToolbar id={id} />
              </Box>
            </Box>
            <Box>
              <MyEditor id={id} data={data}/>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
});

export default memo(RichNode);
