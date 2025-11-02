"use client";
import { useState, useEffect } from "react";
import AdminNavbar from '@/components/AdminNavbar';
import '../../globals.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminNavbar />
      {children}
    </>
  );
} 