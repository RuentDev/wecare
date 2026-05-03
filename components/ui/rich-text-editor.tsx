"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none min-h-[250px] p-4 focus:outline-none border rounded-b-md bg-background",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  if (!editor) {
    return null;
  }

  const setLink = () => {
    if (linkUrl === null) {
      return;
    }

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    setLinkUrl("");
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
    }
  };

  return (
    <div className="flex flex-col w-full border rounded-md shadow-sm">
      <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/50 border-b rounded-t-md">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("h-8 w-8 p-0", editor.isActive("bold") && "bg-muted text-primary")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("h-8 w-8 p-0", editor.isActive("italic") && "bg-muted text-primary")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn("h-8 w-8 p-0", editor.isActive("strike") && "bg-muted text-primary")}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn("h-8 w-8 p-0", editor.isActive("code") && "bg-muted text-primary")}
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-[1px] h-4 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn("h-8 w-8 p-0", editor.isActive("heading", { level: 1 }) && "bg-muted text-primary")}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn("h-8 w-8 p-0", editor.isActive("heading", { level: 2 }) && "bg-muted text-primary")}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn("h-8 w-8 p-0", editor.isActive("heading", { level: 3 }) && "bg-muted text-primary")}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-[1px] h-4 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("h-8 w-8 p-0", editor.isActive("bulletList") && "bg-muted text-primary")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("h-8 w-8 p-0", editor.isActive("orderedList") && "bg-muted text-primary")}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn("h-8 w-8 p-0", editor.isActive("blockquote") && "bg-muted text-primary")}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-[1px] h-4 bg-border mx-1" />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn("h-8 w-8 p-0", editor.isActive("link") && "bg-muted text-primary")}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <div className="flex space-x-2">
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <Button type="button" onClick={setLink}>Save</Button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <div className="flex space-x-2">
              <Input
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Button type="button" onClick={addImage}>Add</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
