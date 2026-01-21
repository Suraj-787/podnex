"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Copy, Check, FileText } from "lucide-react";
import { toast } from "sonner";

interface TranscriptViewerProps {
  transcript: string | any;
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = typeof transcript === "string" ? transcript : JSON.stringify(transcript, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Transcript copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const renderTranscript = () => {
    if (typeof transcript === "string") {
      return (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {transcript}
        </p>
      );
    }

    // If transcript is an array of segments with speaker labels
    if (Array.isArray(transcript)) {
      return (
        <div className="space-y-4">
          {transcript.map((segment: any, index: number) => (
            <div key={index} className="space-y-1">
              {segment.speaker && (
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  {segment.speaker}
                </p>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed pl-4 border-l-2 border-border">
                {segment.text || segment.content}
              </p>
            </div>
          ))}
        </div>
      );
    }

    // Fallback for other formats
    return (
      <pre className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
        {JSON.stringify(transcript, null, 2)}
      </pre>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Transcript
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto pr-2">
          {renderTranscript()}
        </div>
      </CardContent>
    </Card>
  );
}
