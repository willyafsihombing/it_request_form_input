'use client';

import { useState } from "react";
import { Pencil } from "lucide-react";
import Link from 'next/link';
import { useEffect } from "react";

export default function ResubmitButton({id, reqName}: {id: string, reqName: string}) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        try {
            const u = JSON.parse(localStorage.getItem('auth-user') || 'null');
            if (!u) return;
            const isStaff = u.role === 'admin' || u.role === 'staff';
            const mine = (u.fullName || '').trim().toUpperCase() === (reqName || '').trim().toUpperCase();
            setShow(isStaff || mine);
        } catch {}
    }, [reqName]);
    
    if (!show) return null;

    return (
        <Link 
            href={`/dashboard/requests/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
            <Pencil size={14} /> Edit &amp; Ajukan ulang
        </Link> 
    )
}