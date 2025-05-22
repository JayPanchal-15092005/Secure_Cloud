import React from "react";
import { Button } from "./button";
import { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
} from "./dialog";

interface ConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description: string;
  icon?: LucideIcon;
  iconColor?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "danger" | "warning" | "success" | "default";
  onConfirm: () => void;
  isDangerous?: boolean;
  warningMessage?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  icon: Icon,
  iconColor = "text-danger",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "danger",
  onConfirm,
  isDangerous = false,
  warningMessage,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{
        content: "border border-default-200 bg-default-50",
      }}
      backdropClassName="bg-black/70"
    >
        <DialogHeader className="border-b border-default-200 flex gap-2 items-center">
          {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
          {/* <span>{title}</span> */}
          <DialogTitle className="text-base font-medium">{title}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {isDangerous && warningMessage && (
            <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-4">
              <div className="flex items-start gap-3">
                {Icon && (
                  <Icon
                    className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColor}`}
                  />
                )}
                <div>
                  <p className="font-medium">This action cannot be undone</p>
                  <p className="text-sm mt-1">{warningMessage}</p>
                </div>
              </div>
            </div>
          )}
          <p>{description}</p>
        </DialogBody>
        <DialogFooter className="flex justify-end gap-3 mt-6 border-t pt-4 border-default-200 mb-4">
            <Button
            variant="outline"
            color="default"
            onClick={() => onOpenChange(false)}
            className="rounded-md"
            >
                {cancelText}
            </Button>
            <Button
            variant="destructive"
            color={confirmColor}
             onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            startContent={Icon && <Icon className="h-4 w-4" />}
            className="rounded-md"
            >
                {confirmText}
            </Button>
        </DialogFooter>
    </Dialog>
  );
};

export default ConfirmationModal;
