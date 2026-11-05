"use client";

import React from "react";
import { Bell, Menu, Download, Printer, ChevronRight } from "lucide-react";
import Image from "next/image";

interface HeaderProps {
  title: string;
  showHamburger?: boolean;
  onHamburgerClick?: () => void;
  breadcrumb?: React.ReactNode;
  showLaporanActions?: boolean;
}

export default function Header({ title, showHamburger, onHamburgerClick, breadcrumb, showLaporanActions }: HeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 sticky top-0 z-40 flex items-center justify-between px-5 md:px-8">
      <div className="flex items-center gap-3 min-w-0">
        {showHamburger && (
          <button
            onClick={onHamburgerClick}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 flex-shrink-0"
          >
            <Menu className="text-xl" />
          </button>
        )}
        {breadcrumb ? (
          <nav className="flex items-center gap-1.5 text-[13px] font-medium min-w-0 overflow-hidden">
            {breadcrumb}
          </nav>
        ) : (
          <nav className="flex items-center gap-1.5 text-[13px] font-medium min-w-0 overflow-hidden">
            {title.split(" > ").length > 1 ? (
              <>
                <span className="text-slate-400">{title.split(" > ")[0]}</span>
                <ChevronRight className="text-slate-300 text-[13px] flex-shrink-0" />
                <span className="text-zinc-900 font-semibold">{title.split(" > ")[1]}</span>
              </>
            ) : (
              <span className="text-zinc-900 font-semibold">{title}</span>
            )}
          </nav>
        )}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {showLaporanActions && (
          <div className="flex items-center gap-2">
            <button className="h-9 px-3 border border-slate-200 rounded-lg text-[12px] font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors">
              <Download className="text-[15px]" />
              Unduh PDF
            </button>
            <button className="h-9 px-3 border border-slate-200 rounded-lg text-[12px] font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors">
              <Printer className="text-[15px]" />
              Cetak
            </button>
          </div>
        )}
        {/* <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
          <Bell className="text-slate-500 text-lg" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center text-white text-[10px] font-bold">
          BS
        </div> */}
      </div>
    </header>
  );
}
