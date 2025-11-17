"use client";

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export function ReportReviewButton({ reviewId, token }: { reviewId: string; token: string }) {
  const [reason, setReason] = useState("spam");
  const [otherText, setOtherText] = useState("");
  const router = useRouter();

  const submitReport = async () => {
    const finalReason = reason === "other" ? otherText : reason;

    await fetch("/api/reviews/report", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        review_id: reviewId,
        reason: finalReason,
      }),
    });

    router.refresh();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-sm text-red-600 hover:text-red-700">
          Report
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Review</DialogTitle>
        </DialogHeader>

        <RadioGroup value={reason} onValueChange={setReason} className="space-y-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="spam" id="spam" />
            <Label htmlFor="spam">Spam or promotional content</Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="harassment" id="harassment" />
            <Label htmlFor="harassment">Harassment or bullying</Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="offensive" id="offensive" />
            <Label htmlFor="offensive">Offensive or abusive language</Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="inaccurate" id="inaccurate" />
            <Label htmlFor="inaccurate">Inaccurate information</Label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Other</Label>
            </div>
            {reason === "other" && (
              <Textarea
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                placeholder="Describe the issue…"
              />
            )}
          </div>
        </RadioGroup>

        <Button onClick={submitReport} className="w-full">
          Submit Report
        </Button>
      </DialogContent>
    </Dialog>
  );
}
