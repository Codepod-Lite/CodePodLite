import { memo } from "react";
import { Handle, NodeProps, Position } from "reactflow";

import { BoldExtension, CalloutExtension, ItalicExtension, MarkdownExtension } from 'remirror/extensions';
import { useRemirror } from '@remirror/react';

const CustomNode = ({
  data,
  isConnectable,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}: NodeProps) => {
  // const { manager, state } = useRemirror({
  //   extensions: () => [
  //     new BoldExtension(),
  //     new ItalicExtension(),
  //     new CalloutExtension({ defaultType: 'warn' }),
  //   ],
  
  //   // Set the initial content.
  //   content: 'Hello World',
  
  //   // Place the cursor at the start of the document. This can also be set to
  //   // `end`, `all` or a numbered position.
  //   selection: 'start',
  
  //   // Set the string handler which means the content provided will be
  //   // automatically handled as html.
  //   // `markdown` is also available when the `MarkdownExtension`
  //   // is added to the editor.
  //   stringHandler: 'markdown',
  // });
  
  return (
    <div>
      <Handle
        type="target"
        position={targetPosition}
        isConnectable={isConnectable}
      />
      {data?.label}
      <Handle
        type="source"
        position={sourcePosition}
        isConnectable={isConnectable}
      />
    </div>
  );
};

CustomNode.displayName = "CustomNode";

export default memo(CustomNode);