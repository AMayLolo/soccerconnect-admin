"use client";

import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "./SidebarNav";

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger className="p-2 hover:bg-accent rounded-md">
        <Menu size={22} />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <SidebarNav />
      </SheetContent>
    </Sheet>
  );
}
