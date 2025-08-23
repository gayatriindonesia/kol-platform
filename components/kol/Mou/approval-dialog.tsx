"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'approve' | 'reject';
  title: string;
  description?: string;
  onConfirm: (reason?: string) => void;
  isLoading?: boolean;
}

export function ApprovalDialog({
  open,
  onOpenChange,
  type,
  title,
  description,
  onConfirm,
  isLoading = false,
}: ApprovalDialogProps) {
  const [reason, setReason] = React.useState("");

  const handleConfirm = () => {
    if (type === 'reject' && !reason.trim()) {
      return;
    }
    onConfirm(reason || undefined);
    setReason("");
  };

  const handleCancel = () => {
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {type === 'approve' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <span>{title}</span>
          </DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        {type === 'reject' && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for rejection..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={type === 'approve' ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={isLoading || (type === 'reject' && !reason.trim())}
          >
            {isLoading ? 'Processing...' : (type === 'approve' ? 'Approve' : 'Reject')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}