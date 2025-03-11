"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Modal() {
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (open) {
      setCountdown(10); // รีเซ็ตตัวนับถอยหลังทุกครั้งที่เปิด Modal

      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            setOpen(false); // ปิด Modal เมื่อถึง 0
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer); // เคลียร์ interval เมื่อปิด Modal
  }, [open]);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome to Next.js Modal</DialogTitle>
            <DialogDescription>
              This is a sample modal using shadcn/ui.
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button variant="outline">Close in {countdown}</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
